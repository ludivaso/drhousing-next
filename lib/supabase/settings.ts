export type ServiceCardConfig = {
  titleEn: string
  titleEs: string
  subtitleEn: string
  subtitleEs: string
  href: string
  image: string
}

/** Cinematic (~50vh letterbox) | Landscape (~65vh) | Full (~85vh immersive) */
export type HeroHeight = 'cinematic' | 'landscape' | 'full'

export type SiteSettings = {
  heroVideoUrl?: string
  heroHeight?: HeroHeight
  serviceCards?: ServiceCardConfig[]
}

/**
 * Reads site-wide settings from the `site_settings` table.
 * Uses the Supabase REST API directly (plain fetch) so it works reliably
 * in Next.js Server Components, Edge, and API Routes — no browser client.
 * Returns {} gracefully if the table does not exist yet.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) return {}

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/site_settings?select=key,value`,
      {
        headers: {
          apikey:        anonKey,
          Authorization: `Bearer ${anonKey}`,
          Accept:        'application/json',
        },
        cache: 'no-store', // always fresh — never serve stale hero video
      }
    )

    if (!res.ok) return {}

    const rows: { key: string; value: string }[] = await res.json()
    if (!Array.isArray(rows)) return {}

    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))

    return {
      heroVideoUrl: map.hero_video_url || undefined,
      heroHeight:   (map.hero_height as HeroHeight) || undefined,
      serviceCards: map.service_cards
        ? (JSON.parse(map.service_cards) as ServiceCardConfig[])
        : undefined,
    }
  } catch {
    return {}
  }
}
