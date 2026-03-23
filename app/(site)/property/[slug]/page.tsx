import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getPropertyBySlug,
  getPublicSlugs,
  getHeroImage,
} from '@/lib/supabase/queries'
import PropertyDetailClient from '@/components/PropertyDetailClient'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://drhousing.net'

export const revalidate = 1800

export async function generateStaticParams() {
  const slugs = await getPublicSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const property = await getPropertyBySlug(params.slug)
  if (!property) return {}

  const title       = property.meta_title || property.title
  const description = property.meta_description || property.description?.slice(0, 160) || ''
  const heroImage   = getHeroImage(property)
  const ogImage     = heroImage
    ? heroImage.startsWith('http') ? heroImage : `${SITE_URL}${heroImage}`
    : `${SITE_URL}/og-default.jpg`

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/property/${property.slug}` },
    openGraph: {
      title: property.meta_title || property.title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: 'article',
      url: `${SITE_URL}/property/${property.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: property.meta_title || property.title,
      description,
      images: [ogImage],
    },
  }
}

export default async function PropertyDetailPage({ params }: { params: { slug: string } }) {
  const property = await getPropertyBySlug(params.slug)
  if (!property) notFound()

  return <PropertyDetailClient property={property} />
}
