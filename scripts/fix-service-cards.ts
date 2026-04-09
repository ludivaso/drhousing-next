/**
 * One-time migration: update the service_cards row in site_settings
 * so the stored hrefs use the new English slug form (no leading slash).
 * ServicesPanels will then resolve them to /${lang}/slug at render time.
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const HREF_MAP: Record<string, string> = {
  '/propiedades':  'properties',
  '/desarrollos':  'desarrollos',
  '/servicios':    'services',
  '/contacto':     'contact',
  '/herramientas': 'tools',
  '/agentes':      'agents',
}

async function main() {
  // 1. Read current value
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'service_cards')
    .single()

  if (error || !data) {
    console.error('❌  Could not read service_cards:', error?.message)
    process.exit(1)
  }

  const cards = JSON.parse(data.value) as { href: string; [k: string]: unknown }[]
  console.log('Current hrefs:', cards.map((c) => c.href))

  // 2. Normalise each href
  const updated = cards.map((c) => ({
    ...c,
    href: HREF_MAP[c.href] ?? c.href,
  }))
  console.log('Updated hrefs:', updated.map((c) => c.href))

  // 3. Write back
  const { error: updateError } = await supabase
    .from('site_settings')
    .update({ value: JSON.stringify(updated) })
    .eq('key', 'service_cards')

  if (updateError) {
    console.error('❌  Update failed:', updateError.message)
    process.exit(1)
  }

  console.log('✅  service_cards updated successfully in Supabase')
}

main().catch(console.error)
