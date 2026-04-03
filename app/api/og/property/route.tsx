import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const title = searchParams.get('title') ?? ''
  const price = searchParams.get('price') ?? ''
  const subtitle = searchParams.get('subtitle') ?? ''
  const status = searchParams.get('status') ?? 'for_sale'
  const image = searchParams.get('image') ?? ''
  const beds = searchParams.get('beds') ?? ''
  const baths = searchParams.get('baths') ?? ''
  const sqm = searchParams.get('sqm') ?? ''

  const statusLabel =
    status === 'for_rent' ? 'EN ALQUILER' :
    status === 'both'     ? 'VENTA & ALQUILER' :
                            'EN VENTA'

  const statusBg =
    status === 'for_rent' ? '#2563EB' :
    status === 'both'     ? '#C9A96E' :
                            '#16A34A'

  const specs = [
    beds  ? `${beds} hab`   : null,
    baths ? `${baths} baños` : null,
    sqm   ? `${sqm} m²`     : null,
  ].filter(Boolean).join('  ·  ')

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'sans-serif',
          overflow: 'hidden',
          backgroundColor: '#1A1A1A',
        }}
      >
        {/* Background image */}
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}

        {/* Dark gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, transparent 10%, rgba(0,0,0,0.85) 100%)',
          }}
        />

        {/* Top-left: DR HOUSING branding */}
        <div
          style={{
            position: 'absolute',
            top: '28px',
            left: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <span
            style={{
              color: 'white',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            DR HOUSING
          </span>
          <div
            style={{
              width: '80px',
              height: '2px',
              backgroundColor: '#C9A96E',
            }}
          />
        </div>

        {/* Top-right: status badge */}
        <div
          style={{
            position: 'absolute',
            top: '28px',
            right: '32px',
            backgroundColor: statusBg,
            color: 'white',
            fontSize: '12px',
            fontWeight: 700,
            padding: '4px 14px',
            borderRadius: '999px',
            letterSpacing: '0.05em',
          }}
        >
          {statusLabel}
        </div>

        {/* Bottom section */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '32px',
            right: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {/* Subtitle */}
          {subtitle && (
            <span
              style={{
                color: '#C9A96E',
                fontSize: '16px',
                fontStyle: 'italic',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                maxWidth: '800px',
              }}
            >
              {subtitle}
            </span>
          )}

          {/* Title */}
          <span
            style={{
              color: 'white',
              fontSize: '32px',
              fontWeight: 700,
              lineHeight: 1.2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              maxWidth: '900px',
            }}
          >
            {title}
          </span>

          {/* Price */}
          {price && (
            <span
              style={{
                color: '#C9A96E',
                fontSize: '28px',
                fontWeight: 700,
                marginTop: '8px',
              }}
            >
              {price}
            </span>
          )}

          {/* Spec row */}
          {specs && (
            <span
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: '16px',
                marginTop: '4px',
              }}
            >
              {specs}
            </span>
          )}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            borderTop: '2px solid #C9A96E',
            paddingRight: '24px',
          }}
        >
          <span
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '12px',
            }}
          >
            drhousing.net
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
