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

  // Fetch image → base64 data URI.
  // Satori (ImageResponse) cannot load arbitrary external URLs — only
  // data URIs work reliably. backgroundImage css does NOT work; use <img>.
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
      imageDataUri = ''
    }
  }

  const imageResponse = new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          position: 'relative',
          display: 'flex',
          fontFamily: 'sans-serif',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 40%, #1a1a1a 100%)',
        }}
      >
        {/* Property photo — rendered as <img> which satori supports */}
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

        {/* Dark gradient overlay for text legibility */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.10) 30%, rgba(0,0,0,0.72) 65%, rgba(0,0,0,0.92) 100%)',
            display: 'flex',
          }}
        />

        {/* Top bar */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: '52px',
            right: '52px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: 700, letterSpacing: '0.18em' }}>
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
            left: '52px',
            right: '52px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {subtitle ? (
            <span style={{ color: '#C9A96E', fontSize: '15px', fontStyle: 'italic' }}>
              {subtitle.slice(0, 70)}
            </span>
          ) : null}

          <span
            style={{
              color: '#ffffff',
              fontSize: title.length > 55 ? '30px' : '36px',
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {title.slice(0, 72)}{title.length > 72 ? '...' : ''}
          </span>

          <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', marginTop: '2px' }}>
            {location}
          </span>

          {price ? (
            <span style={{ color: '#C9A96E', fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>
              {price}
            </span>
          ) : null}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            {specs ? (
              <span style={{ color: 'rgba(255,255,255,0.80)', fontSize: '15px' }}>
                {specs}
              </span>
            ) : <span />}
            <span style={{ color: 'rgba(255,255,255,0.40)', fontSize: '12px' }}>
              drhousing.net
            </span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )

  imageResponse.headers.set('Cache-Control', 'public, max-age=86400, immutable')
  return imageResponse
}
