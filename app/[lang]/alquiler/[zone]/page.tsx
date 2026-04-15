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
  const title = `Alquiler de Propiedades en ${zone.nameEs} | DR Housing`
  const description = zone.descriptionEs.slice(0, 160)
  const canonical = `https://drhousing.net/${lang}/alquiler/${zone.slug}`
  const altEn     = `https://drhousing.net/en/rentals/${zone.slug}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      locale: lang === 'es' ? 'es_CR' : 'en_US',
      siteName: 'DR Housing',
    },
    alternates: {
      canonical,
      languages: {
        es: canonical,
        en: altEn,
        'x-default': altEn,
      },
    },
  }
}

export default async function AlquilerZonePage({
  params,
}: {
  params: { lang: string; zone: string }
}) {
  const lang = params.lang === 'es' ? 'es' : 'en'

  // Redirect English visitors to the /rentals/ route
  if (lang === 'en') {
    redirect(`/en/rentals/${params.zone}`)
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
    .or('status.eq.for_rent,status.eq.both')
    .order('featured_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  const rows = (data ?? []) as PropertyRow[]
  const properties = rows.filter(
    p => p.status === 'for_rent' || p.status === 'both' || (p.price_rent_monthly ?? 0) > 0
  )

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: `Alquiler de Propiedades en ${zone.nameEs}`,
    description: zone.descriptionEs.slice(0, 300),
    url: `https://drhousing.net/es/alquiler/${zone.slug}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: zone.nameEs,
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
      <ZoneLandingPage zone={zone} properties={properties} mode="rent" lang="es" />
    </>
  )
}
