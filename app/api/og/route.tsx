import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  let imageUrl = 'https://drhousing.net/og-default.jpg'
  let title = 'DR Housing | Luxury Real Estate Costa Rica'
  let location = 'Escazú · Santa Ana · Costa Rica'
  let price = ''

  if (slug) {
    const { data: property } = await supabase
      .from('properties')
      .select('title, title_es, featured_images, images, location_name, price_sale, price_rent_monthly, currency')
      .or('visibility.eq.public,visibility.is.null')
      .eq('slug', slug)
      .single()

    if (property) {
      const rawImage = property.featured_images?.[0] ?? property.images?.[0]
      if (rawImage) imageUrl = rawImage
      title = property.title_es ?? property.title ?? title
      location = property.location_name ?? location
      if (property.price_sale) {
        price = `$${Number(property.price_sale).toLocaleString('en-US')} ${property.currency ?? 'USD'}`
      } else if (property.price_rent_monthly) {
        price = `$${Number(property.price_rent_monthly).toLocaleString('en-US')}/mes`
      }
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          position: 'relative',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        {/* Dark gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0) 100%)',
          }}
        />
        {/* Content */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '40px 48px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {price ? (
            <div style={{ color: '#C9A96E', fontSize: '22px', fontWeight: 600 }}>
              {price}
            </div>
          ) : null}
          <div
            style={{
              color: '#FFFFFF',
              fontSize: '36px',
              fontWeight: 700,
              lineHeight: 1.2,
              maxWidth: '900px',
            }}
          >
            {title.length > 80 ? title.slice(0, 77) + '...' : title}
          </div>
          <div style={{ color: '#E8E3DC', fontSize: '20px' }}>
            {location}
          </div>
          <div style={{ color: '#C9A96E', fontSize: '16px', marginTop: '4px' }}>
            DR Housing · drhousing.net
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
