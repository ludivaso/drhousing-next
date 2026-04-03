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
  const imageUrl = searchParams.get('image')    || ''

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

  // Fetch the property image and convert to base64.
  // ImageResponse (satori) cannot load arbitrary external URLs — converting
  // to a data URI is the only reliable way to embed an image.
  let imageDataUri = ''
  if (imageUrl) {
    try {
      const res = await fetch(imageUrl, {
        headers: { Accept: 'image/*' },
        signal: AbortSignal.timeout(4000),
      })
      if (res.ok) {
        const mime = (res.headers.get('content-type') || 'image/jpeg').split(';')[0]
        const buffer = await res.arrayBuffer()
        const bytes = new Uint8Array(buffer)
        let binary = ''
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i])
        }
        imageDataUri = `data:${mime};base64,${btoa(binary)}`
      }
    } catch {
      // Fetch timed out or failed — fall back to gradient background
      imageDataUri = ''
    }
  }

  const imageResponse = new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'sans-serif',
          overflow: 'hidden',
          position: 'relative',
          background: imageDataUri
            ? 'transparent'
            : 'linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 40%, #1a1a1a 100%)',
        }}
      >
        {/* Background photo */}
        {imageDataUri ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageDataUri}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : null}

        {/* Dark gradient overlay — always present so text is legible */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.85) 100%)',
          }}
        />

        {/* Top bar */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: '56px',
            right: '56px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
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
              padding: '6px 18px',
              borderRadius: '20px',
              letterSpacing: '0.08em',
            }}
          >
            {statusLabel}
          </div>
        </div>

        {/* Bottom content */}
        <div
          style={{
            position: 'absolute',
            bottom: '44px',
            left: '56px',
            right: '56px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {/* Gold accent */}
          <div style={{ width: '48px', height: '3px', background: '#C9A96E' }} />

          {/* Subtitle */}
          {subtitle ? (
            <span style={{ color: '#C9A96E', fontSize: '18px', fontStyle: 'italic' }}>
              {subtitle.length > 60 ? subtitle.slice(0, 57) + '...' : subtitle}
            </span>
          ) : null}

          {/* Title */}
          <span
            style={{
              color: '#ffffff',
              fontSize: '40px',
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: '950px',
            }}
          >
            {title.length > 65 ? title.slice(0, 62) + '...' : title}
          </span>

          {/* Location */}
          <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '17px' }}>
            {location}
          </span>

          {/* Divider */}
          <div style={{ width: '100%', height: '1px', background: 'rgba(201,169,110,0.3)', marginTop: '4px' }} />

          {/* Price + specs + domain */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {price ? (
                <span style={{ color: '#C9A96E', fontSize: '34px', fontWeight: 700 }}>
                  {price}
                </span>
              ) : null}
              {specs ? (
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '17px' }}>
                  {specs}
                </span>
              ) : null}
            </div>
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
