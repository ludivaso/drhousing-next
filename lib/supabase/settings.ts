import { supabase } from './client'

export type ServiceCardConfig = {
  titleEn: string
  titleEs: string
  subtitleEn: string
  subtitleEs: string
  href: string
  image: string
}

export type SiteSettings = {
  heroVideoUrl?: string
  serviceCards?: ServiceCardConfig[]
}

/**
 * Reads site-wide settings from the `site_settings` table.
 * Returns an empty object (using component defaults) if the table
 * doesn't exist yet — so the site works before the migration is run.
 *
 * SQL to create the table in Supabase:
 *   CREATE TABLE site_settings (
 *     key TEXT PRIMARY KEY,
 *     value TEXT,
 *     updated_at TIMESTAMPTZ DEFAULT NOW()
 *   );
 *   ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
 *   CREATE POLICY "Public read" ON site_settings FOR SELECT USING (true);
 *   CREATE POLICY "Auth write" ON site_settings FOR ALL USING (auth.role() = 'authenticated');
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await (supabase as any)
      .from('site_settings')
      .select('key, value')

    if (error) return {}

    const map = Object.fromEntries(
      (data ?? []).map((r: { key: string; value: string }) => [r.key, r.value])
    )

    return {
      heroVideoUrl: map.hero_video_url || undefined,
      serviceCards: map.service_cards
        ? (JSON.parse(map.service_cards) as ServiceCardConfig[])
        : undefined,
    }
  } catch {
    return {}
  }
}
