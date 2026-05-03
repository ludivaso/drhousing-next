import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ZONE_CONFIG, ZONE_SLUGS } from '@/config/zones'
import ZoneLandingPage from '@/components/zones/ZoneLandingPage'
import type { PropertyRow } from '@/lib/supabase/queries'
import { buildItemListSchema } from '@/lib/seo/helpers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export function generateStaticParams() {
  return ZONE_SLUGS.map(zone => ({ zone }))
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string; zone: string }
}): Promise<Metadata> {
  const zone = ZONE_CONFIG[params.zone]
  if (!zone) return {}

  const lang = params.lang === 'es' ? 'es' : 'en'
  const title = `Properties for Rent in ${zone.nameEn}`
  const description = zone.descriptionEn.slice(0, 160)
  const canonical = `https://drhousing.net/${lang}/rentals/${zone.slug}`
  const altEs     = `https://drhousing.net/es/alquiler/${zone.slug}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      locale: lang === 'en' ? 'en_US' : 'es_CR',
      siteName: 'DR Housing',
    },
    alternates: {
      canonical,
      languages: {
        en: canonical,
        es: altEs,
        'x-default': canonical,
      },
    },
    robots: { index: true, follow: true },
  }
}

export default async function RentalsZonePage({
  params,
}: {
  params: { lang: string; zone: string }
}) {
  const lang = params.lang === 'es' ? 'es' : 'en'

  // Redirect Spanish visitors to the /alquiler/ route
  if (lang === 'es') {
    redirect(`/es/alquiler/${params.zone}`)
  }

  const zone = ZONE_CONFIG[params.zone]
  if (!zone) notFound()

  const supabase = createSupabaseServerClient()
  const { data } = await supabase
    .from('properties')
    .select('*')
    .eq('hidden', false)
    .or('visibility.eq.public,visibility.is.null')
    .or(`zone.ilike.%${zone.dbZone}%,zone.ilike.%${zone.nameEs}%,location_name.ilike.%${zone.dbZone}%,location_name.ilike.%${zone.nameEs}%`)
    .or('status.eq.for_rent,price_rent_monthly.gt.0')
    .order('featured_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  const properties = (data ?? []) as PropertyRow[]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildItemListSchema(properties, lang, 'rentals')) }}
      />
      <ZoneLandingPage zone={zone} properties={properties} mode="rent" lang="en" />
    </>
  )
}
