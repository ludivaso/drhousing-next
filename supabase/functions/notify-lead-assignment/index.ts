import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotifyLeadRequest {
  leadId: string;
  agentId: string;
  dashboardUrl: string;
}

// Timeline labels
const TIMELINE_LABELS: Record<string, string> = {
  asap: "As soon as possible",
  "1_3_months": "1-3 months",
  "3_6_months": "3-6 months",
  "6_12_months": "6-12 months",
  exploring: "Just exploring",
};

// Lead type labels
const LEAD_TYPE_LABELS: Record<string, string> = {
  relocation: "Family Relocation",
  investor: "Investment Advisory",
  property_management: "Property Oversight",
  development: "Development & Remodeling",
  legal_immigration: "Legal & Residency",
  family_affairs: "Private Advisory",
  general: "General Inquiry",
};

// Format budget
const formatBudget = (min: number | null, max: number | null): string => {
  if (!min && !max) return "Not specified";
  if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  if (min) return `From $${min.toLocaleString()}`;
  return `Up to $${max?.toLocaleString()}`;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { leadId, agentId, dashboardUrl }: NotifyLeadRequest = await req.json();

    // Validate required fields
    if (!leadId || !agentId || !dashboardUrl) {
      throw new Error("Missing required fields: leadId, agentId, dashboardUrl");
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch lead details
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .single();

    if (leadError || !lead) {
      throw new Error(`Lead not found: ${leadError?.message || "Unknown error"}`);
    }

    // Fetch agent details
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("*")
      .eq("id", agentId)
      .single();

    if (agentError || !agent) {
      throw new Error(`Agent not found: ${agentError?.message || "Unknown error"}`);
    }

    // Check if agent has an email
    if (!agent.email) {
      console.log(`Agent ${agent.full_name} has no email configured, skipping notification`);
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "No email configured" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Build email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1a365d 0%, #2d5282 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }
          .lead-card { background: white; border-radius: 8px; padding: 20px; margin: 15px 0; border: 1px solid #e2e8f0; }
          .lead-name { font-size: 20px; font-weight: 600; color: #1a365d; margin-bottom: 10px; }
          .info-row { display: flex; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
          .info-label { color: #64748b; width: 140px; flex-shrink: 0; }
          .info-value { color: #334155; font-weight: 500; }
          .message-box { background: #f1f5f9; border-radius: 6px; padding: 15px; margin-top: 15px; }
          .cta-button { display: inline-block; background: #1a365d; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏠 New Lead Assigned</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${agent.full_name}</strong>,</p>
            <p>A new lead has been assigned to you. Here are the details:</p>
            
            <div class="lead-card">
              <div class="lead-name">${lead.full_name}</div>
              
              <div class="info-row">
                <span class="info-label">📧 Email:</span>
                <span class="info-value"><a href="mailto:${lead.email}">${lead.email}</a></span>
              </div>
              
              ${lead.phone ? `
              <div class="info-row">
                <span class="info-label">📱 Phone:</span>
                <span class="info-value"><a href="tel:${lead.phone}">${lead.phone}</a></span>
              </div>
              ` : ""}
              
              <div class="info-row">
                <span class="info-label">🏷️ Lead Type:</span>
                <span class="info-value">${LEAD_TYPE_LABELS[lead.lead_type] || lead.lead_type}</span>
              </div>
              
              <div class="info-row">
                <span class="info-label">⏰ Timeline:</span>
                <span class="info-value">${TIMELINE_LABELS[lead.timeline] || lead.timeline}</span>
              </div>
              
              <div class="info-row">
                <span class="info-label">💰 Budget:</span>
                <span class="info-value">${formatBudget(lead.budget_min, lead.budget_max)}</span>
              </div>
              
              ${lead.country_of_origin ? `
              <div class="info-row">
                <span class="info-label">🌍 Country:</span>
                <span class="info-value">${lead.country_of_origin}</span>
              </div>
              ` : ""}
              
              ${lead.interested_areas?.length > 0 ? `
              <div class="info-row">
                <span class="info-label">📍 Areas:</span>
                <span class="info-value">${lead.interested_areas.join(", ")}</span>
              </div>
              ` : ""}
              
              ${lead.message ? `
              <div class="message-box">
                <strong>Message:</strong><br>
                ${lead.message}
              </div>
              ` : ""}
            </div>
            
            <center>
              <a href="${dashboardUrl}/admin/leads" class="cta-button">View All Leads →</a>
            </center>
          </div>
          <div class="footer">
            <p>This is an automated notification from DR Housing CRM.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email via Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "DR Housing <onboarding@resend.dev>",
        to: [agent.email],
        subject: "New Lead Assigned to You",
        html: emailHtml,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", emailData);
      throw new Error(`Failed to send email: ${JSON.stringify(emailData)}`);
    }

    console.log("Lead assignment email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, emailId: emailData.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error in notify-lead-assignment function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
