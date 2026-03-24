import type { Metadata } from 'next'
import { getAgents } from '@/lib/supabase/queries'
import AgentesClient from './AgentesClient'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Our Advisors | DR Housing',
  description: 'Meet our real estate advisors specialized in luxury properties in Costa Rica.',
}

export default async function AgentesPage() {
  const agents = await getAgents()
  return <AgentesClient agents={agents} />
}
