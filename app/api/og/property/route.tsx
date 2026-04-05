import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

const STATUS_LABELS: Record<string, string> = {
  for_sale:       'En Venta',
  for_rent:       'En Alquiler',
  both:           'Venta & Alquiler',
  presale:        'Preventa',
  under_contract: 'Bajo Contrato',
  sold:           'Vendido',
  rented:         'Alquilado',
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const title    = searchParams.get('title')    ?? 'DR Housing'
  const price    = searchParams.get('price')    ?? ''
  const location = searchParams.get('location') ?? 'Costa Rica'
  const beds     = searchParams.get('beds')     ?? ''
  const baths    = searchParams.get('baths')    ?? ''
  const sqm      = searchParams.get('sqm')      ?? ''
  const status   = searchParams.get('status')   ?? ''
  const imageUrl = searchParams.get('image')    ?? ''

  const statusLabel = STATUS_LABELS[status] ?? ''

  // Fetch the property photo as base64 so Satori can embed it.
  // Use Supabase image transform to get a pre-cropped 1200×630 JPEG.
  let bgSrc: string | null = null
  if (imageUrl) {
    try {
      const transformUrl = imageUrl.replace(
        '/storage/v1/object/public/',
        '/storage/v1/render/image/public/'
      )
      const u = new URL(transformUrl)
      u.searchParams.set('width',   '1200')
      u.searchParams.set('height',  '630')
      u.searchParams.set('quality', '70')
      u.searchParams.set('resize',  'cover')

      const res = await fetch(u.toString())
      if (res.ok) {
        const buf  = await res.arrayBuffer()
        const mime = res.headers.get('content-type') ?? 'image/jpeg'
        bgSrc = `data:${mime};base64,${Buffer.from(buf).toString('base64')}`
      }
    } catch {
      // fall through — render without background photo
    }
  }

  const titleSize = title.length > 60 ? '34px' : title.length > 40 ? '40px' : '48px'

  return new ImageResponse(
    (
      <div
        style={{
          display:         'flex',
          width:           '1200px',
          height:          '630px',
          position:        'relative',
          backgroundColor: '#1B3A2D',
          fontFamily:      'Georgia, "Times New Roman", serif',
          overflow:        'hidden',
        }}
      >
        {/* Property photo background */}
        {bgSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bgSrc}
            alt=""
            width={1200}
            height={630}
            style={{
              position:   'absolute',
              top:        0,
              left:       0,
              width:      '100%',
              height:     '100%',
              objectFit:  'cover',
              opacity:    0.45,
            }}
          />
        )}

        {/* Gradient: transparent top → dark bottom */}
        <div
          style={{
            position:   'absolute',
            top:        0,
            left:       0,
            right:      0,
            bottom:     0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.10) 100%)',
            display:    'flex',
          }}
        />

        {/* All content sits above background layers */}
        <div
          style={{
            position:       'absolute',
            top:            0,
            left:           0,
            right:          0,
            bottom:         0,
            display:        'flex',
            flexDirection:  'column',
            justifyContent: 'space-between',
            padding:        '48px 56px',
          }}
        >
          {/* ── Top row: brand mark + status badge ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>

            {/* DR Housing wordmark */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width:           '50px',
                  height:          '50px',
                  borderRadius:    '8px',
                  backgroundColor: '#C9A96E',
                  display:         'flex',
                  alignItems:      'center',
                  justifyContent:  'center',
                  fontSize:        '22px',
                  fontWeight:      '700',
                  color:           '#fff',
                  fontFamily:      'Georgia, serif',
                  letterSpacing:   '-0.5px',
                }}
              >
                DR
              </div>
              <span
                style={{
                  color:       '#fff',
                  fontSize:    '24px',
                  fontWeight:  '600',
                  fontFamily:  'Georgia, serif',
                  letterSpacing: '-0.3px',
                }}
              >
                DR Housing
              </span>
            </div>

            {/* Status pill */}
            {statusLabel && (
              <div
                style={{
                  backgroundColor: '#C9A96E',
                  color:           '#fff',
                  fontSize:        '15px',
                  fontWeight:      '700',
                  padding:         '9px 22px',
                  borderRadius:    '100px',
                  letterSpacing:   '1px',
                  textTransform:   'uppercase',
                  fontFamily:      'system-ui, -apple-system, sans-serif',
                }}
              >
                {statusLabel}
              </div>
            )}
          </div>

          {/* ── Bottom block: location → title → price + stats ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

            {/* Location */}
            <div
              style={{
                color:         '#C9A96E',
                fontSize:      '17px',
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                fontFamily:    'system-ui, -apple-system, sans-serif',
                fontWeight:    '500',
              }}
            >
              {location} · Costa Rica
            </div>

            {/* Title */}
            <div
              style={{
                color:       '#ffffff',
                fontSize:    titleSize,
                fontWeight:  '700',
                lineHeight:  '1.1',
                fontFamily:  'Georgia, "Times New Roman", serif',
                maxWidth:    '980px',
              }}
            >
              {title}
            </div>

            {/* Price + stats row */}
            <div
              style={{
                display:     'flex',
                alignItems:  'center',
                gap:         '28px',
                marginTop:   '6px',
              }}
            >
              {price && (
                <div
                  style={{
                    color:         '#C9A96E',
                    fontSize:      '38px',
                    fontWeight:    '700',
                    fontFamily:    'Georgia, "Times New Roman", serif',
                    letterSpacing: '-0.5px',
                    lineHeight:    '1',
                  }}
                >
                  {price}
                </div>
              )}

              {(beds || baths || sqm) && (
                <div
                  style={{
                    display:    'flex',
                    gap:        '20px',
                    color:      'rgba(255,255,255,0.80)',
                    fontSize:   '20px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    alignItems: 'center',
                    paddingLeft: price ? '4px' : '0',
                    borderLeft:  price ? '2px solid rgba(255,255,255,0.25)' : 'none',
                    paddingTop:  '4px',
                    paddingBottom: '4px',
                  }}
                >
                  {beds  && <span>{beds} hab.</span>}
                  {baths && <span>{baths} baños</span>}
                  {sqm   && <span>{sqm} m²</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width:  1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, immutable',
      },
    }
  )
}
