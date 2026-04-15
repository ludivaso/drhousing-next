import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase/client'
import { ZONE_SLUGS } from '@/config/zones'

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

  // Zone landing pages — 4 modes × 4 zones = 16 URLs
  const zoneModes = [
    { esPath: 'alquiler', enPath: 'rentals' },
    { esPath: 'venta',    enPath: 'for-sale' },
  ]
  const zoneRoutes: MetadataRoute.Sitemap = ZONE_SLUGS.flatMap(zone =>
    zoneModes.flatMap(({ esPath, enPath }) => [
      {
        url: `${BASE_URL}/es/${esPath}/${zone}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.85,
        alternates: {
          languages: {
            es: `${BASE_URL}/es/${esPath}/${zone}`,
            en: `${BASE_URL}/en/${enPath}/${zone}`,
            'x-default': `${BASE_URL}/en/${enPath}/${zone}`,
          },
        },
      },
      {
        url: `${BASE_URL}/en/${enPath}/${zone}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.85,
        alternates: {
          languages: {
            es: `${BASE_URL}/es/${esPath}/${zone}`,
            en: `${BASE_URL}/en/${enPath}/${zone}`,
            'x-default': `${BASE_URL}/en/${enPath}/${zone}`,
          },
        },
      },
    ])
  )

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

  return [...withAlternates, ...zoneRoutes]
}
