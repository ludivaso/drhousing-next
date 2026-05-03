import type { Metadata } from 'next'
import { getFeaturedProperties } from '@/lib/supabase/queries'
import { getSiteSettings } from '@/lib/supabase/settings'
import HomeClient from '@/components/HomeClient'
import { buildOrganizationSchema } from '@/lib/seo/helpers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const isEs = params.lang === 'es'
  return {
    title: isEs
      ? { absolute: 'DR Housing | Propiedades de Lujo en Escazú y Santa Ana, Costa Rica' }
      : { absolute: 'DR Housing | Luxury Real Estate in Escazú & Santa Ana, Costa Rica' },
    description: isEs
      ? 'Propiedades de lujo en Escazú, Santa Ana y el Corredor Oeste de Costa Rica. Asesoría experta para compradores internacionales, inversores y familias en reubicación.'
      : 'Luxury properties in Escazú, Santa Ana and the Western Corridor of Costa Rica. Expert advisory for international buyers, investors, and relocating families.',
    alternates: {
      canonical: `https://drhousing.net/${params.lang}`,
      languages: {
        'en': 'https://drhousing.net/en',
        'es': 'https://drhousing.net/es',
        'x-default': 'https://drhousing.net/en',
      },
    },
    openGraph: {
      title: isEs ? 'DR Housing | Propiedades de Lujo en Costa Rica' : 'DR Housing | Luxury Real Estate in Costa Rica',
      description: isEs
        ? 'Asesoría inmobiliaria de lujo en Escazú, Santa Ana y el Corredor Oeste.'
        : 'Luxury real estate advisory in Escazú, Santa Ana and the Western Corridor.',
      url: `https://drhousing.net/${params.lang}`,
      siteName: 'DR Housing',
      images: [{ url: 'https://drhousing.net/og-fallback.jpg', width: 1200, height: 630 }],
      locale: isEs ? 'es_CR' : 'en_US',
      type: 'website',
    },
    robots: { index: true, follow: true },
  }
}

export default async function HomePage({ params }: { params: { lang: string } }) {
  const lang = params.lang === 'es' ? 'es' : 'en'

  const [featuredProperties, settings] = await Promise.all([
    getFeaturedProperties(),
    getSiteSettings(),
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationSchema()) }}
      />
      <HomeClient
        featuredProperties={featuredProperties}
        lang={lang}
        heroHeight={settings.heroHeight}
        heroOverlay={settings.heroOverlay}
        heroBrightness={settings.heroBrightness}
        panelOverlay={settings.panelOverlay}
        serviceCards={settings.serviceCards}
      />
    </>
  )
}
