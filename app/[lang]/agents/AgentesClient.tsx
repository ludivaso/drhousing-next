'use client'

import { useEffect, useMemo } from 'react'
import Image from 'next/image'
import { Phone, Mail, Languages } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'
import { translateBio } from '@/lib/i18n/agent-bios-es'
import type { AgentRow } from '@/lib/supabase/queries'

// ── Sort: co-founders pinned to top ──────────────────────────────────────────
// Rank 0: primary Founder (Diego), Rank 1: Co-Founder (Paola), Rank 99: rest.
// Uses role text so it keeps working if new agents are added with the same
// role titles — and falls back to full_name for belt-and-suspenders matching.
function founderRank(agent: AgentRow): number {
  const role = (agent.role ?? '').toLowerCase()
  const name = (agent.full_name ?? '').toLowerCase()
  // Primary founder: matches "founder" but not "co-founder"
  if (/(^|[^-])\bfounder\b/.test(role) || name.includes('diego vargas')) return 0
  // Co-founder
  if (/co-?founder/.test(role) || name.includes('paola morales')) return 1
  return 99
}

function sortByFounder(agents: AgentRow[]): AgentRow[] {
  // Stable sort: preserve original DB order within the same rank bucket.
  return agents
    .map((a, i) => ({ a, i, r: founderRank(a) }))
    .sort((x, y) => (x.r - y.r) || (x.i - y.i))
    .map((e) => e.a)
}

// ── Spanish translations for DB-English fields ───────────────────────────────
// The agents table is English-only (no role_es / bio_es). These maps translate
// the short structural fields (role, languages, service areas). Bio prose is
// left in English until a bio_es column is added to the schema.
const ROLE_ES: Record<string, string> = {
  'Founder, CEO & Broker of Record':       'Fundador, CEO y Corredor Autorizado',
  'Co-Founder & Managing Director':        'Cofundadora y Directora General',
  'Managing Director':                     'Directora General',
  'Client Relations & Sales Manager':      'Gerente de Relaciones con Clientes y Ventas',
  'Marketing & Brand Director':            'Directora de Marketing y Marca',
  'Technical & Infrastructure Consultant': 'Consultor Técnico y de Infraestructura',
  'Broker of Record':                      'Corredor Autorizado',
  'Sales Agent':                           'Agente de Ventas',
  'Real Estate Agent':                     'Agente Inmobiliario',
}

const LANGUAGE_ES: Record<string, string> = {
  'English':    'Inglés',
  'Spanish':    'Español',
  'Portuguese': 'Portugués',
  'French':     'Francés',
  'Italian':    'Italiano',
  'German':     'Alemán',
}

const SERVICE_AREA_ES: Record<string, string> = {
  'All Costa Rica': 'Todo Costa Rica',
  // Most place names (Escazú, Santa Ana, Heredia, etc.) are identical in ES.
}

function translateRole(role: string | null | undefined, lang: 'es' | 'en'): string {
  if (!role) return ''
  if (lang === 'en') return role
  return ROLE_ES[role.trim()] ?? role
}

function translateLanguage(l: string, lang: 'es' | 'en'): string {
  if (lang === 'en') return l
  return LANGUAGE_ES[l] ?? l
}

function translateServiceArea(a: string, lang: 'es' | 'en'): string {
  if (lang === 'en') return a
  return SERVICE_AREA_ES[a] ?? a
}

export default function AgentesClient({ agents, lang }: { agents: AgentRow[]; lang: 'es' | 'en' }) {
  const { t, setLang } = useI18n()

  useEffect(() => {
    setLang(lang)
  }, [lang, setLang])

  const sortedAgents = useMemo(() => sortByFounder(agents), [agents])

  return (
    <>
      {/* Header */}
      <section className="bg-[#2C2C2C] text-white py-16">
        <div className="container-wide">
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold mb-4">
            {t('agents.title')}
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">
            {t('agents.description')}
          </p>
        </div>
      </section>

      {/* Agents Grid */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sortedAgents.map((agent) => (
              <div key={agent.id} className="card-elevated p-8">
                <div className="flex items-start gap-5 mb-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {agent.photo_url ? (
                      <Image
                        src={agent.photo_url}
                        alt={agent.full_name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="font-serif text-2xl text-primary font-semibold">
                        {agent.full_name[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-semibold text-foreground">
                      {agent.full_name.trim()}
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      {translateRole(agent.role, lang)}
                    </p>
                  </div>
                </div>

                {agent.bio && (
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-5 whitespace-pre-line">
                    {translateBio(agent.id, agent.bio, lang)}
                  </p>
                )}

                {/* Service areas */}
                {agent.service_areas && agent.service_areas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {agent.service_areas.map((area) => (
                      <span
                        key={area}
                        className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                      >
                        {translateServiceArea(area, lang)}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-col gap-2 text-sm">
                  {/* Languages */}
                  {agent.languages && agent.languages.length > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Languages className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {agent.languages.map((l) => translateLanguage(l, lang)).join(' · ')}
                      </span>
                    </div>
                  )}

                  {agent.phone && (
                    <a
                      href={`tel:${agent.phone.replace(/\s|-/g, '')}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      {agent.phone}
                    </a>
                  )}
                  {agent.email && (
                    <a
                      href={`mailto:${agent.email}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      {agent.email}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Team CTA */}
      <section className="bg-secondary py-16">
        <div className="container-wide text-center">
          <h2 className="font-serif text-3xl font-semibold text-foreground mb-4">
            {t('agents.joinTeam')}
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            {t('agents.joinTeamDesc')}
          </p>
          <a
            href="mailto:careers@drhousing.net"
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            careers@drhousing.net
          </a>
        </div>
      </section>
    </>
  )
}
