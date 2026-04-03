import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const title    = searchParams.get('title')    || 'Propiedad en Costa Rica'
  const price    = searchParams.get('price')    || ''
  const subtitle = searchParams.get('subtitle') || ''
  const status   = searchParams.get('status')   || 'for_sale'
  const beds     = searchParams.get('beds')     || ''
  const baths    = searchParams.get('baths')    || ''
  const sqm      = searchParams.get('sqm')      || ''
  const location = searchParams.get('location') || 'Costa Rica'

  const statusLabel =
    status === 'for_sale' ? 'EN VENTA' :
    status === 'for_rent' ? 'EN ALQUILER' :
                            'VENTA & ALQUILER'

  const statusColor =
    status === 'for_sale' ? '#2e7d32' :
    status === 'for_rent' ? '#1565c0' :
                            '#C9A96E'

  const specs = [
    beds  ? `${beds} hab`    : null,
    baths ? `${baths} baños` : null,
    sqm   ? `${sqm} m²`     : null,
  ].filter(Boolean).join('   ·   ')

  const imageResponse = new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 40%, #1a1a1a 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 56px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ color: '#ffffff', fontSize: '18px', fontWeight: 700, letterSpacing: '0.15em' }}>
              DR HOUSING
            </span>
            <div style={{ width: '80px', height: '2px', background: '#C9A96E' }} />
          </div>
          <div
            style={{
              background: statusColor,
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              padding: '6px 16px',
              borderRadius: '20px',
              letterSpacing: '0.08em',
            }}
          >
            {statusLabel}
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'center', padding: '32px 0' }}>
          {/* Decorative gold line */}
          <div style={{ width: '48px', height: '3px', background: '#C9A96E' }} />

          {/* Subtitle */}
          {subtitle ? (
            <span style={{ color: '#C9A96E', fontSize: '18px', fontStyle: 'italic', opacity: 0.9 }}>
              {subtitle}
            </span>
          ) : null}

          {/* Title */}
          <span
            style={{
              color: '#ffffff',
              fontSize: '42px',
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: '900px',
            }}
          >
            {title.length > 60 ? title.slice(0, 57) + '...' : title}
          </span>

          {/* Location */}
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '18px', marginTop: '4px' }}>
            📍 {location}
          </span>
        </div>

        {/* Bottom section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Gold divider */}
          <div style={{ width: '100%', height: '1px', background: 'rgba(201,169,110,0.3)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            {/* Price + specs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {price ? (
                <span style={{ color: '#C9A96E', fontSize: '36px', fontWeight: 700 }}>
                  {price}
                </span>
              ) : null}
              {specs ? (
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '18px' }}>
                  {specs}
                </span>
              ) : null}
            </div>

            {/* Domain watermark */}
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', letterSpacing: '0.05em' }}>
              drhousing.net
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )

  imageResponse.headers.set('Cache-Control', 'public, max-age=86400, immutable')
  return imageResponse
}
