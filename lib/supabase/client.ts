import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/src/integrations/supabase/types'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// Server-side client for SSG/SSR — uses anon key (RLS enforces access)
export const supabase = createClient<Database>(
  url || 'https://placeholder.supabase.co',
  key || 'placeholder'
)
