import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Home, TrendingUp, Users, Leaf, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Guía West GAM — Vivir en el Corredor Oeste',
  description:
    'La guía completa para vivir e invertir en el Corredor Oeste de Costa Rica: Escazú, Santa Ana, Lindora y la Ruta 27.',
}

const sections = [
  {
    id: 'overview',
    icon: MapPin,
    title: '¿Qué es el Corredor Oeste?',
    content: `El Corredor Oeste de la Gran Área Metropolitana (West GAM) comprende los cantones de Escazú, Santa Ana y Belén, conectados por la autopista Ruta 27 hacia el Pacífico. Es la zona de mayor crecimiento y más alta plusvalía de Costa Rica.

Con excelente infraestructura, seguridad, servicios internacionales y una comunidad expat consolidada, el West GAM es la elección número uno para familias internacionales que se relocalizan en el país.`,
  },
  {
    id: 'escazu',
    icon: Home,
    title: 'Escazú — El Epicentro del Lujo',
    content: `Escazú es el cantón con mayor densidad de propiedades de alto valor en Costa Rica. Desde el bullicioso Multiplaza hasta los barrios exclusivos de Bello Horizonte, Guachipelín y Cerro Alto, ofrece una mezcla única de conveniencia urbana y ambiente residencial premium.

Puntos destacados: embajadas y consulados, hospitales de primer nivel (CIMA, Clínica Bíblica), colegios internacionales (Country Day School, Blue Valley), restaurantes y tiendas de clase mundial.`,
  },
  {
    id: 'santa-ana',
    icon: Leaf,
    title: 'Santa Ana — Naturaleza y Tranquilidad',
    content: `Santa Ana combina la tranquilidad del campo con acceso rápido a todos los servicios. Con urbanizaciones como Lindora, Hacienda Los Reyes y Ciudad Colón, es preferida por familias que buscan más espacio, naturaleza y un ritmo de vida más pausado sin sacrificar comodidad.

Es también un polo tecnológico: sedes de empresas como Amazon, Intel y HP están en este corredor.`,
  },
  {
    id: 'market',
    icon: TrendingUp,
    title: 'Mercado Inmobiliario: Datos Clave',
    content: `El mercado West GAM ha mostrado una apreciación promedio del 5-8% anual en propiedades de lujo durante la última década. La demanda sostenida de familias extranjeras y el crecimiento del sector tecnológico mantienen los fundamentos sólidos.

Rangos de precio actuales:
• Apartamentos: $150,000 – $800,000+
• Casas residenciales: $350,000 – $3,000,000+
• Penthouse / propiedades exclusivas: $1,000,000+
• Terrenos (por m²): $200 – $600`,
  },
  {
    id: 'expat',
    icon: Users,
    title: 'Vivir como Expat en Costa Rica',
    content: `Costa Rica es consistentemente clasificada como uno de los mejores países para jubilados e inmigrantes internacionales. El programa de Residencia Rentista y Pensionado ofrece rutas accesibles para obtener residencia legal con requerimientos relativamente bajos.

Beneficios adicionales: exenciones fiscales en importación de efectos personales y vehículo para nuevos residentes, sistema de salud universal (CCSS), clima estable de montaña (16–26°C en el West GAM), y una comunidad expat activa y acogedora.`,
  },
]

export default function GuiaWestGAMPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-forest-dark text-primary-foreground py-20">
        <div className="container-wide">
          <span className="inline-block text-sm text-gold font-medium tracking-wider uppercase mb-4">
            Guía Completa
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold mb-6">
            Vivir en el Corredor Oeste
          </h1>
          <p className="text-primary-foreground/80 text-xl max-w-2xl">
            Todo lo que necesita saber sobre Escazú, Santa Ana y la Ruta 27 — el corazón
            del mercado inmobiliario de lujo en Costa Rica.
          </p>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="bg-secondary border-b border-border">
        <div className="container-wide py-4">
          <div className="flex flex-wrap gap-4 text-sm">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {s.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <div className="space-y-16">
            {sections.map((section) => (
              <div key={section.id} id={section.id}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="font-serif text-2xl font-semibold text-foreground">
                    {section.title}
                  </h2>
                </div>
                <div className="prose prose-sm max-w-none">
                  {section.content.split('\n\n').map((para, i) => (
                    <p key={i} className="text-muted-foreground leading-relaxed mb-4 whitespace-pre-line">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container-wide text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold mb-4">
            ¿Listo para explorar el Corredor Oeste?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Hable con uno de nuestros expertos para una consulta personalizada y gratuita.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/property"
              className="inline-flex items-center gap-2 px-6 py-3 rounded bg-primary-foreground text-primary text-sm font-medium hover:bg-primary-foreground/90 transition-colors"
            >
              Ver Propiedades
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 px-6 py-3 rounded border border-primary-foreground/30 text-primary-foreground text-sm font-medium hover:bg-primary-foreground/10 transition-colors"
            >
              Consultar con un Experto
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
