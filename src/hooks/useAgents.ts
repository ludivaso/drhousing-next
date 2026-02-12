import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Agent } from '@/types';

// Map database row to Agent type
function mapDbToAgent(row: any): Agent {
  return {
    id: row.id,
    fullName: row.full_name,
    role: row.role as Agent['role'],
    bio: row.bio || '',
    phone: row.phone || '',
    email: row.email || '',
    photoUrl: row.photo_url,
    languages: row.languages || [],
    serviceAreas: row.service_areas || [],
    activePropertyIds: [], // Will be computed from properties if needed
  };
}

// Map Agent to database format
function mapAgentToDb(agent: Partial<Agent>) {
  return {
    full_name: agent.fullName,
    role: agent.role,
    bio: agent.bio,
    phone: agent.phone,
    email: agent.email,
    photo_url: agent.photoUrl,
    languages: agent.languages,
    service_areas: agent.serviceAreas,
  };
}

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('full_name');
      
      if (error) throw error;
      return data.map(mapDbToAgent);
    },
  });
}

// Check if id looks like a valid UUID
function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// Legacy ID to agent name mapping for backwards compatibility
const LEGACY_AGENT_MAP: Record<string, string> = {
  'agent-1': 'María Elena Vargas',
  'agent-2': 'Carlos Jiménez',
  'agent-3': 'Ana Lucía Montenegro',
  'agent-4': 'Roberto Solano',
};

export function useAgent(id: string | undefined) {
  return useQuery({
    queryKey: ['agent', id],
    queryFn: async () => {
      if (!id) return null;

      // If it's a legacy ID, find agent by name
      if (!isValidUUID(id) && LEGACY_AGENT_MAP[id]) {
        const legacyName = LEGACY_AGENT_MAP[id];
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .ilike('full_name', legacyName)
          .maybeSingle();
        
        if (error) throw error;
        return data ? mapDbToAgent(data) : null;
      }

      // If it's not a valid UUID and not a known legacy ID, return null
      if (!isValidUUID(id)) {
        return null;
      }

      // Normal UUID lookup
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data ? mapDbToAgent(data) : null;
    },
    enabled: !!id,
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (agent: Partial<Agent>) => {
      const { data, error } = await supabase
        .from('agents')
        .insert(mapAgentToDb(agent))
        .select()
        .single();
      
      if (error) throw error;
      return mapDbToAgent(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...agent }: Partial<Agent> & { id: string }) => {
      const { data, error } = await supabase
        .from('agents')
        .update(mapAgentToDb(agent))
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return mapDbToAgent(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agent', variables.id] });
    },
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}
