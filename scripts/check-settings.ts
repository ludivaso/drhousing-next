import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://vtmesmtcnazoqaputoqs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bWVzbXRjbmF6b3FhcHV0b3FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MDQ2NTgsImV4cCI6MjA4NTI4MDY1OH0.lOIODVQJqc48FjoqpYhraDFdloG6hn6cKWkyORAKs7w'
)

async function main() {
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value')

  if (error) { console.error('Error:', error.message); return }

  console.log('\n── All site_settings rows ──')
  for (const row of data ?? []) {
    if (row.key === 'service_cards') {
      console.log(`key: ${row.key}`)
      try {
        const parsed = JSON.parse(row.value)
        console.log('value (parsed):', JSON.stringify(parsed, null, 2))
      } catch {
        console.log('value (raw):', row.value)
      }
    } else {
      console.log(`key: ${row.key}  →  ${row.value}`)
    }
  }
}

main().catch(console.error)
