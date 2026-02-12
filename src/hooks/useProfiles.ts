import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import type { AppRole } from './useAuth';

export interface Profile {
  id: string;
  userId: string;
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
  languagePreference: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithRole extends Profile {
  roles: string[];
}

function mapDbToProfile(row: any): Profile {
  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email,
    avatarUrl: row.avatar_url,
    languagePreference: row.language_preference,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Get current user's profile
export function useCurrentProfile() {
  return useQuery({
    queryKey: ['currentProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No profile found
        throw error;
      }
      return mapDbToProfile(data);
    },
  });
}

// Get current user's roles
export function useCurrentUserRoles() {
  return useQuery({
    queryKey: ['currentUserRoles'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;
      return data.map((r) => r.role);
    },
  });
}

// Admin: Get all profiles with roles
export function useAllProfiles() {
  return useQuery({
    queryKey: ['allProfiles'],
    queryFn: async () => {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get all roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Map roles to profiles
      const rolesByUser = roles.reduce((acc, r) => {
        if (!acc[r.user_id]) acc[r.user_id] = [];
        acc[r.user_id].push(r.role);
        return acc;
      }, {} as Record<string, string[]>);

      return profiles.map((p) => ({
        ...mapDbToProfile(p),
        roles: rolesByUser[p.user_id] || [],
      })) as UserWithRole[];
    },
  });
}

// Update current user's profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<{
      fullName: string | null;
      avatarUrl: string | null;
      languagePreference: string | null;
    }>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.fullName,
          avatar_url: updates.avatarUrl,
          language_preference: updates.languagePreference,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return mapDbToProfile(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentProfile'] });
    },
  });
}

// Admin: Add role to user
export function useAddUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role, targetName }: { userId: string; role: AppRole; targetName?: string }) => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (error) {
        if (error.code === '23505') {
          throw new Error('User already has this role');
        }
        throw error;
      }

      // Log the action
      if (currentUser) {
        await supabase.from('admin_audit_logs').insert([{
          admin_user_id: currentUser.id,
          action: 'user.role.add',
          target_type: 'user',
          target_id: userId,
          target_name: targetName || null,
          details: { role } as Json,
        }]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    },
  });
}

// Admin: Remove role from user
export function useRemoveUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role, targetName }: { userId: string; role: AppRole; targetName?: string }) => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;

      // Log the action
      if (currentUser) {
        await supabase.from('admin_audit_logs').insert([{
          admin_user_id: currentUser.id,
          action: 'user.role.remove',
          target_type: 'user',
          target_id: userId,
          target_name: targetName || null,
          details: { role } as Json,
        }]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    },
  });
}

// Admin: Update user profile (name, email)
export function useAdminUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      action, 
      data 
    }: { 
      userId: string; 
      action: 'updateProfile' | 'updateEmail' | 'sendPasswordReset' | 'deleteUser'; 
      data?: { fullName?: string; email?: string } 
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-user-update`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ action, userId, data }),
        }
      );

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update user');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allProfiles'] });
    },
  });
}

// Admin: Delete user account
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-user-update`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ action: 'deleteUser', userId }),
        }
      );

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    },
  });
}

// Admin: Create new user account
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      email, 
      password, 
      fullName,
      role 
    }: { 
      email: string; 
      password: string; 
      fullName?: string;
      role?: AppRole;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-user-update`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ 
            action: 'createUser', 
            data: { email, password, fullName, role } 
          }),
        }
      );

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    },
  });
}
