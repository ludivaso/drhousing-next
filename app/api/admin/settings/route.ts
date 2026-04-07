import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const admin = createAdminClient()
    const { data, error } = await (admin as any)
      .from('site_settings')
      .select('key, value')

    if (error) return NextResponse.json({})

    const map = Object.fromEntries(
      (data ?? []).map((r: { key: string; value: string }) => [r.key, r.value])
    )
    return NextResponse.json(map)
  } catch {
    return NextResponse.json({})
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = createAdminClient()
    const body = await req.json()

    const rows = Object.entries(body).map(([key, value]) => ({
      key,
      value: typeof value === 'string' ? value : JSON.stringify(value),
      updated_at: new Date().toISOString(),
    }))

    const { error } = await (admin as any).from('site_settings').upsert(rows)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
