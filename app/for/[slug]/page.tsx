import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { PropertyRow, CuratedListRow } from '@/src/integrations/supabase/types'
import CuratedListView from './CuratedListView'
import AccessDeniedScreen from './AccessDeniedScreen'

// Private client portfolios — never cache, never index.
export const dynamic   = 'force-dynamic'
export const revalidate = 0

// ── Metadata ─────────────────────────────────────────────────────────────────
// Fetch just the client_name for the title. Always noindex regardless of
// whether the token check later succeeds.
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const supabase = createSupabaseServerClient()
  // Cast needed: manually-added columns aren't in the auto-generated type snapshot
  const { data } = (await supabase
    .from('curated_lists')
    .select('client_name')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .maybeSingle()) as { data: Pick<CuratedListRow, 'client_name'> | null; error: unknown }

  const title = data?.client_name
    ? `Properties for ${data.client_name} | DR Housing`
    : 'Curated List | DR Housing'

  return {
    title,
    robots: { index: false, follow: false },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function CuratedListPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { k?: string }
}) {
  const supabase = createSupabaseServerClient()

  // 1. Fetch the curated list
  // Cast needed: manually-added columns (access_token, property_notes) aren't in
  // the auto-generated type snapshot that supabase-js 2.93 validates against.
  const { data: list } = (await supabase
    .from('curated_lists')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .maybeSingle()) as { data: CuratedListRow | null; error: unknown }

  if (!list) {
    return <AccessDeniedScreen reason="not_found" />
  }

  // 2. Token check — only enforced when access_token is set on the list
  if (list.access_token && list.access_token !== searchParams.k) {
    return <AccessDeniedScreen reason="invalid_token" />
  }

  // 3. Fetch properties referenced by this list.
  //    Visibility: include public-or-null. We do NOT filter out 'hidden'
  //    properties inside a curated list — Diego may have intentionally included
  //    off-market listings for a specific client.
  const propertyIds: string[] = list.property_ids ?? []
  let orderedProperties: PropertyRow[] = []

  if (propertyIds.length > 0) {
    const { data: rows } = (await supabase
      .from('properties')
      .select('*')
      .in('id', propertyIds)
      // Keep public or null visibility — curated may include unlisted/hidden
      .or('visibility.eq.public,visibility.is.null')) as { data: PropertyRow[] | null; error: unknown }

    // .in() does NOT preserve order — manually sort to match property_ids
    const map = new Map((rows ?? []).map((p) => [p.id, p]))
    orderedProperties = propertyIds
      .map((id) => map.get(id))
      .filter((p): p is PropertyRow => p !== undefined)
  }

  // 4. Extract property_notes as a typed map (property_id → note string)
  const propertyNotes: Record<string, string> = {}
  if (list.property_notes && typeof list.property_notes === 'object' && !Array.isArray(list.property_notes)) {
    for (const [k, v] of Object.entries(list.property_notes)) {
      if (typeof v === 'string' && v.trim()) {
        propertyNotes[k] = v
      }
    }
  }

  return (
    <CuratedListView
      list={list as CuratedListRow}
      initialProperties={orderedProperties}
      propertyNotes={propertyNotes}
    />
  )
}
