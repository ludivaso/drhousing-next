import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://vtmesmtcnazoqaputoqs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bWVzbXRjbmF6b3FhcHV0b3FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MDQ2NTgsImV4cCI6MjA4NTI4MDY1OH0.lOIODVQJqc48FjoqpYhraDFdloG6hn6cKWkyORAKs7w'
)

async function debug() {
  // Get one property that needs translation
  const { data } = await supabase
    .from('properties')
    .select('id, title_en, title_es')
    .or('title_es.is.null,title_es.eq.')
    .eq('hidden', false)
    .limit(1)

  const prop = data?.[0]
  console.log('Testing with property:', prop?.id, '|', prop?.title_en)

  const { data: fnData, error: fnError } = await supabase.functions.invoke('translate-property', {
    body: { propertyId: prop?.id },
  })

  if (fnError) {
    let detail = fnError.message
    try {
      const ctx = (fnError as any).context
      if (ctx && typeof ctx.text === 'function') {
        const status = ctx.status
        const body = await ctx.text()
        detail += ` | HTTP ${status} | body: ${body}`
      }
    } catch (e) {
      detail += ` | (could not read context: ${e})`
    }
    console.error('❌ ERROR:', detail)
  } else {
    console.log('✅ SUCCESS:', JSON.stringify(fnData))
  }
}

debug().catch((e) => console.error('Fatal:', e))
