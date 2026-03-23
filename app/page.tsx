import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, Users, HomeIcon, Sparkles } from 'lucide-react'
import { getFeaturedProperties } from '@/lib/supabase/queries'
import PropertyCard from '@/components/PropertyCard'
import WhatsAppCTA from '@/components/WhatsAppCTA'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'DR Housing | Luxury Real Estate Escazú · Santa Ana · Costa Rica',
  description:
    'Premium luxury homes and investment properties in Escazú, Santa Ana and the Ruta 27 corridor. Expert advisory for international buyers.',
  openGraph: {
    title: 'DR Housing | Luxury Real Estate Costa Rica',
    description:
      'Premium luxury homes and investment properties in Escazú, Santa Ana and the Ruta 27 corridor.',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630 }],
    type: 'website',
  },
}

const HOW_WE_HELP = [
  { icon: HomeIcon,    title: 'Compra & Venta',          href: '/servicios', description: 'Asesoría completa para adquirir o vender propiedades de lujo en el corredor occidental de Costa Rica.' },
  { icon: ShieldCheck, title: 'Legal & Migración',        href: '/servicios', description: 'Due diligence, escrituración y gestión migratoria para residentes extranjeros.' },
  { icon: Sparkles,    title: 'Diseño & Remodelación',    href: '/servicios', description: 'Transformamos propiedades con diseño de interiores funcional y de alto nivel.' },
  { icon: Users,       title: 'Relocalización Familiar',  href: '/servicios', description: 'Orientación integral para familias que se mudan a Costa Rica: colegios, comunidad y estilo de vida.' },
  { icon: HomeIcon,    title: 'Administración',           href: '/servicios', description: 'Gestión profesional de propiedades en alquiler: cobranza, mantenimiento y reportes.' },
  { icon: Sparkles,    title: 'Inversión & Preventa',     href: '/desarrollos', description: 'Acceso exclusivo a proyectos en preventa con alto potencial de plusvalía.' },
]

const TRUST_POINTS = [
  { icon: ShieldCheck, title: 'Red Privada de Listados',  description: 'Acceso a propiedades exclusivas que nunca aparecen en portales públicos.' },
  { icon: Users,       title: 'Equipo Multidisciplinario', description: 'Agentes, abogados, diseñadores y especialistas en migración bajo un mismo techo.' },
  { icon: HomeIcon,    title: 'Profundo Conocimiento Local', description: 'Más de una década de experiencia en el mercado del corredor Ruta 27.' },
  { icon: Sparkles,    title: 'Servicio White Glove',     description: 'Acompañamiento personalizado desde la búsqueda hasta el cierre y la mudanza.' },
]

