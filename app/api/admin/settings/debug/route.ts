/**
 * GET /api/admin/settings/debug
 * Shows raw site_settings rows so you can verify the data is in Supabase.
 * Only usable while logged-in as admin (createAdminClient requires a session cookie).
 */
import { NextResponse } from 'next/server'
import { getSiteSettings } from '@/lib/supabase/settings'

export async function GET() {
  const settings = await getSiteSettings()
  return NextResponse.json({
    _note: 'Raw parsed settings as seen by the homepage server component',
    settings,
    heroVideoUrl: settings.heroVideoUrl ?? '(not set)',
    heroHeight:   settings.heroHeight   ?? '(not set — defaults to cinematic)',
  })
}
