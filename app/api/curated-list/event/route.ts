import { createSupabaseServerClient } from '@/lib/supabase/server'

// Analytics event collector — always returns 200 even on insert failure so
// analytics never breaks the user experience.
export async function POST(req: Request): Promise<Response> {
  try {
    const body: unknown = await req.json()
    if (typeof body !== 'object' || body === null) return Response.json({ ok: true })

    const b = body as Record<string, unknown>
    const curated_list_id = b['curated_list_id']
    const anonymous_id    = b['anonymous_id']
    const event_type      = b['event_type']

    if (
      typeof curated_list_id !== 'string' ||
      typeof anonymous_id    !== 'string' ||
      typeof event_type      !== 'string'
    ) {
      return Response.json({ ok: true }) // missing required fields — still 200
    }

    const supabase = createSupabaseServerClient()
    // curated_list_events added manually to types.ts; cast until CLI regen
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    await db.from('curated_list_events').insert({
      curated_list_id,
      anonymous_id,
      event_type,
      property_id: typeof b['property_id'] === 'string' ? b['property_id'] : null,
      metadata:    b['metadata'] != null ? b['metadata'] : null,
    })
    // Ignore error — analytics must never block the user
  } catch {
    // swallow
  }
  return Response.json({ ok: true })
}
