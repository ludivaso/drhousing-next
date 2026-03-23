import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Home, Scale, Building2, Briefcase, ArrowRight, Phone, Palette } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Servicios | DR Housing',
  description:
    'Servicios inmobiliarios completos: corretaje, legal, desarrollo, diseño y administración de propiedades en Costa Rica.',
}

const services = [
  {
    id: 'brokerage',
    icon: Home,
    image: '/services/real-estate-brokerage.jpg',
    subtitle: 'Compra · Venta · Inversión',
    title: 'Corretaje Inmobiliario',
    description:
      'Acceso exclusivo a las mejores propiedades residenciales y comerciales del Corredor Oeste. Nuestra red de contactos y conocimiento profundo del mercado le da ventaja competitiva.',
    features: [
      'Representación exclusiva de compradores y vendedores',
      'Valuación y análisis de mercado comparativo',
      'Negociación estratégica para maximizar su inversión',
      'Acceso a propiedades off-market',
      'Cierre y coordinación notarial completa',
    ],
  },
  {
    id: 'legal',
    icon: Scale,
    image: '/services/legal-immigration.jpg',
    subtitle: 'Residencia · Contratos · Cumplimiento',
    title: 'Legal e Inmigración',
    description:
      'Navegamos el sistema legal costarricense por usted. Desde contratos de compra hasta trámites de residencia — todo bajo un mismo techo de confianza.',
    features: [
      'Due diligence y revisión de títulos de propiedad',
      'Contratos de compraventa y arrendamiento',
      'Trámites de residencia y visa inversionista',
      'Constitución de sociedades y estructuración fiscal',
      'Coordinación con notarios y registro público',
    ],
  },
  {
    id: 'development',
    icon: Building2,
    image: '/services/development-remodeling.jpg',
    subtitle: 'Construcción · Remodelación · Proyectos',
    title: 'Desarrollos y Remodelaciones',
    description:
      'De la idea al proyecto terminado. Coordinamos arquitectos, contratistas y diseñadores para entregar su propiedad a tiempo y dentro del presupuesto.',
    features: [
      'Gestión integral de proyectos de construcción',
      'Remodelaciones y mejoras para maximizar valor',
      'Coordinación de permisos y aprobaciones',
      'Control de calidad y supervisión en sitio',
      'Entrega llave en mano',
    ],
  },
  {
    id: 'interior-design',
    icon: Palette,
    image: '/services/interior-design.jpg',
    subtitle: 'Diseño · Decoración · Staging',
    title: 'Diseño de Interiores',
    description:
      'Espacios que reflejan su estilo de vida y maximizan el valor de su propiedad. Nuestro equipo crea ambientes de lujo funcionales y atemporales.',
    features: [
      'Diseño interior completo para proyectos residenciales',
      'Selección de materiales y acabados premium',
      'Coordinación de proveedores y artesanos',
      'Home staging para propiedades en venta',
      'Iluminación arquitectónica y diseño de espacios',
      'Gestión de compras y logística',
    ],
  },
  {
    id: 'management',
    icon: Briefcase,
    image: '/services/property-management.jpg',
    subtitle: 'Alquiler · Mantenimiento · Rendimiento',
    title: 'Administración de Propiedades',
    description:
      'Su propiedad, nuestra responsabilidad. Maximizamos su rendimiento gestionando cada aspecto de la operación — sin que usted tenga que preocuparse por nada.',
    features: [
      'Selección y gestión de inquilinos de largo plazo',
      'Administración de alquileres vacacionales (Airbnb, VRBO)',
      'Mantenimiento preventivo y correctivo',
      'Informes financieros mensuales y anuales',
      'Coordinación de seguros y servicios',
    ],
  },
]

export default function ServiciosPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-forest-dark text-primary-foreground py-16">
        <div className="container-wide">
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold mb-4">
            Nuestros Servicios
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">
            Una firma boutique con capacidades completas para acompañarle en cada
            etapa de su proyecto inmobiliario en Costa Rica.
          </p>
        </div>
      </section>

      {/* Services — alternating 2-col layout */}
      <section className="section-padding bg-background">
        <div className="container-wide space-y-20">
          {services.map((service, index) => (
            <div
              key={service.id}
              id={service.id}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              {/* Text */}
              <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded bg-primary/10 flex items-center justify-center">
                    <service.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground tracking-wide">
                      {service.subtitle}
                    </p>
                    <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground">
                      {service.title}
                    </h2>
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed mb-8">
                  {service.description}
                </p>

                <ul className="space-y-4 mb-8">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold mt-2.5 flex-shrink-0" />
                      <span className="text-muted-foreground leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contacto"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Consultar sobre este servicio
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Image */}
              <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                <div className="aspect-[4/3] rounded overflow-hidden shadow-lg">
                  <Image
                    src={service.image}
                    alt={service.title}
                    width={800}
                    height={600}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Family Affairs strip */}
      <section className="bg-secondary py-12">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                Asesoría Privada Integral
              </h3>
              <p className="text-muted-foreground">
                Para familias que buscan más que solo una propiedad — una vida completa en Costa Rica.
              </p>
            </div>
            <Link
              href="/family-affairs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded border border-border text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              Family Affairs
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-serif text-2xl font-semibold mb-2">
                ¿Listo para comenzar?
              </h3>
              <p className="text-primary-foreground/80">
                Contáctenos hoy para una consulta sin costo ni compromiso.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contacto"
                className="inline-flex items-center px-6 py-3 rounded bg-gold text-forest-dark font-medium text-sm hover:bg-gold/90 transition-colors"
              >
                Agendar Consulta
              </Link>
              <a
                href="tel:+50686540888"
                className="inline-flex items-center gap-2 px-6 py-3 rounded border border-primary-foreground/30 text-primary-foreground text-sm font-medium hover:bg-primary-foreground/10 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Llamar Ahora
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
