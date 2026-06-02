import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPublishedPostBySlug, getPublishedSlugs } from '@/lib/supabase/blog'
import { POSTS_BY_SLUG, allPosts } from '@/content/blog'
import BlogPostClient from './BlogPostClient'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const dbSlugs  = await getPublishedSlugs()
  const seen = new Set(dbSlugs)
  const staticSlugs = allPosts.map((p) => p.slug).filter((s) => !seen.has(s))
  const allSlugs = [...dbSlugs, ...staticSlugs]
  return allSlugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: { lang: string; slug: string } }): Promise<Metadata> {
  const lang = params.lang === 'es' ? 'es' : 'en'
  const dbPost = await getPublishedPostBySlug(params.slug)
  if (dbPost) {
    const title = lang === 'en' ? (dbPost.title_en ?? dbPost.title_es) : dbPost.title_es
    const description = lang === 'en' ? (dbPost.excerpt_en ?? dbPost.excerpt_es ?? title) : (dbPost.excerpt_es ?? title)
    return { title, description, openGraph: { title, images: dbPost.featured_image ? [{ url: dbPost.featured_image }] : [] } }
  }
  const staticPost = POSTS_BY_SLUG[params.slug]
  if (staticPost) return { title: staticPost.title, description: staticPost.title, openGraph: { title: staticPost.title, images: [{ url: staticPost.image }] } }
  return {}
}

export default async function BlogPostPage({ params }: { params: { lang: string; slug: string } }) {
  // 1. Try Supabase
  const dbPost = await getPublishedPostBySlug(params.slug)
  if (dbPost) {
    // Normalise to the shape BlogPostClient expects
    const post = {
      slug:       dbPost.slug,
      title:      dbPost.title_es,
      titleEn:    dbPost.title_en       ?? dbPost.title_es,
      category:   dbPost.category,
      categoryEn: dbPost.category,
      date:       dbPost.published_at   ?? dbPost.created_at,
      readTime:   '5 min',
      image:      dbPost.featured_image ?? '/hero-costa-rica.jpg',
      content:    dbPost.body_es        ?? '',
      contentEn:  dbPost.body_en        ?? dbPost.body_es ?? '',
      excerpt:    dbPost.excerpt_es     ?? '',
      excerptEn:  dbPost.excerpt_en     ?? dbPost.excerpt_es ?? '',
    }
    return <BlogPostClient post={post} />
  }

  // 2. Fall back to static content files
  const staticPost = POSTS_BY_SLUG[params.slug]
  if (staticPost) return <BlogPostClient post={staticPost} />

  notFound()
}
