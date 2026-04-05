import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase/client'

const BASE_URL = 'https://drhousing.net'

// Static public routes with their priorities and change frequencies
const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: BASE_URL,                     lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
  { url: `${BASE_URL}/propiedades`,    lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
  { url: `${BASE_URL}/servicios`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE_URL}/agentes`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  { url: `${BASE_URL}/contacto`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  { url: `${BASE_URL}/family-affairs`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  { url: `${BASE_URL}/herramientas`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  { url: `${BASE_URL}/desarrollos`,    lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
  { url: `${BASE_URL}/blog`,           lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.6 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all public property slugs dynamically
  const { data: properties } = await supabase
    .from('properties')
    .select('slug, updated_at')
    .eq('hidden', false)
    .eq('visibility', 'public')
    .not('slug', 'is', null)

  const propertyRoutes: MetadataRoute.Sitemap = (properties ?? [])
    .filter((p) => p.slug)
    .map((p) => ({
      url: `${BASE_URL}/property/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  // hreflang alternates for bilingual support
  const withAlternates = [...STATIC_ROUTES, ...propertyRoutes].map((route) => ({
    ...route,
    alternates: {
      languages: {
        es: route.url,
        en: route.url,
        'x-default': route.url,
      },
    },
  }))

  return withAlternates
}
