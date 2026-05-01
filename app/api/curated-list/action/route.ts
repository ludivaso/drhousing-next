import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Database } from '@/src/integrations/supabase/types'

type ActionInsert = Database['public']['Tables']['curated_list_actions']['Insert']

export async function POST(req: Request): Promise<Response> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return Response.json({ error: 'Invalid body' }, { status: 400 })
  }

  const b = body as Record<string, unknown>
  const curated_list_id = b['curated_list_id']
  const anonymous_id = b['anonymous_id']

  if (typeof curated_list_id !== 'string' || typeof anonymous_id !== 'string') {
    return Response.json({ error: 'Missing curated_list_id or anonymous_id' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()
  // curated_list_actions was added manually to types.ts; cast bypasses PostgREST v12
  // template-literal validation until CLI regen is possible (requires Node 20.17+).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // Batch reorder: body contains `actions` array of { property_id, sort_order }
  if (Array.isArray(b['actions'])) {
    const rows: ActionInsert[] = (b['actions'] as Array<Record<string, unknown>>)
      .filter((a) => typeof a['property_id'] === 'string')
      .map((a) => ({
        curated_list_id,
        anonymous_id,
        property_id: a['property_id'] as string,
        sort_order: typeof a['sort_order'] === 'number' ? a['sort_order'] : null,
        hearted: false,
        updated_at: new Date().toISOString(),
      }))

    if (rows.length === 0) {
      return Response.json({ error: 'No valid actions' }, { status: 400 })
    }

    const { error } = await db
      .from('curated_list_actions')
      .upsert(rows, { onConflict: 'curated_list_id,anonymous_id,property_id' })

    if (error) {
      console.error('curated-list/action batch error:', error.message)
      return Response.json({ error: error.message }, { status: 500 })
    }
    return Response.json({ ok: true })
  }

  // Single action: heart toggle (may also carry sort_order)
  const property_id = b['property_id']
  if (typeof property_id !== 'string') {
    return Response.json({ error: 'Missing property_id' }, { status: 400 })
  }

  const row: ActionInsert = {
    curated_list_id,
    anonymous_id,
    property_id,
    updated_at: new Date().toISOString(),
  }

  if (typeof b['hearted'] === 'boolean') row.hearted = b['hearted']
  if (typeof b['sort_order'] === 'number') row.sort_order = b['sort_order']

  const { error } = await db
    .from('curated_list_actions')
    .upsert(row, { onConflict: 'curated_list_id,anonymous_id,property_id' })

  if (error) {
    console.error('curated-list/action error:', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }
  return Response.json({ ok: true })
}
