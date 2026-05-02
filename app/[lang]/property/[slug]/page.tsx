import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getHeroImage,
  getPropertyFeatures,
} from '@/lib/supabase/queries'
import { supabase } from '@/lib/supabase/client'
import type { PropertyRow, AgentRow, FeatureRow } from '@/lib/supabase/queries'
import PropertyDetailClient from '@/components/PropertyDetailClient'

// Public origin used to build absolute URLs for crawlers (OG / Twitter cards).
// Must be the exact host Meta/WhatsApp/LinkedIn will fetch — they don't follow
// www↔apex redirects when scraping previews.
const SITE_ORIGIN = 'https://www.drhousing.net'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const dynamicParams = true

export async function generateStaticParams() {
  return [] // All paths rendered on demand — no pre-building
}

// Lookup by slug first; fall back to reference_id so stable ref-links never 404
async function findProperty(slug: string): Promise<PropertyRow | null> {
  const { data: bySlug } = await supabase
    .from('properties')
    .select('*')
    .eq('slug', slug)
    .eq('hidden', false)
    .neq('visibility', 'hidden')
    .maybeSingle()
  if (bySlug) return bySlug

  const { data: byRef } = await supabase
    .from('properties')
    .select('*')
    .ilike('reference_id', slug)
    .eq('hidden', false)
    .neq('visibility', 'hidden')
    .maybeSingle()
  return byRef ?? null
}

export async function generateMetadata({ params }: { params: { lang: string; slug: string } }): Promise<Metadata> {
  const lang = params.lang === 'es' ? 'es' : 'en'

  const property = await findProperty(params.slug)
  if (!property) return {}

  // Best available image: featured_images first, then gallery
  const heroImage = getHeroImage(property)

  // Route the raw Supabase image through Next's image optimizer so the OG
  // payload is ~1200px wide JPEG/WebP instead of a 2560×1440 raw asset.
  // WhatsApp / Facebook / LinkedIn previews require:
  //   • absolute URL on the same origin as the page
  //   • <8 MB, ~1200×630 dimensions
  // The optimizer fetches the underlying Supabase URL (whitelisted in
  // next.config.mjs) and returns a resized image inline. We declare 1200×630
  // as a hint only — the optimizer preserves aspect ratio.
  const ogImageUrl = heroImage
    ? `${SITE_ORIGIN}/_next/image?url=${encodeURIComponent(heroImage)}&w=1200&q=85`
    : null

  // Price string
  const monthSuffix = lang === 'en' ? '/month' : '/mes'
  const price = property.price_sale
    ? `$${property.price_sale.toLocaleString()}`
    : property.price_rent_monthly
    ? `$${property.price_rent_monthly.toLocaleString()}${monthSuffix}`
    : ''

  // Specs string
  const bedsWord  = lang === 'en' ? 'beds'   : 'hab'
  const bathsWord = lang === 'en' ? 'baths'  : 'baños'
  const specs = [
    property.bedrooms             ? `${property.bedrooms} ${bedsWord}`    : null,
    property.bathrooms            ? `${property.bathrooms} ${bathsWord}`   : null,
    property.construction_size_sqm ? `${property.construction_size_sqm}m²` : null,
  ].filter(Boolean).join(' · ')

  const title = lang === 'en'
    ? (property.title_en || property.title_es || property.title || 'Property in Costa Rica')
    : (property.title_es || property.ai_generated_title_es || property.title_en || property.title || 'Propiedad en Costa Rica')

  // Description: price — specs — first 120 chars of copy
  const rawDesc = (
    lang === 'en'
      ? (property.description_en || property.description_es || property.description || '')
      : (property.description_es || property.ai_generated_description_es || property.description_en || property.description || '')
  ).slice(0, 120)
  const description = [price, specs, rawDesc].filter(Boolean).join(' — ')

  const url = `https://drhousing.net/${lang}/property/${property.reference_id}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      locale: 'es_CR',
      siteName: 'DR Housing',
      images: ogImageUrl
        ? [{ url: ogImageUrl, width: 1200, height: 630, alt: title }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
    alternates: {
      canonical: url,
      languages: {
        'en': `https://drhousing.net/en/property/${property.reference_id}`,
        'es': `https://drhousing.net/es/property/${property.reference_id}`,
        'x-default': `https://drhousing.net/en/property/${property.reference_id}`,
      },
    },
  }
}

