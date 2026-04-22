import type { Metadata } from ‘next’
import { Suspense } from ‘react’
import { createSupabaseServerClient } from ‘@/lib/supabase/server’
import DesarrollosIndexClient from ‘./DesarrollosIndexClient’
import { developments as staticDevs } from ‘./data’
import type { Development } from ‘./data’

export const dynamic = ‘force-dynamic’

// Map a Supabase row to the Development type the client components expect.
function rowToDev(r: Record<string, any>): Development {
  const mapStatus = (s: string) => {
    if (s === ‘pre_sale’) return ‘pre-sale’ as const
    if (s === ‘in_construction’) return ‘under-construction’ as const
    if (s === ‘delivered’) return ‘ready’ as const
    if (s === ‘sold_out’) return ‘sold-out’ as const
    return ‘pre-sale’ as const
  }
  return {
    id: r.id,
    slug: r.slug,
    nameEn: r.name_en,
    nameEs: r.name_es ?? r.name_en,
    subtitleEn: r.subtitle_en ?? ‘’,
    subtitleEs: r.subtitle_es ?? r.subtitle_en ?? ‘’,
    descriptionEn: r.description_en ?? ‘’,
    descriptionEs: r.description_es ?? r.description_en ?? ‘’,
    status: mapStatus(r.status),
    deliveryDate: r.delivery_date ?? null,
    locationName: r.location ?? ‘’,
    zone: r.zone ?? ‘’,
    priceFromUsd: r.price_from ?? 0,
    priceToUsd: r.price_to ?? null,
    unitCount: r.unit_count ?? 0,
    unitTypes: r.unit_types ?? [],
    amenities: (r.amenities ?? []).map((a: string) => ({ en: a, es: a, icon: ‘Star’ })),
    heroImage: r.hero_image ?? ‘’,
    gallery: r.gallery ?? [],
    developerName: r.developer_name ?? ‘’,
    brochureUrl: r.brochure_url ?? undefined,
    videoUrl: r.video_url ?? undefined,
    coordinates: r.coordinates ?? undefined,
    featuredOnHomepage: r.featured,
    displayOrder: r.display_order ?? 999,
  }
}

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const lang = params.lang === ‘es’ ? ‘es’ : ‘en’
  const title = lang === ‘es’ ? ‘Desarrollos | DR Housing’ : ‘New Developments | DR Housing’
  const description = lang === ‘es’
    ? ‘Construcción nueva y preventas seleccionadas en el Valle Central de Costa Rica.’
    : "Curated new construction and pre-sales across Costa Rica’s Central Valley."
  return {
    title,
    description,
    alternates: {
      canonical: `https://drhousing.net/${lang}/desarrollos`,
      languages: {
        es: ‘https://drhousing.net/es/desarrollos’,
        en: ‘https://drhousing.net/en/desarrollos’,
      },
    },
    openGraph: { title, description, type: ‘website’, locale: lang === ‘es’ ? ‘es_CR’ : ‘en_US’, siteName: ‘DR Housing’ },
  }
}

export default async function DesarrollosPage({ params }: { params: { lang: string } }) {
  const lang = params.lang === ‘es’ ? ‘es’ : ‘en’

  const supabase = createSupabaseServerClient()
  const { data } = await (supabase as any)
    .from(‘developments’)
    .select(‘*’)
    .eq(‘published’, true)
    .order(‘display_order’, { ascending: true, nullsFirst: false })
    .order(‘created_at’, { ascending: false })

  const developments: Development[] = data && data.length > 0
    ? (data as Record<string, any>[]).map(rowToDev)
    : staticDevs

  return (
    <Suspense fallback={<div className="min-h-[70vh] bg-[#F5F2EE]" />}>
      <DesarrollosIndexClient lang={lang} developments={developments} />
    </Suspense>
  )
}
