import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/** GET /api/admin/blog/[id] — single post by id */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = createAdminClient()
    const { data, error } = await (admin as any)
      .from('blog_posts')
      .select('*')
      .eq('id', params.id)
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 404 })
    return NextResponse.json(data)
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

/** PUT /api/admin/blog/[id] — update a post */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = createAdminClient()
    const body = await req.json()
    const { data, error } = await (admin as any)
      .from('blog_posts')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
        published_at: body.published
          ? (body.published_at ?? new Date().toISOString())
          : null,
      })
      .eq('id', params.id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

/** DELETE /api/admin/blog/[id] — delete a post */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = createAdminClient()
    const { error } = await (admin as any)
      .from('blog_posts')
      .delete()
      .eq('id', params.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
