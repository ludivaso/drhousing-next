/**
 * GET /api/pdf/brochure?id=<property-id>&lang=es|en
 *
 * Returns a PDF brochure for the given property.
 * Server-side only — uses react-pdf renderToBuffer.
 * Protected: must be called from admin (cookie session) or direct server use.
 */

import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React, { type ReactElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { PropertyBrochure } from '@/lib/pdf/PropertyBrochure'
import type { PropertyRow } from '@/src/integrations/supabase/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id   = searchParams.get('id')
  const lang = (searchParams.get('lang') ?? 'es') as 'es' | 'en'

  if (!id) {
    return NextResponse.json({ error: 'Missing `id` query param' }, { status: 400 })
  }

  // ── Auth guard (admin session required) ──
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Fetch property ──
  const { data: property, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !property) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 })
  }

  // ── Render PDF ──
  try {
    const element = React.createElement(PropertyBrochure, { property: property as PropertyRow, lang }) as unknown as ReactElement<DocumentProps>
    const buffer = await renderToBuffer(element)

    const filename = `drhousing-${(property as PropertyRow).slug ?? id}-${lang}.pdf`

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length':      String(buffer.byteLength),
        'Cache-Control':       'private, no-store',
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Render error'
    console.error('[pdf/brochure]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
