import type { Metadata } from 'next'
import { getAgents } from '@/lib/supabase/queries'
import AgentesClient from './AgentesClient'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const lang = params.lang === 'es' ? 'es' : 'en'
  return {
    title: lang === 'es' ? 'Nuestros Asesores' : 'Our Advisors',
    description: lang === 'es'
      ? 'Conoce a nuestros asesores inmobiliarios especializados en propiedades de lujo en Costa Rica.'
      : 'Meet our real estate advisors specialized in luxury properties in Costa Rica.',
    alternates: {
      canonical: `https://drhousing.net/${lang}/agents`,
      languages: {
        'en':        'https://drhousing.net/en/agents',
        'es':        'https://drhousing.net/es/agents',
        'x-default': 'https://drhousing.net/en/agents',
      },
    },
    robots: { index: true, follow: true },
  }
}

export default async function AgentesPage({ params }: { params: { lang: string } }) {
  const lang = params.lang === 'es' ? 'es' : 'en'
  const agents = await getAgents()
  return <AgentesClient agents={agents} lang={lang} />
}
