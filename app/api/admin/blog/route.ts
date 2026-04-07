import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/** GET /api/admin/blog — all posts (published + drafts) */
export async function GET() {
  try {
    const admin = createAdminClient()
    const { data, error } = await (admin as any)
      .from('blog_posts')
      .select('id,slug,title,title_en,category,published,featured,published_at,created_at,image,read_time')
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data ?? [])
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

/** POST /api/admin/blog — create a new post */
export async function POST(req: NextRequest) {
  try {
    const admin = createAdminClient()
    const body = await req.json()
    const { data, error } = await (admin as any)
      .from('blog_posts')
      .insert([{
        ...body,
        updated_at: new Date().toISOString(),
        published_at: body.published ? (body.published_at ?? new Date().toISOString()) : null,
      }])
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
