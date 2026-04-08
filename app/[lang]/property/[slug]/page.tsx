import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getPropertyBySlug,
  getPublicSlugs,
  getHeroImage,
  getPropertyFeatures,
} from '@/lib/supabase/queries'
import { supabase } from '@/lib/supabase/client'
import type { PropertyRow, AgentRow, FeatureRow } from '@/lib/supabase/queries'
import PropertyDetailClient from '@/components/PropertyDetailClient'

export const dynamic = 'force-dynamic'
export const dynamicParams = true

export async function generateStaticParams() {
  const slugs = await getPublicSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: { lang: string; slug: string } }): Promise<Metadata> {
  const lang = params.lang === 'es' ? 'es' : 'en'

  const property = await getPropertyBySlug(params.slug)
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
    : (property.title || 'Propiedad en Costa Rica')

  // Description: price — specs — first 120 chars of copy
  const rawDesc = (
    lang === 'en'
      ? (property.description_en || property.description_es || property.description || '')
      : (property.description || '')
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

  const property = await getPropertyBySlug(params.slug)
  if (!property) notFound()

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

  // Fetch related properties
  const { data: relatedData } = await supabase
    .from('properties')
    .select('*')
    .eq('hidden', false)
    .eq('visibility', 'public')
    .neq('id', property.id)
    .or(`location_name.eq."${property.location_name}",tier.eq."${property.tier}"`)
    .limit(4)

  const relatedProperties: PropertyRow[] = relatedData ?? []

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
        titleEn={property.title_en || property.title || ''}
        titleEs={property.title_es || property.title || ''}
        subtitleEn={property.subtitle_en || property.subtitle || ''}
        subtitleEs={property.subtitle || property.subtitle_en || ''}
        descriptionEn={property.description_en || property.description || ''}
        descriptionEs={property.description_es || property.description || ''}
        priceSale={property.price_sale ?? null}
        priceRent={property.price_rent_monthly ?? null}
        currency={property.currency || 'USD'}
      />
    </>
  )
}
