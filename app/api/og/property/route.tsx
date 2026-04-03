import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const imageUrl = request.nextUrl.searchParams.get('image') || ''

  if (!imageUrl) {
    // No image — redirect to static fallback
    return NextResponse.redirect(
      new URL('/og-default.jpg', request.nextUrl.origin)
    )
  }

  // Supabase Storage supports image transforms via /render/image/ endpoint.
  // Convert:  .../storage/v1/object/public/BUCKET/PATH
  // To:       .../storage/v1/render/image/public/BUCKET/PATH?width=1200&height=630&quality=60&resize=cover
  // This serves a compressed JPEG — typically 80–200KB, well under WhatsApp's 600KB limit.
  const supabaseTransform = imageUrl.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  )

  const transformUrl = new URL(supabaseTransform)
  transformUrl.searchParams.set('width', '1200')
  transformUrl.searchParams.set('height', '630')
  transformUrl.searchParams.set('quality', '60')
  transformUrl.searchParams.set('resize', 'cover')

  const response = NextResponse.redirect(transformUrl.toString(), { status: 302 })
  response.headers.set('Cache-Control', 'public, max-age=86400, immutable')
  return response
}
