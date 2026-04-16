import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import {
  getHeroImage,
  getPropertyFeatures,
} from '@/lib/supabase/queries'
import { supabase } from '@/lib/supabase/client'
import type { PropertyRow, AgentRow, FeatureRow } from '@/lib/supabase/queries'
import PropertyDetailClient from '@/components/PropertyDetailClient'

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

  const url = `https://drhousing.net/property/${property.slug}`

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
      images: heroImage
        ? [{ url: heroImage, width: 1200, height: 630, alt: title }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: heroImage ? [heroImage] : [],
    },
    alternates: {
      canonical: url,
      languages: {
        'es': url,
        'en': url,
        'x-default': url,
      },
    },
  }
}

export default async function PropertyDetailPage({ params }: { params: { lang: string; slug: string } }) {
  const lang = params.lang === 'es' ? 'es' : 'en'

  const property = await findProperty(params.slug)
  if (!property) notFound()

  // Redirect to canonical slug when navigated via reference_id or a stale slug
  if (property.slug && property.slug !== params.slug) {
    redirect(`/${params.lang}/property/${property.slug}`)
  }

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
    name: property.title,
    description: (property.description || '').slice(0, 300),
    url: `https://drhousing.net/property/${property.slug}`,
    image: property.images ?? [],
    datePosted: property.created_at,
    offers: {
      '@type': 'Offer',
      price: property.price_sale ?? property.price_rent_monthly,
      priceCurrency: property.currency ?? 'USD',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.location_name,
      addressCountry: 'CR',
    },
    floorSize: {
      '@type': 'QuantitativeValue',
      value: property.construction_size_sqm,
      unitCode: 'MTK',
    },
    numberOfRooms: property.bedrooms,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+50686540888',
      contactType: 'sales',
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
