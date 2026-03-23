import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Building2, MapPin, TrendingUp, Calendar, CheckCircle, Phone, ArrowRight } from 'lucide-react'
import WhatsAppCTA from '@/components/WhatsAppCTA'

export const metadata: Metadata = {
  title: 'Desarrollos & Preventa | DR Housing',
  description: 'Proyectos exclusivos de nueva construcción y preventa en Escazú, Santa Ana y el Corredor Ruta 27. Precios de preventa con alta plusvalía.',
}

const developments = [
  {
    id: 'proyecto-lindora-residences',
    name: 'Lindora Residences',
    location: 'Lindora, Santa Ana',
    status: 'Preventa',
    statusColor: 'bg-gold/20 text-foreground border border-gold/30',
    type: 'Casas de Lujo',
    units: '12 unidades',
    priceFrom: 450000,
    completion: '2026',
    description: 'Proyecto residencial exclusivo de 12 casas de lujo en Lindora, Santa Ana. Diseño arquitectónico contemporáneo con vistas a la montaña, acabados premium importados y amplios jardines privados.',
    features: [
      'Área de construcción: 280–420 m²',
      'Lotes individuales de 500–800 m²',
      'Acabados premium: mármol, maderas nobles',
      'Sistema domótico integrado',
      'Piscina privada opcional',
      'Seguridad 24/7 con acceso controlado',
    ],
    image: '/services/real-estate-brokerage.jpg',
  },
  {
    id: 'proyecto-escazu-torres',
    name: 'Escazú Skyline Condos',
    location: 'Escazú Centro',
    status: 'En Construcción',
    statusColor: 'bg-primary/10 text-primary border border-primary/20',
    type: 'Condominios',
    units: '28 apartamentos',
    priceFrom: 280000,
    completion: '2025',
    description: 'Torre residencial de lujo en el corazón de Escazú con amenidades de primer nivel. Apartamentos de 1, 2 y 3 habitaciones con vistas panorámicas al Valle Central y acceso directo al centro comercial.',
    features: [
      'Pisos 4 al 12 con vistas panorámicas',
      'Amenidades: piscina, gym, coworking',
      'Estacionamiento doble techado',
      'Lobby con concierge 24/7',
      'Área de entretenimiento en rooftop',
      'Certificación EDGE en sostenibilidad',
    ],
    image: '/services/property-management.jpg',
  },
]

const benefits = [
  {
    icon: TrendingUp,
    title: 'Precio de Entrada',
    desc: 'Adquiera a precios de preventa, típicamente 15–25% por debajo del valor de mercado al momento de entrega.',
  },
  {
    icon: Building2,
    title: 'Personalización',
    desc: 'En etapas tempranas puede personalizar acabados, distribución y upgrades según sus preferencias.',
  },
  {
    icon: Calendar,
    title: 'Plusvalía Durante Construcción',
    desc: 'La apreciación ocurre durante el proceso constructivo, generando rendimientos antes de recibir las llaves.',
  },
  {
    icon: CheckCircle,
    title: 'Garantías del Desarrollador',
    desc: 'Respaldo legal, garantías de construcción y fideicomiso de preventa para proteger su inversión.',
  },
]

export default function DesarrollosPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-forest-dark text-primary-foreground py-16">
        <div className="container-wide">
          <p className="text-gold text-sm tracking-widest uppercase font-medium mb-3">Nueva Construcción · Pre-Sales</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold mb-4">
            Desarrollos & Preventa
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">
            Proyectos exclusivos de nueva construcción en las zonas de mayor plusvalía
            del Corredor Oeste. Acceso anticipado con precios de preventa.
          </p>
        </div>
      </section>

      {/* Active developments */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <h2 className="font-serif text-3xl font-semibold text-foreground mb-10">
            Proyectos Activos
          </h2>

          <div className="space-y-12">
            {developments.map((dev, index) => (
              <div
                key={dev.id}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-0 card-elevated overflow-hidden ${
                  index % 2 === 1 ? 'lg:[direction:rtl]' : ''
                }`}
              >
                <div className={`relative h-72 lg:h-auto ${index % 2 === 1 ? '[direction:ltr]' : ''}`}>
                  <Image
                    src={dev.image}
                    alt={dev.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${dev.statusColor}`}>
                      {dev.status}
                    </span>
                  </div>
                </div>

                <div className={`p-8 lg:p-10 flex flex-col justify-center ${index % 2 === 1 ? '[direction:ltr]' : ''}`}>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                    <MapPin className="w-4 h-4 text-primary" />
                    {dev.location}
                  </div>
                  <h3 className="font-serif text-2xl lg:text-3xl font-semibold text-foreground mb-2">
                    {dev.name}
                  </h3>
                  <div className="flex flex-wrap gap-3 mb-4 text-sm text-muted-foreground">
                    <span>{dev.type}</span>
                    <span>·</span>
                    <span>{dev.units}</span>
                    <span>·</span>
                    <span>Entrega {dev.completion}</span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    {dev.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    {dev.features.map((f) => (
                      <div key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        {f}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-6">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Desde</p>
                      <p className="font-serif text-2xl font-semibold text-foreground">
                        ${dev.priceFrom.toLocaleString()}
                      </p>
                    </div>
                    <WhatsAppCTA
                      message={`Hola, me interesa el proyecto ${dev.name} en ${dev.location}. ¿Puede enviarme más información sobre unidades disponibles y precios de preventa?`}
                      label="Solicitar Info"
                      variant="footer"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why pre-sale */}
      <section className="section-padding bg-secondary/40">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-semibold text-foreground mb-4">
              ¿Por qué Invertir en Preventa?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              La preventa ofrece ventajas únicas para inversionistas y compradores finales en el mercado costarricense.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="card-elevated p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <b.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{b.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-forest-dark text-primary-foreground py-16">
        <div className="container-wide">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl font-semibold mb-4">
              Acceso Anticipado a Nuevos Proyectos
            </h2>
            <p className="text-primary-foreground/80 mb-8">
              Regístrese para recibir información exclusiva sobre nuevos proyectos de preventa
              antes de su lanzamiento público. Cupos limitados por proyecto.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <WhatsAppCTA
                message="Hola, me gustaría registrarme para recibir información sobre nuevos proyectos de preventa en Costa Rica."
                label="Registrarme por WhatsApp"
                variant="footer"
              />
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Enviar Formulario <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
