'use client'

import Image from 'next/image'
import { Phone, Mail, MapPin, Languages } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'
import type { AgentRow } from '@/lib/supabase/queries'

export default function AgentesClient({ agents }: { agents: AgentRow[] }) {
  const { t } = useI18n()

  return (
    <>
      {/* Header */}
      <section className="bg-forest-dark text-primary-foreground py-16">
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
            {agents.map((agent) => (
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
                      {agent.full_name}
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      {agent.role}
                    </p>
                  </div>
                </div>

                {agent.bio && (
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-5">
                    {agent.bio}
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
                        {area}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-col gap-2 text-sm">
                  {/* Languages */}
                  {agent.languages && agent.languages.length > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Languages className="w-4 h-4 flex-shrink-0" />
                      <span>{agent.languages.join(' · ')}</span>
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
