import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/src/integrations/supabase/types'

// Browser client using @supabase/ssr so cookies are set correctly
// This ensures the middleware (which reads cookies) can see the session
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
