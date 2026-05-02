import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { ZONE_SLUGS } from '@/config/zones'

const BASE_URL = 'https://drhousing.net'

// Regenerate at most every hour — properties don't change by the second
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use anon key — only fetching public data. Service role is never used
  // in public-facing routes.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // ── Dynamic property URLs ─────────────────────────────────────────────────
  const { data: properties } = await supabase
    .from('properties')
    .select('slug, reference_id, updated_at')
    .eq('hidden', false)
    .or('visibility.eq.public,visibility.is.null')
    .not('slug', 'is', null)
    .order('updated_at', { ascending: false })

  const propertyUrls: MetadataRoute.Sitemap = (properties ?? []).flatMap((p) => {
    const identifier = p.slug || p.reference_id
    if (!identifier) return []
    const lastMod = p.updated_at ? new Date(p.updated_at) : new Date()
    return [
      {
        url: `${BASE_URL}/en/property/${identifier}`,
        lastModified: lastMod,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        alternates: {
          languages: {
            en: `${BASE_URL}/en/property/${identifier}`,
            es: `${BASE_URL}/es/property/${identifier}`,
            'x-default': `${BASE_URL}/en/property/${identifier}`,
          },
        },
      },
      {
        url: `${BASE_URL}/es/property/${identifier}`,
        lastModified: lastMod,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        alternates: {
          languages: {
            en: `${BASE_URL}/en/property/${identifier}`,
            es: `${BASE_URL}/es/property/${identifier}`,
            'x-default': `${BASE_URL}/en/property/${identifier}`,
          },
        },
      },
    ]
  })

  // ── Zone landing pages ────────────────────────────────────────────────────
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

  // ── Static bilingual pages ────────────────────────────────────────────────
  type Freq = 'daily' | 'weekly' | 'monthly'
  const staticDefs: Array<{ en: string; es: string; freq: Freq; priority: number }> = [
    { en: '/en',                 es: '/es',                  freq: 'daily',   priority: 1.0 },
    { en: '/en/properties',      es: '/es/properties',       freq: 'daily',   priority: 0.9 },
    { en: '/en/agents',          es: '/es/agents',           freq: 'monthly', priority: 0.7 },
    { en: '/en/services',        es: '/es/services',         freq: 'monthly', priority: 0.6 },
    { en: '/en/contact',         es: '/es/contact',          freq: 'monthly', priority: 0.6 },
    { en: '/en/family-affairs',  es: '/es/family-affairs',   freq: 'monthly', priority: 0.5 },
    { en: '/en/tools',           es: '/es/tools',            freq: 'monthly', priority: 0.5 },
    { en: '/en/desarrollos',     es: '/es/desarrollos',      freq: 'weekly',  priority: 0.7 },
    { en: '/en/blog',            es: '/es/blog',             freq: 'weekly',  priority: 0.6 },
    { en: '/en/guia-west-gam',   es: '/es/guia-west-gam',   freq: 'monthly', priority: 0.5 },
  ]

  const staticRoutes: MetadataRoute.Sitemap = staticDefs.flatMap(({ en, es, freq, priority }) => [
    {
      url: `${BASE_URL}${en}`,
      lastModified: new Date(),
      changeFrequency: freq,
      priority,
      alternates: {
        languages: {
          en:          `${BASE_URL}${en}`,
          es:          `${BASE_URL}${es}`,
          'x-default': `${BASE_URL}${en}`,
        },
      },
    },
    {
      url: `${BASE_URL}${es}`,
      lastModified: new Date(),
      changeFrequency: freq,
      priority,
      alternates: {
        languages: {
          en:          `${BASE_URL}${en}`,
          es:          `${BASE_URL}${es}`,
          'x-default': `${BASE_URL}${en}`,
        },
      },
    },
  ])

  return [...staticRoutes, ...zoneRoutes, ...propertyUrls]
}
