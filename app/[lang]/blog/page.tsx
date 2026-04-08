import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { getPublishedPosts } from '@/lib/supabase/blog'
import type { BlogPostRow } from '@/lib/supabase/blog'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Blog & Market Insights | DR Housing',
  description: 'Market analysis, relocation guides, and investment insights for luxury real estate in Costa Rica.',
}

// Static fallback posts (shown when Supabase table doesn't exist yet)
const STATIC_POSTS = [
  {
    slug: 'guia-comprar-propiedad-costa-rica-2025',
    title: 'Guía Completa para Comprar Propiedad en Costa Rica en 2025',
    excerpt: 'Todo lo que necesita saber sobre el proceso de compra, requisitos legales, impuestos y las mejores zonas para invertir.',
    category: 'Guías',
    published_at: '2025-03-15',
    read_time: '8 min',
    image: '/hero-costa-rica.jpg',
  },
]

type PostCard = {
  slug: string
  title: string
  excerpt: string | null
  category: string
  published_at: string | null
  read_time: string | null
  image: string | null
}

function toCard(p: BlogPostRow): PostCard {
  return { slug: p.slug, title: p.title, excerpt: p.excerpt, category: p.category, published_at: p.published_at, read_time: p.read_time, image: p.image }
}

export default async function BlogPage() {
  const dbPosts = await getPublishedPosts()
  const posts: PostCard[] = dbPosts.length > 0 ? dbPosts.map(toCard) : STATIC_POSTS

  const [featured, ...rest] = posts

  return (
    <>
      {/* Header */}
      <section className="bg-forest-dark text-primary-foreground py-16">
        <div className="container-wide">
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold mb-4">
            Blog & Market Insights
          </h1>
          <p className="text-primary-foreground/70 text-lg max-w-2xl">
            Market analysis, relocation guides, and investment insights for Costa Rica.
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
                  src={featured.image ?? '/hero-costa-rica.jpg'}
                  alt={featured.title}
                  fill
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
              </div>
              <div className="p-8 lg:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                    {featured.category}
                  </span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                    Featured
                  </span>
                </div>
                <h2 className="font-serif text-2xl lg:text-3xl font-semibold text-foreground mb-4 group-hover:text-primary transition-colors">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="text-muted-foreground mb-6 line-clamp-3">{featured.excerpt}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {featured.published_at && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(featured.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  )}
                  {featured.read_time && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {featured.read_time}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>

          {/* Post grid */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rest.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group card-elevated overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.image ?? '/hero-costa-rica.jpg'}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                      {post.category}
                    </span>
                    <h3 className="font-serif text-lg font-semibold text-foreground mt-3 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{post.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      {post.published_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                      {post.read_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {post.read_time}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-forest-dark text-primary-foreground py-16">
        <div className="container-wide text-center">
          <h2 className="font-serif text-3xl font-semibold mb-4">Market Intelligence</h2>
          <p className="text-primary-foreground/70 max-w-lg mx-auto mb-8">
            Monthly analysis of the luxury real estate market in Costa Rica, delivered privately.
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 px-6 py-3 border border-primary-foreground/30 text-primary-foreground text-sm font-medium hover:bg-primary-foreground/10 transition-colors"
          >
            Subscribe to Market Report <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
