export type BlogPostRow = {
  id: string
  slug: string
  title: string
  title_en: string | null
  excerpt: string | null
  excerpt_en: string | null
  content: string | null
  content_en: string | null
  category: string
  category_en: string | null
  image: string | null
  author: string | null
  read_time: string | null
  published: boolean
  featured: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

const base = () => ({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
})

/** All published posts — used by the public /blog page. Uses plain fetch (server-safe). */
export async function getPublishedPosts(): Promise<BlogPostRow[]> {
  const { url, key } = base()
  if (!url || !key) return []
  try {
    const res = await fetch(
      `${url}/rest/v1/blog_posts?published=eq.true&order=published_at.desc,created_at.desc`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' },
        cache: 'no-store',
      }
    )
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

/** Single published post by slug — used by /blog/[slug]. */
export async function getPublishedPostBySlug(slug: string): Promise<BlogPostRow | null> {
  const { url, key } = base()
  if (!url || !key) return null
  try {
    const res = await fetch(
      `${url}/rest/v1/blog_posts?slug=eq.${encodeURIComponent(slug)}&published=eq.true&limit=1`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' },
        cache: 'no-store',
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    return Array.isArray(data) ? (data[0] ?? null) : null
  } catch {
    return null
  }
}

/** All slugs of published posts — used by generateStaticParams. */
export async function getPublishedSlugs(): Promise<string[]> {
  const { url, key } = base()
  if (!url || !key) return []
  try {
    const res = await fetch(
      `${url}/rest/v1/blog_posts?published=eq.true&select=slug`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' },
        cache: 'no-store',
      }
    )
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data.map((r: { slug: string }) => r.slug) : []
  } catch {
    return []
  }
}
