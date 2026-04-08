import type { Metadata } from 'next'
import { getAgents } from '@/lib/supabase/queries'
import AgentesClient from './AgentesClient'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Our Advisors',
  description: 'Meet our real estate advisors specialized in luxury properties in Costa Rica.',
}

export default async function AgentesPage({ params }: { params: { lang: string } }) {
  const lang = params.lang === 'es' ? 'es' : 'en'
  const agents = await getAgents()
  return <AgentesClient agents={agents} lang={lang} />
}
