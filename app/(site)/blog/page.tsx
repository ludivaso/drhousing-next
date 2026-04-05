import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog & Insights',
  description: 'Market analysis, relocation guides, investment insights, and real estate news for Costa Rica.',
}

const posts = [
  {
    slug: 'guia-comprar-propiedad-costa-rica-2025',
    title: 'Guía Completa para Comprar Propiedad en Costa Rica en 2025',
    titleEn: 'Complete Guide to Buying Property in Costa Rica in 2025',
    excerpt: 'Todo lo que necesita saber sobre el proceso de compra, requisitos legales, impuestos y las mejores zonas para invertir en Costa Rica.',
    excerptEn: 'Everything you need to know about the buying process, legal requirements, taxes, and the best areas to invest in Costa Rica.',
    category: 'Guías',
    categoryEn: 'Guides',
    date: '2025-03-15',
    readTime: '8 min',
    image: '/hero-costa-rica.jpg',
  },
  {
    slug: 'mercado-inmobiliario-escazu-santa-ana-2025',
    title: 'El Mercado Inmobiliario de Escazú y Santa Ana: Tendencias 2025',
    titleEn: 'Escazú and Santa Ana Real Estate Market: 2025 Trends',
    excerpt: 'Análisis de precios, demanda y oportunidades de inversión en el Corredor Oeste de San José para el año 2025.',
    excerptEn: 'Price analysis, demand, and investment opportunities in the West Corridor of San José for 2025.',
    category: 'Mercado',
    categoryEn: 'Market',
    date: '2025-02-28',
    readTime: '6 min',
    image: '/west-gam-hero.jpg',
  },
  {
    slug: 'residencia-costa-rica-opciones-para-extranjeros',
    title: 'Residencia en Costa Rica: Opciones para Extranjeros e Inversionistas',
    titleEn: 'Costa Rica Residency: Options for Foreigners and Investors',
    excerpt: 'Conozca las categorías de residencia disponibles, requisitos, costos y tiempos estimados para obtener su residencia en Costa Rica.',
    excerptEn: 'Learn about the available residency categories, requirements, costs, and estimated timelines to obtain your Costa Rica residency.',
    category: 'Legal',
    categoryEn: 'Legal',
    date: '2025-02-10',
    readTime: '10 min',
    image: '/hero-costa-rica.jpg',
  },
  {
    slug: 'vivir-en-escazu-guia-expatriados',
    title: 'Vivir en Escazú: La Guía Definitiva para Expatriados',
    titleEn: 'Living in Escazú: The Definitive Expat Guide',
    excerpt: 'Colegios internacionales, centros médicos, restaurantes, vida nocturna y todo lo que necesita saber antes de mudarse a Escazú.',
    excerptEn: 'International schools, medical centers, restaurants, nightlife, and everything you need to know before moving to Escazú.',
    category: 'Estilo de Vida',
    categoryEn: 'Lifestyle',
    date: '2025-01-20',
    readTime: '12 min',
    image: '/west-gam-hero.jpg',
  },
]

const CATEGORY_COLORS: Record<string, string> = {
  'Guías': 'bg-primary/10 text-primary',
  'Mercado': 'bg-gold/20 text-foreground',
  'Legal': 'bg-blue-100 text-blue-800',
  'Estilo de Vida': 'bg-green-100 text-green-800',
}

export default function BlogPage() {
  const [featured, ...rest] = posts

  return (
    <>
      {/* Header */}
      <section className="bg-forest-dark text-primary-foreground py-16">
        <div className="container-wide">
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold mb-4">
            Blog & Market Insights
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">
            Análisis de mercado, guías de relocalización e insights de inversión
            para propiedades de lujo en Costa Rica.
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-wide">
          {/* Featured post */}
          <Link
            href={`/blog/${featured.slug}`}
            className="group block mb-12 card-elevated overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative h-64 lg:h-auto overflow-hidden">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
              </div>
              <div className="p-8 lg:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORY_COLORS[featured.category] ?? 'bg-muted text-muted-foreground'}`}>
                    {featured.category}
                  </span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Artículo Destacado</span>
                </div>
                <h2 className="font-serif text-2xl lg:text-3xl font-semibold text-foreground mb-4 group-hover:text-primary transition-colors">
                  {featured.title}
                </h2>
                <p className="text-muted-foreground mb-6">{featured.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{new Date(featured.date).toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{featured.readTime} lectura</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Post grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group card-elevated overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORY_COLORS[post.category] ?? 'bg-muted text-muted-foreground'}`}>
                    {post.category}
                  </span>
                  <h3 className="font-serif text-lg font-semibold text-foreground mt-3 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(post.date).toLocaleDateString('es-CR', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-forest-dark text-primary-foreground py-16">
        <div className="container-wide text-center">
          <h2 className="font-serif text-3xl font-semibold mb-4">Reciba Nuestro Market Report</h2>
          <p className="text-primary-foreground/80 max-w-lg mx-auto mb-8">
            Análisis mensual del mercado inmobiliario de lujo en Costa Rica, directamente en su correo.
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 px-6 py-3 rounded bg-gold text-foreground font-medium hover:bg-gold/90 transition-colors"
          >
            Suscribirse al Market Report <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
