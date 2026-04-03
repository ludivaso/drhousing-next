import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getPropertyBySlug,
  getPublicSlugs,
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

  const ogImageUrl = new URL('/api/og/property', 'https://drhousing-next.vercel.app')
  ogImageUrl.searchParams.set('title', property.title ?? '')
  ogImageUrl.searchParams.set(
    'price',
    property.price_sale
      ? `$${property.price_sale.toLocaleString()}`
      : property.price_rent_monthly
      ? `$${property.price_rent_monthly.toLocaleString()}/mes`
      : ''
  )
  ogImageUrl.searchParams.set('subtitle', property.subtitle ?? '')
  ogImageUrl.searchParams.set('status', property.status ?? 'for_sale')
  ogImageUrl.searchParams.set('image', property.images?.[0] ?? '')
  ogImageUrl.searchParams.set('beds', String(property.bedrooms ?? ''))
  ogImageUrl.searchParams.set('baths', String(property.bathrooms ?? ''))
  ogImageUrl.searchParams.set('sqm', String(property.construction_size_sqm ?? ''))

  return {
    title: `${property.title_en || property.title} | DR Housing`,
    description: (property.description_en || property.description)?.slice(0, 160),
    openGraph: {
      title: property.title_en || property.title,
      description: (property.description_en || property.description)?.slice(0, 160) ?? '',
      images: [{ url: ogImageUrl.toString(), width: 1200, height: 630, alt: property.title ?? '' }],
      type: 'website',
      locale: 'es_CR',
    },
    twitter: {
      card: 'summary_large_image',
      title: property.title_en || property.title,
      images: [ogImageUrl.toString()],
    },
    alternates: {
      canonical: `https://drhousing.net/property/${property.slug}`,
      languages: {
        'es': `https://drhousing.net/property/${property.slug}`,
        'en': `https://drhousing.net/property/${property.slug}`,
        'x-default': `https://drhousing.net/property/${property.slug}`,
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
