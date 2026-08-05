import { supabase } from '@/lib/supabase/client'
import type { AgentRow } from '@/src/integrations/supabase/types'

export type { AgentRow }

/** Published team members only, ordered for public display. */
export async function getTeamAgents(): Promise<AgentRow[]> {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('is_team_member', true)
    .not('slug', 'is', null)
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('full_name', { ascending: true })

  if (error) {
    console.error('getTeamAgents error:', error.message)
    return []
  }
  return data ?? []
}

/** Single published advisor by slug — is_team_member is always the first filter. */
export async function getAgentBySlug(slug: string): Promise<AgentRow | null> {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('is_team_member', true)
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    console.error('getAgentBySlug error:', error.message)
    return null
  }
  return data
}

/** Count of active public listings assigned to this advisor — drives the "View properties" button. */
export async function getAgentActiveListingsCount(agentId: string): Promise<number> {
  const { count, error } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('listing_agent_id', agentId)
    .eq('hidden', false)
    .or('visibility.eq.public,visibility.is.null')

  if (error) {
    console.error('getAgentActiveListingsCount error:', error.message)
    return 0
  }
  return count ?? 0
}
