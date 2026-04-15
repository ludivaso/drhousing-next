import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ZONE_CONFIG, ZONE_SLUGS } from '@/config/zones'
import ZoneLandingPage from '@/components/zones/ZoneLandingPage'
import type { PropertyRow } from '@/lib/supabase/queries'

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
  const title = `Properties for Sale in ${zone.nameEn} | DR Housing`
  const description = zone.descriptionEn.slice(0, 160)
  const canonical = `https://drhousing.net/${lang}/for-sale/${zone.slug}`
  const altEs     = `https://drhousing.net/es/venta/${zone.slug}`

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
  }
}

export default async function ForSaleZonePage({
  params,
}: {
  params: { lang: string; zone: string }
}) {
  const lang = params.lang === 'es' ? 'es' : 'en'

  // Redirect Spanish visitors to the /venta/ route
  if (lang === 'es') {
    redirect(`/es/venta/${params.zone}`)
  }

  const zone = ZONE_CONFIG[params.zone]
  if (!zone) notFound()

  const supabase = createSupabaseServerClient()
  const { data } = await supabase
    .from('properties')
    .select('*')
    .eq('hidden', false)
    .or('visibility.eq.public,visibility.is.null')
    .ilike('zone', `%${zone.dbZone}%`)
    .or('status.eq.for_sale,status.eq.presale,status.eq.both,status.eq.under_contract')
    .order('featured_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  const rows = (data ?? []) as PropertyRow[]
  const properties = rows.filter(
    p =>
      p.status === 'for_sale' ||
      p.status === 'presale' ||
      p.status === 'both' ||
      p.status === 'under_contract' ||
      (p.price_sale ?? 0) > 0
  )

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: `Properties for Sale in ${zone.nameEn}`,
    description: zone.descriptionEn.slice(0, 300),
    url: `https://drhousing.net/en/for-sale/${zone.slug}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: zone.nameEn,
      addressCountry: 'CR',
    },
    numberOfItems: properties.length,
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
      <ZoneLandingPage zone={zone} properties={properties} mode="sale" lang="en" />
    </>
  )
}