export default async function HomePage() {
  const featured = await getFeaturedProperties()

  return (
    <main className="min-h-screen bg-background">

      {/* ── 1. HERO — minHeight: 85vh, matches VideoHero from Lovable ── */}
      <section
        className="relative flex items-center overflow-hidden bg-[#2C2C2C] text-white"
        style={{ minHeight: '85vh' }}
      >
        {/* Grid pattern overlay — exact from VideoHero (opacity-[0.03]) */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, hsl(0 0% 10% / 0.82), hsl(0 0% 17% / 0.7))',
          }}
        />

        <div className="container-wide relative z-10 py-24">
          <div className="max-w-2xl">

            {/* Badge — exact: border border-gold/40 text-gold text-xs tracking-widest uppercase */}
            <span
              className="inline-block px-4 py-1.5 border text-xs tracking-widest uppercase mb-8 animate-fade-in"
              style={{ borderColor: 'rgba(201,169,110,0.4)', color: '#C9A96E' }}
            >
              Escazú · Santa Ana · Costa Rica
            </span>

            {/* H1 — exact: font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-medium leading-[1.15] */}
            <h1
              className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-medium text-white leading-[1.15] mb-8 animate-slide-up"
            >
              Propiedades de Lujo en el{' '}
              <span style={{ color: '#C9A96E' }}>Corredor Oeste</span>
            </h1>

            {/* Sub — exact: text-lg text-primary-foreground/70 leading-relaxed mb-12 */}
            <p
              className="text-lg leading-relaxed mb-12 max-w-xl animate-slide-up"
              style={{ color: 'rgba(245,242,238,0.7)', animationDelay: '0.1s' }}
            >
              Asesoría experta para compradores internacionales e inversionistas.
              Acceso a propiedades exclusivas en Escazú, Santa Ana y la Ruta 27.
            </p>

            {/* CTA — exact: bg-transparent border border-primary-foreground/40 hover:bg-primary-foreground/10 */}
            <div
              className="flex flex-col sm:flex-row gap-4 animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              <a
                href="https://wa.me/50686540888?text=Hola,%20me%20gustaría%20agendar%20una%20consulta%20estratégica."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 font-sans font-medium px-8 py-4 rounded border text-white transition-colors hover:bg-white/10"
                style={{ borderColor: 'rgba(245,242,238,0.4)' }}
              >
                Agendar Consulta Privada
              </a>
              <Link
                href="/property"
                className="inline-flex items-center justify-center gap-2 font-sans font-medium px-8 py-4 rounded transition-colors"
                style={{ color: '#C9A96E', border: '1px solid rgba(201,169,110,0.4)' }}
              >
                Ver Propiedades <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Service links strip — exact: flex flex-wrap gap-8 mt-16 pt-8 border-t */}
            <div
              className="flex flex-wrap gap-8 mt-16 pt-8"
              style={{ borderTop: '1px solid rgba(245,242,238,0.1)' }}
            >
              {['Relocalización', 'Asesoría Legal', 'Desarrollos', 'Administración'].map((s) => (
                <Link
                  key={s}
                  href="/servicios"
                  className="text-xs tracking-wide uppercase transition-colors"
                  style={{ color: 'rgba(245,242,238,0.5)' }}
                >
                  {s} →
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. FEATURED PROPERTIES — section-padding bg-background, grid sm:grid-cols-2 ── */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-foreground mb-2">
              Propiedades Destacadas
            </h2>
            <p className="text-sm text-muted-foreground font-sans">
              Selección exclusiva curada por nuestro equipo
            </p>
          </div>

          {featured.length === 0 ? (
            <p className="text-center text-muted-foreground font-sans py-12">
              No hay propiedades destacadas en este momento.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {featured.slice(0, 4).map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              href="/property"
              className="inline-flex items-center gap-2 font-sans font-medium bg-primary text-primary-foreground px-10 py-3 rounded hover:bg-primary/90 transition-colors"
            >
              Ver Todas las Propiedades <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 3. HOW WE HELP — section-padding bg-secondary, card-elevated p-8 text-center ── */}
      <section className="section-padding bg-secondary">
        <div className="container-wide">
          <div className="text-center mb-14">
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-foreground mb-4">
              Cómo Podemos Ayudarle
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed font-sans">
              Un equipo multidisciplinario para cada etapa de su proceso inmobiliario en Costa Rica.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {HOW_WE_HELP.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="card-elevated p-8 text-center hover:border-primary/30"
              >
                {/* Icon circle — exact: w-12 h-12 rounded-full bg-primary/10 */}
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-serif text-base font-medium text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. TRUST SECTION — section-padding bg-background, 2-col grid ── */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: text content */}
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-foreground mb-6">
                Por Qué las Familias Confían en DR Housing
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-10 text-sm font-sans">
                Más que una agencia inmobiliaria — somos su socio estratégico para una vida mejor
                en Costa Rica. Desde la búsqueda hasta el cierre y más allá.
              </p>

              {/* Trust points — exact: space-y-8, flex gap-4, w-10 h-10 rounded bg-muted */}
              <div className="space-y-8">
                {TRUST_POINTS.map((point) => (
                  <div key={point.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <point.icon className="w-4 h-4 text-foreground/70" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground text-sm mb-1 font-sans">
                        {point.title}
                      </h4>
                      <p className="text-sm text-muted-foreground font-sans">
                        {point.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: market stats card */}
            <div className="hidden lg:block">
              <div className="card-elevated p-10 rounded-lg">
                <p className="text-xs font-sans text-muted-foreground uppercase tracking-widest mb-6">
                  Corredor Ruta 27
                </p>
                <h3 className="font-serif text-xl font-medium text-foreground mb-6">
                  El mercado de mayor plusvalía en el GAM occidental
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { value: '82+', label: 'Propiedades activas' },
                    { value: '10+', label: 'Años de experiencia' },
                    { value: '100%', label: 'Enfoque en calidad' },
                    { value: 'GAM', label: 'Corredor occidental' },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="font-serif text-3xl font-semibold" style={{ color: '#C9A96E' }}>
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground font-sans mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. CONTACT STRIP — bg-forest-dark py-16, exact from Lovable ── */}
      <section className="py-16" style={{ backgroundColor: '#2C2C2C' }}>
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="font-serif text-xl font-medium text-white mb-2">
                ¿Listo para encontrar su propiedad en Costa Rica?
              </h3>
              <p className="text-sm font-sans" style={{ color: 'rgba(245,242,238,0.6)' }}>
                Inicie su proceso hoy con una consulta estratégica.
              </p>
            </div>
            <a
              href="https://wa.me/50686540888?text=Hola,%20me%20gustaría%20agendar%20una%20consulta%20estratégica%20con%20DR%20Housing."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-sans font-medium px-8 py-4 rounded border text-white transition-colors shrink-0"
              style={{ borderColor: 'rgba(245,242,238,0.4)' }}
            >
              Agendar Consulta Privada
            </a>
          </div>
        </div>
      </section>

    </main>
  )
}
