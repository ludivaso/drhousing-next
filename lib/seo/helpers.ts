/**
 * lib/seo/helpers.ts
 * Zero external dependencies — vanilla TypeScript only.
 * Used by page server components to build JSON-LD structured data and
 * decide per-property robots directives.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

interface PublicCheck {
  hidden?: boolean | null
  visibility?: string | null
}

interface WithImages {
  images?: string[] | null
}

interface PropertyForSchema {
  title_en?: string | null
  title?: string | null
  description_en?: string | null
  description?: string | null
  images?: string[] | null
  created_at?: string | null
  location_name?: string | null
  lat?: number | null
  lng?: number | null
  price_sale?: number | null
  price_rent_monthly?: number | null
  status?: string | null
  bedrooms?: number | null
  construction_size_sqm?: number | null
  reference_id?: string | null
}

interface PropertyForList {
  hidden?: boolean | null
  visibility?: string | null
  slug?: string | null
  reference_id?: string | null
  title_en?: string | null
  title?: string | null
}

// ─── isPropertyPublic ─────────────────────────────────────────────────────────

/**
 * Returns true only if hidden is not true AND visibility is 'public', null, or
 * undefined. Returns false for visibility === 'private' or 'hidden'.
 */
export function isPropertyPublic(property: PublicCheck): boolean {
  if (property.hidden === true) return false
  const v = property.visibility
  if (v === 'private' || v === 'hidden') return false
  return true
}

// ─── getPropertyImage ────────────────────────────────────────────────────────

/**
 * Returns the first JPG/PNG URL from property.images (skipping .avif/.webp).
 * Falls back to the first image of any format. Returns null if no images.
 * Google Schema requires JPG/PNG for rich results.
 */
export function getPropertyImage(property: WithImages): string | null {
  const imgs = property.images
  if (!imgs || imgs.length === 0) return null

  const isJpgOrPng = (url: string) => /\.(jpe?g|png)(\?.*)?$/i.test(url)

  const preferred = imgs.find(url => isJpgOrPng(url))
  return preferred ?? imgs[0]
}

// ─── parseAddressCR ──────────────────────────────────────────────────────────

/**
 * Parses a free-text Costa Rica location string into addressLocality and
 * addressRegion for Schema.org PostalAddress.
 *
 * Example: "Piedades, Santa Ana, San José, Costa Rica"
 *   → { addressLocality: "Santa Ana", addressRegion: "San José" }
 */
export function parseAddressCR(locationName: string): {
  addressLocality: string | null
  addressRegion: string | null
} {
  const SKIP = new Set(['costa rica', 'elija valor', 'san josé', 'san jose'])

  const segments = (locationName ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !SKIP.has(s.toLowerCase()))

  if (segments.length < 1) {
    return { addressLocality: null, addressRegion: null }
  }

  const last = segments[segments.length - 1]
  const secondToLast = segments.length >= 2 ? segments[segments.length - 2] : null

  const addressLocality = secondToLast ?? last
  const addressRegion =
    secondToLast !== null && last !== secondToLast ? last : null

  return { addressLocality, addressRegion }
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\n+/g, ' ')
    .trim()
}

/** Recursively strips null and undefined values from an object's own keys. */
function removeNullish(
  obj: Record<string, unknown>
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== null && v !== undefined)
  )
}

// ─── buildPropertySchema ─────────────────────────────────────────────────────

/**
 * Builds a Schema.org RealEstateListing JSON-LD object.
 * Call only when isPropertyPublic(property) === true.
 * Returns a plain object — caller must JSON.stringify it.
 */
export function buildPropertySchema(
  property: PropertyForSchema,
  lang: string,
  slug: string
): Record<string, unknown> {
  const image = getPropertyImage(property)

  const rawDesc = (property.description_en || property.description || '').slice(0, 300)
  const description = rawDesc ? stripMarkdown(rawDesc) : undefined

  const addr = property.location_name
    ? parseAddressCR(property.location_name)
    : null

  const addressBlock =
    addr?.addressLocality
      ? removeNullish({
          '@type': 'PostalAddress',
          addressLocality: addr.addressLocality,
          addressRegion: addr.addressRegion ?? undefined,
          addressCountry: 'CR',
        })
      : null

  const geo =
    property.lat != null && property.lng != null
      ? {
          '@type': 'GeoCoordinates',
          latitude: property.lat,
          longitude: property.lng,
        }
      : null

  const status = property.status ?? ''
  const isSold = status === 'sold' || status === 'rented'
  const availability = isSold
    ? 'https://schema.org/Discontinued'
    : 'https://schema.org/InStock'

  const isSaleStatus = status === 'for_sale' || status === 'both' || status === 'presale'
  const offerPrice =
    isSaleStatus && property.price_sale != null
      ? property.price_sale
      : status === 'for_rent' && property.price_rent_monthly != null
      ? property.price_rent_monthly
      : null

  const offers =
    offerPrice != null
      ? {
          '@type': 'Offer',
          priceCurrency: 'USD',
          price: offerPrice,
          availability,
        }
      : null

  const floorSize =
    property.construction_size_sqm != null
      ? {
          '@type': 'QuantitativeValue',
          value: property.construction_size_sqm,
          unitCode: 'MTK',
        }
      : null

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title_en || property.title || undefined,
    description,
    url: `https://drhousing.net/${lang}/property/${slug}`,
    ...(image ? { image: [image] } : {}),
    ...(property.created_at ? { datePosted: property.created_at } : {}),
    ...(addressBlock ? { address: addressBlock } : {}),
    ...(geo ? { geo } : {}),
    ...(offers ? { offers } : {}),
    ...(property.bedrooms ? { numberOfRooms: property.bedrooms } : {}),
    ...(floorSize ? { floorSize } : {}),
    ...(property.reference_id
      ? {
          additionalProperty: {
            '@type': 'PropertyValue',
            name: 'Reference ID',
            value: property.reference_id,
          },
        }
      : {}),
  }

  return removeNullish(schema)
}

// ─── buildOrganizationSchema ─────────────────────────────────────────────────

/**
 * Builds a Schema.org RealEstateAgent JSON-LD for DR Housing.
 */
export function buildOrganizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'DR Housing',
    url: 'https://drhousing.net',
    logo: 'https://drhousing.net/logo.png',
    telephone: '+50686540888',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Escazú',
      addressRegion: 'San José',
      addressCountry: 'CR',
    },
    areaServed: ['Escazú', 'Santa Ana', 'La Guácima', 'Lindora'],
    description:
      "Luxury real estate agency specializing in Costa Rica's Western Corridor",
  }
}

// ─── buildItemListSchema ─────────────────────────────────────────────────────

/**
 * Builds a Schema.org ItemList JSON-LD for a property listing page.
 * Only includes public properties. Capped at 10 items.
 */
export function buildItemListSchema(
  properties: PropertyForList[],
  lang: string,
  pageType: 'rentals' | 'for-sale' | 'all'
): Record<string, unknown> {
  const publicProps = properties.filter(p => isPropertyPublic(p))

  const name =
    pageType === 'rentals'
      ? 'Luxury Rentals in Costa Rica'
      : pageType === 'for-sale'
      ? 'Luxury Properties for Sale in Costa Rica'
      : 'Luxury Properties in Costa Rica'

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    url: `https://drhousing.net/${lang}/properties`,
    numberOfItems: publicProps.length,
    itemListElement: publicProps.slice(0, 10).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://drhousing.net/${lang}/property/${p.slug ?? p.reference_id}`,
      name: p.title_en ?? p.title ?? '',
    })),
  }
}