export default async function PropertyDetailPage({ params }: { params: { lang: string; slug: string } }) {
  const lang = params.lang === 'es' ? 'es' : 'en'

  const property = await findProperty(params.slug)
  if (!property) notFound()

  // No redirect — reference_id IS the canonical URL; slug is mutable and must not be exposed

  const propertyFeatures = await getPropertyFeatures(property.id)

  // Fetch listing agent if set
  let listingAgent: AgentRow | null = null
  if (property.listing_agent_id) {
    const { data: agentData } = await supabase
      .from('agents')
      .select('*')
      .eq('id', property.listing_agent_id)
      .maybeSingle()
    listingAgent = agentData
  }

  // ── Related properties — tiered relevance ─────────────────────────────────
  // The old query (OR on location_name OR tier) was too loose: a single tier
  // match could drag in completely unrelated listings from other cities.
  //
  // Tier 1 (strongest): same zone + same property_type + same transaction
  //                     kind (sale/rent).
  // Tier 2: same zone (any type), same transaction kind.
  // Tier 3: same property_type + similar price band (±40%) — only if we
  //         still don't have enough to populate the carousel.
  //
  // We target up to 8 cards so the carousel has enough swipeable content.
  const TARGET = 8

  // Transaction-kind filter: if this property has a sale price, match
  // sale-able listings; if it has a rent price, match rent-able ones.
  const txStatuses: string[] = []
  if (property.price_sale)         txStatuses.push('for_sale', 'both', 'presale')
  if (property.price_rent_monthly) txStatuses.push('for_rent', 'both')
  const txFilter = txStatuses.length > 0
    ? txStatuses
    : ['for_sale', 'for_rent', 'both', 'presale']

  const related: PropertyRow[] = []
  const seenIds = new Set<string>([property.id])
  const push = (rows: PropertyRow[] | null | undefined) => {
    for (const r of rows ?? []) {
      if (!seenIds.has(r.id)) {
        related.push(r)
        seenIds.add(r.id)
      }
      if (related.length >= TARGET) break
    }
  }

  // Tier 1 — same zone + same type + same transaction kind
  if (property.location_name && property.property_type) {
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('hidden', false)
      .or('visibility.eq.public,visibility.is.null')
      .neq('id', property.id)
      .eq('location_name', property.location_name)
      .eq('property_type', property.property_type)
      .in('status', txFilter)
      .limit(TARGET)
    push(data)
  }

  // Tier 2 — same zone (any type), same transaction kind
  if (related.length < TARGET && property.location_name) {
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('hidden', false)
      .or('visibility.eq.public,visibility.is.null')
      .neq('id', property.id)
      .eq('location_name', property.location_name)
      .in('status', txFilter)
      .limit(TARGET)
    push(data)
  }

  // Tier 3 — same property_type + similar price band
  if (related.length < TARGET && property.property_type) {
    const refPrice = property.price_sale ?? property.price_rent_monthly
    let q = supabase
      .from('properties')
      .select('*')
      .eq('hidden', false)
      .or('visibility.eq.public,visibility.is.null')
      .neq('id', property.id)
      .eq('property_type', property.property_type)
      .in('status', txFilter)
      .limit(TARGET)
    if (refPrice && property.price_sale) {
      q = q.gte('price_sale', Math.round(refPrice * 0.6))
           .lte('price_sale', Math.round(refPrice * 1.4))
    } else if (refPrice && property.price_rent_monthly) {
      q = q.gte('price_rent_monthly', Math.round(refPrice * 0.6))
           .lte('price_rent_monthly', Math.round(refPrice * 1.4))
    }
    const { data } = await q
    push(data)
  }

  const relatedProperties: PropertyRow[] = related

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: lang === 'es'
      ? (property.title_es || property.ai_generated_title_es || property.title)
      : (property.title_en || property.title),
    description: (lang === 'es'
      ? (property.description_es || property.ai_generated_description_es || property.description_en || property.description)
      : (property.description_en || property.description)
    )?.slice(0, 500),
    url: `https://drhousing.net/${lang}/property/${property.reference_id}`,
    image: (property.featured_images?.length ? property.featured_images : property.images)?.slice(0, 5) ?? [],
    datePosted: property.created_at,
    dateModified: property.updated_at,
    offers: {
      '@type': 'Offer',
      priceCurrency: property.currency ?? 'USD',
      ...(property.price_sale ? { price: property.price_sale } : {}),
      availability: 'https://schema.org/InStock',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.location_name || 'Escazú',
      addressCountry: 'CR',
      addressRegion: 'San José',
    },
    ...(property.bedrooms ? { numberOfRooms: property.bedrooms } : {}),
    ...(property.bathrooms ? { numberOfBathroomsTotal: property.bathrooms } : {}),
    ...(property.construction_size_sqm ? { floorSize: {
      '@type': 'QuantitativeValue',
      value: property.construction_size_sqm,
      unitCode: 'MTK',
    }} : {}),
    provider: {
      '@type': 'RealEstateAgent',
      name: 'DR Housing',
      url: 'https://drhousing.net',
      telephone: '+50686540888',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Escazú',
        addressCountry: 'CR',
      },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PropertyDetailClient
        property={property}
        relatedProperties={relatedProperties}
        agent={listingAgent}
        propertyFeatures={propertyFeatures}
        lang={lang}
        titleEn={property.title_en || property.title || ''}
        titleEs={property.title_es || property.ai_generated_title_es || property.title_en || property.title || ''}
        subtitleEn={property.subtitle_en || property.subtitle || ''}
        subtitleEs={property.subtitle || property.subtitle_en || ''}
        descriptionEn={property.description_en || property.description || ''}
        descriptionEs={property.description_es || property.ai_generated_description_es || property.description_en || property.description || ''}
        featuresEn={property.features_en ?? property.features ?? []}
        featuresEs={property.features_es ?? property.features ?? []}
        priceSale={property.price_sale ?? null}
        priceRent={property.price_rent_monthly ?? null}
        currency={property.currency || 'USD'}
      />
    </>
  )
}
