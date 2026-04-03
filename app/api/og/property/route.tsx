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
    status === 'for_rent' ? 'EN ALQUILER' : 'VENTA & ALQUILER'

  const statusColor =
    status === 'for_sale' ? '#2e7d32' :
    status === 'for_rent' ? '#1565c0' : '#C9A96E'

  const specs = [
    beds  ? `${beds} hab`    : null,
    baths ? `${baths} baños` : null,
    sqm   ? `${sqm} m²`     : null,
  ].filter(Boolean).join('   ·   ')

  // Fetch the property image and convert to base64.
  // This is the ONLY way ImageResponse can use external images.
  let imageBase64 = ''
  if (imageUrl) {
    try {
      const res = await fetch(imageUrl, {
        headers: { 'Accept': 'image/*' },
        signal: AbortSignal.timeout(4000),
      })
      if (res.ok) {
        const contentType = res.headers.get('content-type') || 'image/jpeg'
        const imageMime = contentType.split(';')[0]
        const arrayBuffer = await res.arrayBuffer()
        const bytes = new Uint8Array(arrayBuffer)
        let binary = ''
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i])
        }
        imageBase64 = `data:${imageMime};base64,${btoa(binary)}`
      }
    } catch {
      // Fallback to gradient if image fetch fails
      imageBase64 = ''
    }
  }

  const backgroundStyle = imageBase64
    ? {
        backgroundImage: `url(${imageBase64})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        background: 'linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 40%, #1a1a1a 100%)',
      }

  const imageResponse = new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '0',
          position: 'relative',
          ...backgroundStyle,
        }}
      >
        {/* Dark gradient overlay — always on top of photo */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: imageBase64
              ? 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.75) 65%, rgba(0,0,0,0.92) 100%)'
              : 'transparent',
            display: 'flex',
          }}
        />

        {/* Content layer */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '40px 52px',
          }}
        >
          {/* Top bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'sans-serif' }}>
                DR HOUSING
              </span>
              <div style={{ width: '72px', height: '2px', background: '#C9A96E', display: 'flex' }} />
            </div>
            <div
              style={{
                background: statusColor,
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 700,
                padding: '5px 14px',
                borderRadius: '20px',
                letterSpacing: '0.08em',
                fontFamily: 'sans-serif',
              }}
            >
              {statusLabel}
            </div>
          </div>

          {/* Bottom content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {subtitle ? (
              <span style={{ color: '#C9A96E', fontSize: '15px', fontStyle: 'italic', fontFamily: 'sans-serif' }}>
                {subtitle.slice(0, 70)}
              </span>
            ) : null}

            <span
              style={{
                color: '#ffffff',
                fontSize: title.length > 55 ? '30px' : '36px',
                fontWeight: 700,
                lineHeight: 1.2,
                fontFamily: 'sans-serif',
                textShadow: '0 2px 8px rgba(0,0,0,0.6)',
              }}
            >
              {title.slice(0, 72)}{title.length > 72 ? '...' : ''}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span style={{ color: '#C9A96E', fontSize: '13px', fontFamily: 'sans-serif' }}>📍</span>
              <span style={{ color: '#ffffff', fontSize: '13px', opacity: 0.8, fontFamily: 'sans-serif' }}>
                {location}
              </span>
            </div>

            {price ? (
              <span style={{ color: '#C9A96E', fontSize: '28px', fontWeight: 700, fontFamily: 'sans-serif', marginTop: '4px' }}>
                {price}
              </span>
            ) : null}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              {specs ? (
                <span style={{ color: '#ffffff', fontSize: '15px', opacity: 0.8, fontFamily: 'sans-serif' }}>
                  {specs}
                </span>
              ) : <span />}
              <span style={{ color: '#ffffff', fontSize: '12px', opacity: 0.45, fontFamily: 'sans-serif' }}>
                drhousing.net
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )

  imageResponse.headers.set('Cache-Control', 'public, max-age=86400, immutable')
  return imageResponse
}
