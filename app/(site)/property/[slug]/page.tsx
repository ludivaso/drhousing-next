import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getPropertyBySlug,
  getPublicSlugs,
  getHeroImage,
} from '@/lib/supabase/queries'
import { supabase } from '@/lib/supabase/client'
import type { PropertyRow } from '@/lib/supabase/queries'
import PropertyDetailClient from '@/components/PropertyDetailClient'

export const revalidate = 1800
export const dynamicParams = true

export async function generateStaticParams() {
  const slugs = await getPublicSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const property = await getPropertyBySlug(params.slug)
  if (!property) return {}

  // Best available image: featured_images first, then gallery
  const heroImage = getHeroImage(property)

  // Price string
  const price = property.price_sale
    ? `$${property.price_sale.toLocaleString()}`
    : property.price_rent_monthly
    ? `$${property.price_rent_monthly.toLocaleString()}/mes`
    : ''

  // Specs string
  const specs = [
    property.bedrooms            ? `${property.bedrooms} hab`              : null,
    property.bathrooms           ? `${property.bathrooms} baños`           : null,
    property.construction_size_sqm ? `${property.construction_size_sqm}m²` : null,
  ].filter(Boolean).join(' · ')

  const title = property.title_en || property.title || 'Propiedad en Costa Rica'

  // Description: price — specs — first 120 chars of copy
  const rawDesc = (property.description_en || property.description || '').slice(0, 120)
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

export default async function PropertyDetailPage({ params }: { params: { slug: string } }) {
  const property = await getPropertyBySlug(params.slug)
  if (!property) notFound()

  // Fetch related properties
  const { data: relatedData } = await supabase
    .from('properties')
    .select('*')
    .eq('hidden', false)
    .eq('visibility', 'public')
    .neq('id', property.id)
    .or(`location_name.eq.${property.location_name},tier.eq.${property.tier}`)
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
      <PropertyDetailClient property={property} relatedProperties={relatedProperties} />
    </>
  )
}
