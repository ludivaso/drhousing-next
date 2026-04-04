import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/src/integrations/supabase/types'

/**
 * Service-role Supabase client — bypasses RLS.
 * Use ONLY in server-side admin code (Server Components, API routes, server actions).
 * Never expose to the browser.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in env.
 * Falls back to anon key in local dev if key not set (limited access).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey   = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createClient<Database>(url, serviceKey ?? anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
