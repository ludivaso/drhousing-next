import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone, Mail, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Nuestro Equipo | DR Housing',
  description: 'Conozca a nuestros asesores inmobiliarios expertos en propiedades de lujo en Costa Rica.',
}

// Static team members (will be supplemented with DB agents if table exists)
const staticAgents = [
  {
    id: 'dr',
    name: 'Diego Rojas',
    title: 'Fundador & Asesor Principal',
    bio: 'Más de 10 años especializados en propiedades de lujo en el Corredor Oeste. Experto en relocalización de familias internacionales y estructuración de inversiones inmobiliarias.',
    phone: '+506 8654 0888',
    email: 'diego@drhousing.net',
    specialties: ['Escazú', 'Santa Ana', 'Inversión', 'Relocalización'],
  },
]

export default async function AgentesPage() {
  // Try to load agents from DB; fall back to static data gracefully
  let agents = staticAgents
  try {
    const { data } = await (supabase as any).from('agents').select('*').eq('active', true)
    if (data && data.length > 0) agents = data
  } catch {
    // Table may not exist; use static data
  }

  return (
    <>
      {/* Header */}
      <section className="bg-forest-dark text-primary-foreground py-16">
        <div className="container-wide">
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold mb-4">
            Nuestro Equipo
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">
            Asesores especializados con conocimiento profundo del mercado inmobiliario
            de lujo en Costa Rica.
          </p>
        </div>
      </section>

      {/* Agents Grid */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {agents.map((agent: any) => (
              <div key={agent.id} className="card-elevated p-8">
                <div className="flex items-start gap-5 mb-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-serif text-2xl text-primary font-semibold">
                      {(agent.name ?? agent.full_name ?? 'A')[0]}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-semibold text-foreground">
                      {agent.name ?? agent.full_name}
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      {agent.title ?? agent.role ?? 'Asesor Inmobiliario'}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {agent.bio ?? agent.description ?? ''}
                </p>

                {agent.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {agent.specialties.map((s: string) => (
                      <span
                        key={s}
                        className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-col gap-2 text-sm">
                  {(agent.phone ?? agent.phone_number) && (
                    <a
                      href={`tel:${(agent.phone ?? agent.phone_number).replace(/\s/g, '')}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      {agent.phone ?? agent.phone_number}
                    </a>
                  )}
                  {agent.email && (
                    <a
                      href={`mailto:${agent.email}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="w-4 h-4" />
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
            Únase a Nuestro Equipo
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            ¿Es usted un profesional inmobiliario apasionado por el mercado de lujo en Costa Rica?
            Nos gustaría conocerle.
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
