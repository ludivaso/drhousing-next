// Middleware-only helpers for resolving advisor vanity URLs (/{firstName}) and
// legacy UUID profile links. Cached the same way as lib/visibility: a 30s
// module-level TTL cache that's warm-instance-only and fails open on error.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseLike = { from: (table: string) => any }

interface VanityEntry {
  firstNameSlug: string
  slug: string
}

let vanityCache: { entries: VanityEntry[]; exp: number } | null = null
const TTL_MS = 30_000

// Combining diacritical marks block (U+0300–U+036F) — strips accents after
// NFD normalization, e.g. "é" → "e" + U+0301 → "e". Written as an escaped
// range to avoid embedding literal combining characters in source.
const COMBINING_MARKS_RE = /[̀-ͯ]/g

function slugifyFirstName(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0] ?? ''
  return first
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_MARKS_RE, '')
    .replace(/[^a-z0-9]/g, '')
}

/** Published advisors' first-name slugs, for single-segment vanity URL resolution. */
export async function getVanityEntries(supabase: SupabaseLike): Promise<VanityEntry[]> {
  if (vanityCache && Date.now() < vanityCache.exp) return vanityCache.entries

  const { data } = await supabase
    .from('agents')
    .select('full_name, slug')
    .eq('is_team_member', true)
    .not('slug', 'is', null)

  const rows = (data as { full_name: string; slug: string }[] | null) ?? []
  const entries = rows
    .map((r) => ({ firstNameSlug: slugifyFirstName(r.full_name), slug: r.slug }))
    .filter((e) => e.firstNameSlug.length > 0)

  vanityCache = { entries, exp: Date.now() + TTL_MS }
  return entries
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(value: string): boolean {
  return UUID_RE.test(value)
}

/** Resolves a legacy UUID agent link to its canonical slug — published advisors only. */
export async function resolveAgentSlugById(supabase: SupabaseLike, id: string): Promise<string | null> {
  const { data } = await supabase
    .from('agents')
    .select('slug')
    .eq('id', id)
    .eq('is_team_member', true)
    .not('slug', 'is', null)
    .maybeSingle()
  return (data as { slug: string } | null)?.slug ?? null
}

// Reserved single-segment paths that a vanity advisor URL must never shadow.
// Combines the explicit denylist from the spec with every real top-level
// route currently in the site. Existing routes always win.
export const RESERVED_VANITY_PATHS = new Set([
  // Explicit denylist
  'en', 'es', 'properties', 'contact', 'services', 'agents', 'for',
  'private', 'collections', 'admin', 'buyers', 'sellers', 'market-report',
  'cerro-alto-escazu', 'api', '_next', 'favicon.ico', 'robots.txt', 'sitemap.xml',
  // Other real top-level routes in the site
  'alquiler', 'blog', 'desarrollos', 'family-affairs', 'favoritos',
  'for-sale', 'guia-west-gam', 'interior-design', 'privacidad', 'privacy',
  'property', 'rentals', 'terminos', 'terms', 'tools', 'venta',
  'preview-gate', 'og-default.jpg', 'site.webmanifest',
])
