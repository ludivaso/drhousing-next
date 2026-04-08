import type { Metadata } from 'next'
import { getFeaturedProperties } from '@/lib/supabase/queries'
import { getSiteSettings } from '@/lib/supabase/settings'
import HomeClient from '@/components/HomeClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { absolute: 'DR Housing | Luxury Real Estate Escazú · Santa Ana · Costa Rica' },
  description:
    'Premium luxury homes and investment properties in Escazú, Santa Ana and the Ruta 27 corridor. Expert advisory for international buyers.',
  alternates: {
    canonical: 'https://drhousing.net',
  },
}

export default async function HomePage({ params }: { params: { lang: string } }) {
  const lang = params.lang === 'es' ? 'es' : 'en'

  const [featuredProperties, settings] = await Promise.all([
    getFeaturedProperties(),
    getSiteSettings(),
  ])

  return (
    <HomeClient
      featuredProperties={featuredProperties}
      lang={lang}
      heroVideoUrl={settings.heroVideoUrl}
      heroHeight={settings.heroHeight}
      heroOverlay={settings.heroOverlay}
      heroBrightness={settings.heroBrightness}
      panelOverlay={settings.panelOverlay}
      serviceCards={settings.serviceCards}
    />
  )
}
