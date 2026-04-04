import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/src/integrations/supabase/types'

/**
 * Server-side Supabase client for admin Server Components.
 * Uses the anon key + session cookie — RLS grants the logged-in
 * admin user full read/write access to all tables.
 */
export function createAdminClient() {
  const cookieStore = cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
