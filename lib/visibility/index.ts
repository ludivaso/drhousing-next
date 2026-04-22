import { createServerClient } from '@supabase/ssr'
import { matchesRoute } from './routes'

export type VisibilityMap = Map<string, 'public' | 'private'>

interface SupabaseLike {
  from: (table: string) => {
    select: (cols: string) => Promise<{ data: unknown; error: unknown }>
  }
}

// In-memory cache. Works within a warm Edge/Node function instance; cold starts
// re-fetch. 30s TTL is fine for an admin tool — changes propagate fast enough.
let visibilityCache: { map: VisibilityMap; exp: number } | null = null
let pinCache: { hash: string | null; exp: number } | null = null
const TTL_MS = 30_000

/** Invalidate the module-level caches. Call after admin writes. */
export function invalidateVisibilityCache() {
  visibilityCache = null
  pinCache = null
}

export async function getVisibilityMap(supabase: SupabaseLike): Promise<VisibilityMap> {
  if (visibilityCache && Date.now() < visibilityCache.exp) return visibilityCache.map

  const { data } = await supabase.from('page_visibility').select('path, status')
  const rows = (data as { path: string; status: 'public' | 'private' }[] | null) ?? []
  const map: VisibilityMap = new Map(rows.map(r => [r.path, r.status]))

  visibilityCache = { map, exp: Date.now() + TTL_MS }
  return map
}

export async function getPinHash(supabase: SupabaseLike): Promise<string | null> {
  if (pinCache && Date.now() < pinCache.exp) return pinCache.hash

  const { data } = await supabase.from('preview_pin').select('pin_hash')
  const row = (data as { pin_hash: string | null }[] | null)?.[0]
  const hash = row?.pin_hash ?? null

  pinCache = { hash, exp: Date.now() + TTL_MS }
  return hash
}

/**
 * Returns true if the given base path (no /en or /es prefix) matches a
 * `private` entry in the visibility map.
 */
export function isPathPrivate(basePath: string, map: VisibilityMap): boolean {
  for (const [path, status] of map) {
    if (status === 'private' && matchesRoute(basePath, path)) return true
  }
  return false
}

/**
 * Middleware-friendly Supabase client. Uses anon key — RLS on page_visibility
 * allows public reads; preview_pin reads only happen in admin/server contexts.
 */
export function createMiddlewareSupabase(getCookies: () => { name: string; value: string }[]) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: getCookies,
        setAll: () => {},
      },
    }
  )
}
