import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/src/integrations/supabase/types'

// Server-side client for SSG/SSR — uses anon key (RLS enforces access)
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
