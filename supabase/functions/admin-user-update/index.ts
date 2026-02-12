import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to log admin actions
async function logAuditAction(
  adminClient: SupabaseClient,
  adminUserId: string,
  action: string,
  targetType: string,
  targetId: string | null,
  targetName: string | null,
  details: Record<string, unknown> | null,
  ipAddress: string | null
) {
  try {
    await adminClient.from("admin_audit_logs").insert({
      admin_user_id: adminUserId,
      action,
      target_type: targetType,
      target_id: targetId,
      target_name: targetName,
      details,
      ip_address: ipAddress,
    });
  } catch (error) {
    console.error("Failed to log audit action:", error);
    // Don't throw - logging failure shouldn't break the main operation
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the caller is authenticated and is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Create client with user's token to verify they're an admin
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: callerUser }, error: userError } = await userClient.auth.getUser();
    if (userError || !callerUser) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if caller is admin using the database function
    const { data: isAdmin } = await userClient.rpc("is_admin");
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { action, userId, data } = await req.json();

    // Create admin client with service role for privileged operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get IP address for logging
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0] || 
                      req.headers.get("x-real-ip") || 
                      null;

    // Get target user info for logging
    let targetUserName: string | null = null;
    let targetUserEmail: string | null = null;
    if (userId) {
      const { data: targetProfile } = await adminClient
        .from("profiles")
        .select("full_name, email")
        .eq("user_id", userId)
        .single();
      
      if (targetProfile) {
        targetUserName = targetProfile.full_name || targetProfile.email;
        targetUserEmail = targetProfile.email;
      }
    }

    let result;

    switch (action) {
      case "updateProfile": {
        // Update the profile in the profiles table
        const { error: profileError } = await adminClient
          .from("profiles")
          .update({
            full_name: data.fullName,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (profileError) {
          throw new Error(`Failed to update profile: ${profileError.message}`);
        }

        // Log the action
        await logAuditAction(
          adminClient,
          callerUser.id,
          "user.profile.update",
          "user",
          userId,
          targetUserName,
          { field: "fullName", newValue: data.fullName },
          ipAddress
        );

        result = { success: true, message: "Profile updated successfully" };
        break;
      }

      case "updateEmail": {
        const oldEmail = targetUserEmail;

        // Update email in both auth and profiles
        const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
          email: data.email,
        });

        if (authError) {
          throw new Error(`Failed to update email: ${authError.message}`);
        }

        // Also update in profiles table
        await adminClient
          .from("profiles")
          .update({
            email: data.email,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        // Log the action
        await logAuditAction(
          adminClient,
          callerUser.id,
          "user.email.update",
          "user",
          userId,
          targetUserName,
          { oldEmail, newEmail: data.email },
          ipAddress
        );

        result = { success: true, message: "Email updated successfully" };
        break;
      }

      case "sendPasswordReset": {
        // Get user email first
        const { data: userData, error: getUserError } = await adminClient.auth.admin.getUserById(userId);
        
        if (getUserError || !userData.user?.email) {
          throw new Error("Could not find user email");
        }

        // Send password reset email
        const { error: resetError } = await adminClient.auth.resetPasswordForEmail(
          userData.user.email,
          { redirectTo: `${req.headers.get("origin")}/admin/login` }
        );

        if (resetError) {
          throw new Error(`Failed to send password reset: ${resetError.message}`);
        }

        // Log the action
        await logAuditAction(
          adminClient,
          callerUser.id,
          "user.password.reset_sent",
          "user",
          userId,
          targetUserName,
          { email: userData.user.email },
          ipAddress
        );

        result = { success: true, message: "Password reset email sent" };
        break;
      }

      case "deleteUser": {
        // Prevent self-deletion
        if (userId === callerUser.id) {
          throw new Error("Cannot delete your own account");
        }

        // Store target info before deletion for logging
        const deletedUserName = targetUserName;
        const deletedUserEmail = targetUserEmail;

        // Delete user roles first
        await adminClient
          .from("user_roles")
          .delete()
          .eq("user_id", userId);

        // Delete user profile
        await adminClient
          .from("profiles")
          .delete()
          .eq("user_id", userId);

        // Delete from auth.users (this is the main deletion)
        const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

        if (deleteError) {
          throw new Error(`Failed to delete user: ${deleteError.message}`);
        }

        // Log the action
        await logAuditAction(
          adminClient,
          callerUser.id,
          "user.delete",
          "user",
          userId,
          deletedUserName,
          { email: deletedUserEmail },
          ipAddress
        );

        result = { success: true, message: "User deleted successfully" };
        break;
      }

      case "createUser": {
        // Create a new user via Admin API
        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
          email: data.email,
          password: data.password,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            full_name: data.fullName || '',
          },
        });

        if (createError) {
          throw new Error(`Failed to create user: ${createError.message}`);
        }

        // The profile is auto-created via the handle_new_user trigger
        // But we may need to update the full_name if provided
        if (data.fullName && newUser.user) {
          await adminClient
            .from("profiles")
            .update({ full_name: data.fullName })
            .eq("user_id", newUser.user.id);
        }

        // Assign role if provided (default to 'user' if not specified)
        if (newUser.user && data.role) {
          const { error: roleError } = await adminClient
            .from("user_roles")
            .insert({ user_id: newUser.user.id, role: data.role });
          
          if (roleError) {
            console.error("Failed to assign role:", roleError);
            // Don't throw - user is created, role assignment is secondary
          }
        }

        // Log the action
        await logAuditAction(
          adminClient,
          callerUser.id,
          "user.create",
          "user",
          newUser.user?.id || null,
          data.fullName || data.email,
          { email: data.email, role: data.role || 'none' },
          ipAddress
        );

        result = { success: true, message: "User created successfully", userId: newUser.user?.id };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in admin-user-update:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});