/**
 * Batch-translate properties missing Spanish titles/descriptions.
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... \
 *   npx tsx scripts/translate-missing.ts
 *
 * Or create a .env.local with those two vars and run:
 *   npx tsx --env-file=.env.local scripts/translate-missing.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌  Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function translateMissing() {
  // ── 1. Count total missing ────────────────────────────────────────────────
  const { count: totalMissing, error: countErr } = await supabase
    .from('properties')
    .select('id', { count: 'exact', head: true })
    .or('title_es.is.null,title_es.eq.')
    .eq('hidden', false)

  if (countErr) {
    console.error('❌  Count query failed:', countErr.message)
    return
  }
  console.log(`\n📊  Properties missing title_es: ${totalMissing ?? 0}\n`)

  if (!totalMissing || totalMissing === 0) {
    console.log('✅  Nothing to translate.')
    return
  }

  // ── 2. Fetch batch of 50 ─────────────────────────────────────────────────
  const { data: properties, error: fetchErr } = await supabase
    .from('properties')
    .select('id, title, title_en, title_es, description_es')
    .or('title_es.is.null,title_es.eq.')
    .eq('hidden', false)
    .order('created_at', { ascending: false })
    .limit(50)

  if (fetchErr) {
    console.error('❌  Fetch failed:', fetchErr.message)
    return
  }

  console.log(`🔄  Processing batch of ${properties?.length ?? 0} properties...\n`)

  let succeeded = 0
  let failed = 0

  for (const prop of properties ?? []) {
    const label = prop.title_en || prop.title || prop.id
    process.stdout.write(`  Translating: "${label}" ... `)

    try {
      const { error: fnError } = await supabase.functions.invoke('translate-property', {
        body: { propertyId: prop.id },
      })

      if (fnError) {
        // Try to extract the actual HTTP response body for better diagnostics
        let detail = fnError.message
        try {
          if ('context' in fnError && fnError.context instanceof Response) {
            const body = await (fnError.context as Response).text()
            detail += ` | status=${( fnError.context as Response).status} | body=${body}`
          }
        } catch { /* ignore */ }
        console.error(`FAILED — ${detail}`)
        failed++
      } else {
        console.log('✓')
        succeeded++
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error(`ERROR — ${msg}`)
      failed++
    }

    // 1 s delay between calls to avoid rate limits
    await new Promise((r) => setTimeout(r, 1000))
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`✅  Succeeded : ${succeeded}`)
  console.log(`❌  Failed    : ${failed}`)
  console.log(`📦  Remaining : ${(totalMissing ?? 0) - succeeded}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  if ((totalMissing ?? 0) - succeeded > 0) {
    console.log('ℹ️   Run again to process the next batch.\n')
  }
}

translateMissing().catch((e) => {
  console.error('Unhandled error:', e)
  process.exit(1)
})
