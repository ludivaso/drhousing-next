import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import DesarrolloDetailClient from './DesarrolloDetailClient'
import { developments, DEVS_BY_SLUG, type Development } from '../data'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function rowToDev(r: Record<string, any>): Development {
  const mapStatus = (s: string) => {
    if (s === 'pre_sale') return 'pre-sale' as const
    if (s === 'in_construction') return 'under-construction' as const
    if (s === 'delivered') return 'ready' as const
    if (s === 'sold_out') return 'sold-out' as const
    return 'pre-sale' as const
  }
  return {
    id: r.id,
    slug: r.slug,
    nameEn: r.name_en,
    nameEs: r.name_es ?? r.name_en,
    subtitleEn: r.subtitle_en ?? '',
    subtitleEs: r.subtitle_es ?? r.subtitle_en ?? '',
    descriptionEn: r.description_en ?? '',
    descriptionEs: r.description_es ?? r.description_en ?? '',
    status: mapStatus(r.status),
    deliveryDate: r.delivery_date ?? null,
    locationName: r.location ?? '',
    zone: r.zone ?? '',
    priceFromUsd: r.price_from ?? 0,
    priceToUsd: r.price_to ?? null,
    unitCount: r.unit_count ?? 0,
    unitTypes: r.unit_types ?? [],
    amenities: (r.amenities ?? []).map((a: string) => ({ en: a, es: a, icon: 'Star' })),
    heroImage: r.hero_image ?? '',
    gallery: r.gallery ?? [],
    developerName: r.developer_name ?? '',
    brochureUrl: r.brochure_url ?? undefined,
    videoUrl: r.video_url ?? undefined,
    coordinates: r.coordinates ?? undefined,
    featuredOnHomepage: r.featured,
    displayOrder: r.display_order ?? 999,
  }
}

async function getDev(slug: string): Promise<Development | null> {
  try {
    const supabase = createSupabaseServerClient()
    const { data } = await (supabase as any)
      .from('developments')
      .select('*')
      .eq('slug', slug)
      .single()
    if (data) return rowToDev(data)
  } catch {}
  return DEVS_BY_SLUG[slug] ?? null
}

export async function generateMetadata({ params }: { params: { slug: string; lang: string } }): Promise<Metadata> {
  const dev = await getDev(params.slug)
  if (!dev) return {}
  const lang = params.lang === 'es' ? 'es' : 'en'
  const title = lang === 'es' ? dev.nameEs : dev.nameEn
  const description = lang === 'es' ? dev.subtitleEs : dev.subtitleEn
  return {
    title: `${title} | DR Housing`,
    description,
    alternates: {
      canonical: `https://drhousing.net/${lang}/desarrollos/${dev.slug}`,
      languages: {
        es: `https://drhousing.net/es/desarrollos/${dev.slug}`,
        en: `https://drhousing.net/en/desarrollos/${dev.slug}`,
      },
    },
    openGraph: { title, description, type: 'website', locale: lang === 'es' ? 'es_CR' : 'en_US', siteName: 'DR Housing', images: dev.heroImage ? [{ url: dev.heroImage, alt: title }] : [] },
    twitter: { card: 'summary_large_image', title, description, images: dev.heroImage ? [dev.heroImage] : [] },
  }
}

export default async function DesarrolloDetailPage({ params }: { params: { slug: string; lang: string } }) {
  const dev = await getDev(params.slug)
  if (!dev) notFound()
  const lang = params.lang === 'es' ? 'es' : 'en'
  return <DesarrolloDetailClient development={dev} lang={lang} />
}
