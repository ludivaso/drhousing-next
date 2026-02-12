import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types';

// Map database row to Lead type
function mapDbToLead(row: any): Lead {
  return {
    id: row.id,
    leadType: row.lead_type as Lead['leadType'],
    fullName: row.full_name,
    email: row.email,
    phone: row.phone || '',
    preferredContactMethod: row.preferred_contact_method as Lead['preferredContactMethod'],
    countryOfOrigin: row.country_of_origin,
    timeline: row.timeline as Lead['timeline'],
    budgetMin: row.budget_min,
    budgetMax: row.budget_max,
    interestedAreas: row.interested_areas || [],
    interestedPropertyType: row.interested_property_type,
    propertyId: row.property_id,
    message: row.message,
    notes: row.notes,
    status: row.status as Lead['status'],
    assignedAgentId: row.assigned_agent_id,
    lastContactedAt: row.last_contacted_at,
    createdAt: row.created_at,
  };
}

// Map Lead to database format
function mapLeadToDb(lead: Partial<Lead>) {
  return {
    lead_type: lead.leadType,
    full_name: lead.fullName,
    email: lead.email,
    phone: lead.phone,
    preferred_contact_method: lead.preferredContactMethod,
    country_of_origin: lead.countryOfOrigin,
    timeline: lead.timeline,
    budget_min: lead.budgetMin,
    budget_max: lead.budgetMax,
    interested_areas: lead.interestedAreas,
    interested_property_type: lead.interestedPropertyType,
    property_id: lead.propertyId,
    message: lead.message,
    notes: lead.notes,
    status: lead.status,
    assigned_agent_id: lead.assignedAgentId,
    last_contacted_at: lead.lastContactedAt,
  };
}

export function useLeads() {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data.map(mapDbToLead);
    },
  });
}

/**
 * Hook for public lead submissions via rate-limited edge function.
 * Use this for public-facing contact forms (no authentication required).
 */
export function useSubmitPublicLead() {
  return useMutation({
    mutationFn: async (lead: Partial<Lead>) => {
      const response = await supabase.functions.invoke('submit-lead', {
        body: {
          email: lead.email,
          full_name: lead.fullName,
          phone: lead.phone || null,
          message: lead.message || null,
          lead_type: lead.leadType || 'general',
          preferred_contact_method: lead.preferredContactMethod || 'email',
          timeline: lead.timeline || 'exploring',
          country_of_origin: lead.countryOfOrigin || null,
          budget_min: lead.budgetMin || null,
          budget_max: lead.budgetMax || null,
          interested_areas: lead.interestedAreas || [],
          interested_property_type: lead.interestedPropertyType || null,
          property_id: lead.propertyId || null,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to submit lead');
      }

      const data = response.data;
      if (data?.error) {
        throw new Error(data.error);
      }

      return data;
    },
  });
}

/**
 * Hook for admin lead creation (requires authentication).
 * Use this only for authenticated admin users creating leads manually.
 */
export function useCreateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (lead: Partial<Lead>) => {
      const { data, error } = await supabase
        .from('leads')
        .insert(mapLeadToDb(lead))
        .select()
        .single();
      
      if (error) throw error;
      return mapDbToLead(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Lead> & { id: string }) => {
      // Get current lead to check if agent is being changed
      const { data: currentLead } = await supabase
        .from('leads')
        .select('assigned_agent_id')
        .eq('id', id)
        .single();

      const { data, error } = await supabase
        .from('leads')
        .update(mapLeadToDb(updates))
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // If agent assignment changed and new agent is assigned, send notification
      const newAgentId = updates.assignedAgentId;
      const previousAgentId = currentLead?.assigned_agent_id;
      
      if (newAgentId && newAgentId !== previousAgentId) {
        try {
          const dashboardUrl = window.location.origin;
          await supabase.functions.invoke('notify-lead-assignment', {
            body: {
              leadId: id,
              agentId: newAgentId,
              dashboardUrl,
            },
          });
          console.log('Lead assignment notification sent');
        } catch (notifyError) {
          console.error('Failed to send lead assignment notification:', notifyError);
          // Don't throw - the lead update succeeded, notification is secondary
        }
      }
      
      return mapDbToLead(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useLead(id: string | null) {
  return useQuery({
    queryKey: ['leads', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('leads')
        .select('*, properties(id, title, images)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return {
        ...mapDbToLead(data),
        property: data.properties,
      };
    },
    enabled: !!id,
  });
}
