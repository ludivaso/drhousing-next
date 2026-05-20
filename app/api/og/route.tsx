import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://drhousing.net').replace(/\/$/, '')

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  let title = 'DR Housing'
  let subtitle = 'Luxury Real Estate · Costa Rica'
  let price = ''
  let heroSrc = `${SITE_URL}/og-default.jpg`

  if (slug) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/properties` +
          `?slug=eq.${encodeURIComponent(slug)}` +
          `&or=(visibility.eq.public,visibility.is.null)` +
          `&select=title_es,title,location_name,price_sale,price_rent_monthly,currency,featured_images,images` +
          `&limit=1`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      )
      if (res.ok) {
        const data = await res.json()
        const prop = Array.isArray(data) ? data[0] : null
        if (prop) {
          title = prop.title_es ?? prop.title ?? title
          subtitle = prop.location_name ?? subtitle

          if (prop.price_sale) {
            price = `$${Number(prop.price_sale).toLocaleString('en-US')} USD`
          } else if (prop.price_rent_monthly) {
            price = `$${Number(prop.price_rent_monthly).toLocaleString('en-US')}/mes`
          }

          const rawImg: string | undefined =
            prop.featured_images?.[0] ?? prop.images?.[0]

          if (rawImg) {
            // Route all image formats (including AVIF/WebP) through Next.js image
            // optimizer so Satori always receives a JPEG — never fails on format.
            heroSrc = `${SITE_URL}/_next/image?url=${encodeURIComponent(rawImg)}&w=1200&q=85`
          }
        }
      }
    } catch {
      // silent fallback — og-default.jpg shown
    }
  }

  const displayTitle =
    title.length > 68
      ? title.slice(0, 65).replace(/\s\S*$/, '') + '…'
      : title

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}
      >
        {/* Full-bleed hero photo */}
        <img
          src={heroSrc}
          width={1200}
          height={630}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Gradient overlay — transparent top, dark bottom */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.22) 38%, rgba(0,0,0,0.84) 100%)',
            display: 'flex',
          }}
        />

        {/* Gold top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 5,
            backgroundColor: '#C9A96E',
          }}
        />

        {/* Bottom text block */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '0 56px 44px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div
            style={{
              color: '#C9A96E',
              fontSize: 13,
              letterSpacing: 5,
              textTransform: 'uppercase',
            }}
          >
            DR HOUSING · COSTA RICA
          </div>

          <div
            style={{
              color: '#FFFFFF',
              fontSize: 40,
              fontWeight: 700,
              lineHeight: 1.2,
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            {displayTitle}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              marginTop: 4,
            }}
          >
            <div style={{ color: '#E8E3DC', fontSize: 20 }}>{subtitle}</div>
            {price ? (
              <>
                <div style={{ color: '#C9A96E', fontSize: 20 }}>·</div>
                <div style={{ color: '#C9A96E', fontSize: 22, fontWeight: 600 }}>
                  {price}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
