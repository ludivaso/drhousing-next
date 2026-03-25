import { createBrowserClient } from '@supabase/ssr'

// Creates a Supabase client for use in Client Components.
// createBrowserClient from @supabase/ssr stores the session in cookies
// so the middleware (which also reads cookies) can see the auth state.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Singleton for convenience — safe to use in 'use client' components
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
)
