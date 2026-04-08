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

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const dbPost = await getPublishedPostBySlug(params.slug)
  if (dbPost) return { title: dbPost.title, description: dbPost.excerpt ?? dbPost.title, openGraph: { title: dbPost.title, images: dbPost.image ? [{ url: dbPost.image }] : [] } }
  const staticPost = POSTS_BY_SLUG[params.slug]
  if (staticPost) return { title: staticPost.title, description: staticPost.title, openGraph: { title: staticPost.title, images: [{ url: staticPost.image }] } }
  return {}
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  // 1. Try Supabase
  const dbPost = await getPublishedPostBySlug(params.slug)
  if (dbPost) {
    // Normalise to the shape BlogPostClient expects
    const post = {
      slug:       dbPost.slug,
      title:      dbPost.title,
      titleEn:    dbPost.title_en  ?? dbPost.title,
      category:   dbPost.category,
      categoryEn: dbPost.category_en ?? dbPost.category,
      date:       dbPost.published_at ?? dbPost.created_at,
      readTime:   dbPost.read_time ?? '5 min',
      image:      dbPost.image ?? '/hero-costa-rica.jpg',
      content:    dbPost.content    ?? '',
      contentEn:  dbPost.content_en ?? dbPost.content ?? '',
      excerpt:    dbPost.excerpt    ?? '',
      excerptEn:  dbPost.excerpt_en ?? dbPost.excerpt ?? '',
    }
    return <BlogPostClient post={post} />
  }

  // 2. Fall back to static content files
  const staticPost = POSTS_BY_SLUG[params.slug]
  if (staticPost) return <BlogPostClient post={staticPost} />

  notFound()
}
