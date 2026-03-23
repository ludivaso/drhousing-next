import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Shield,
  MapPin,
  Users,
  Briefcase,
  Building2,
  Scale,
  HomeIcon,
  Sparkles,
  Palette,
} from 'lucide-react'
import ListingBrief from '@/components/ListingBrief'
import { getFeaturedProperties } from '@/lib/supabase/queries'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'DR Housing | Luxury Real Estate Escazú · Santa Ana · Costa Rica',
  description:
    'Propiedades de lujo y asesoría experta en Escazú, Santa Ana y el Corredor Ruta 27. Su socio de confianza para compradores internacionales e inversionistas.',
}

const howWeHelp = [
  {
    icon: HomeIcon,
    title: 'Corretaje Inmobiliario',
    description: 'Compra y venta de propiedades residenciales y comerciales premium en el Corredor Oeste.',
    href: '/property',
  },
  {
    icon: Scale,
    title: 'Legal e Inmigración',
    description: 'Asesoría legal completa, contratos, residencia y trámites migratorios.',
    href: '/servicios',
  },
  {
    icon: Building2,
    title: 'Desarrollos',
    description: 'Proyectos de construcción, remodelación y diseño a medida.',
    href: '/desarrollos',
  },
  {
    icon: Palette,
    title: 'Diseño de Interiores',
    description: 'Espacios de lujo diseñados para maximizar valor y estilo de vida.',
    href: '/servicios',
  },
  {
    icon: Briefcase,
    title: 'Administración de Propiedades',
    description: 'Gestión integral de propiedades en alquiler: huéspedes, mantenimiento y rentabilidad.',
    href: '/servicios',
  },
  {
    icon: Sparkles,
    title: 'Family Affairs',
    description: 'Asesoría privada e integral para familias que se relocalizan en Costa Rica.',
    href: '/family-affairs',
    dimmed: true,
  },
]

const trustPoints = [
  {
    icon: Shield,
    title: '+10 años de experiencia',
    description: 'Más de una década asesorando compradores internacionales en el Corredor Oeste de Costa Rica.',
  },
  {
    icon: Users,
    title: 'Familias internacionales',
    description: 'Trabajamos con compradores de más de 20 países — conocemos sus necesidades únicas.',
  },
  {
    icon: MapPin,
    title: 'Conocimiento local profundo',
    description: 'Escazú, Santa Ana, Lindora y la Ruta 27: somos especialistas en el mercado más dinámico del país.',
  },
]

export default async function HomePage() {
  const featuredProperties = await getFeaturedProperties()

  return (
    <>
      {/* Hero */}
      <section
        className="relative flex items-center"
        style={{
          minHeight: '85vh',
          backgroundImage: 'url(/hero-costa-rica.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay — forest green gradient matching original */}
        <div
          className="absolute inset-0"
          style={{
            background: 'var(--gradient-hero)',
          }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="container-wide relative z-10 py-24">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 border border-gold/40 text-gold text-xs tracking-widest uppercase mb-8 animate-fade-in">
              Escazú · Santa Ana · Costa Rica
            </span>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-medium text-primary-foreground leading-[1.15] mb-8 animate-slide-up">
              Propiedades de Lujo en el{' '}
              <span className="text-gold">Corredor Oeste</span>
            </h1>

            <p
              className="text-lg text-primary-foreground/70 leading-relaxed mb-12 max-w-xl animate-slide-up"
              style={{ animationDelay: '0.1s' }}
            >
              Asesoría experta para compradores internacionales e inversionistas.
              Acceso a propiedades exclusivas en Escazú, Santa Ana y la Ruta 27.
            </p>

            <div
              className="animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              <Link
                href="/contacto"
                className="inline-flex items-center px-6 py-4 rounded bg-transparent border border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/60 transition-all text-base font-medium"
              >
                Solicitar una Consulta Privada
              </Link>
            </div>

            <div
              className="flex flex-wrap gap-8 mt-16 pt-8 border-t border-primary-foreground/10 animate-fade-in"
              style={{ animationDelay: '0.3s' }}
            >
              <Link
                href="/servicios"
                className="text-xs text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors tracking-wide uppercase"
              >
                Guía de Relocalización →
              </Link>
              <Link
                href="/servicios"
                className="text-xs text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors tracking-wide uppercase"
              >
                Servicios para Inversionistas →
              </Link>
              <Link
                href="/herramientas"
                className="text-xs text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors tracking-wide uppercase"
              >
                Calculadoras y Herramientas →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties — Case Brief Style */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-foreground mb-2">
                Propiedades Destacadas
              </h2>
              <p className="text-sm text-muted-foreground">
                Una selección exclusiva de las mejores propiedades del mercado.
              </p>
            </div>
            <Link
              href="/property"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wide uppercase"
            >
              Ver todas →
            </Link>
          </div>

          {/* Brief list */}
          <div className="divide-y-0">
            {featuredProperties.slice(0, 3).map((property) => (
              <ListingBrief key={property.id} property={property} />
            ))}
            {featuredProperties.length === 0 && (
              <p className="text-muted-foreground text-sm py-8">
                No hay propiedades destacadas en este momento.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* How We Help */}
      <section className="section-padding bg-secondary">
        <div className="container-wide">
          <div className="text-center mb-14">
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-foreground mb-4">
              Cómo Podemos Ayudarle
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Una firma boutique con capacidades completas — desde encontrar su
              propiedad hasta establecerse en Costa Rica.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {howWeHelp.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className={`card-elevated p-8 text-center hover:border-primary/30 transition-all ${
                  item.dimmed ? 'opacity-80 hover:opacity-100' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-serif text-base font-medium text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-foreground mb-6">
                Por Qué Confiar en DR Housing
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-10 text-sm">
                Somos su socio estratégico en el mercado inmobiliario de lujo de
                Costa Rica. No somos solo corredores — somos asesores de
                confianza comprometidos con su éxito a largo plazo.
              </p>

              <div className="space-y-8">
                {trustPoints.map((point) => (
                  <div key={point.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <point.icon className="w-4 h-4 text-foreground/70" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground text-sm mb-1">
                        {point.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {point.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <Link
                  href="/agentes"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wide uppercase"
                >
                  Conocer al Equipo →
                </Link>
              </div>
            </div>

            {/* Portrait image */}
            <div className="relative hidden lg:block">
              <div className="overflow-hidden rounded-sm">
                <Image
                  src="/dr-portrait.png"
                  alt="DR Housing — Asesoría Inmobiliaria Privada"
                  width={600}
                  height={700}
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Strip */}
      <section className="bg-forest-dark text-primary-foreground py-16">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="font-serif text-xl font-medium mb-2">
                ¿Listo para encontrar su propiedad en Costa Rica?
              </h3>
              <p className="text-primary-foreground/60 text-sm">
                Hablemos. Sin compromisos ni presión.
              </p>
            </div>
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 px-6 py-4 rounded bg-transparent border border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 transition-all text-sm font-medium"
            >
              Solicitar una Consulta Privada
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
