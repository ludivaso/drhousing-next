import type { Metadata } from 'next'
import { getFeaturedProperties } from '@/lib/supabase/queries'
import { getSiteSettings } from '@/lib/supabase/settings'
import HomeClient from '@/components/HomeClient'

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
  }
}

export default async function HomePage({ params }: { params: { lang: string } }) {
  const lang = params.lang === 'es' ? 'es' : 'en'

  const [featuredProperties, settings] = await Promise.all([
    getFeaturedProperties(),
    getSiteSettings(),
  ])

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness', 'RealEstateAgent'],
    '@id': 'https://drhousing.net',
    name: 'DR Housing',
    legalName: 'DR Housing Costa Rica',
    url: 'https://drhousing.net',
    logo: 'https://drhousing.net/logo.png',
    image: 'https://drhousing.net/og-fallback.jpg',
    description: 'DR Housing is a luxury real estate advisory firm specializing in residential properties in Escazú, Santa Ana, and the Western Corridor of Costa Rica. We serve international buyers, investors, and relocating families.',
    telephone: '+50686540888',
    email: 'info@drhousing.net',
    foundingDate: '2020',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Escazú',
      addressLocality: 'Escazú',
      addressRegion: 'San José',
      addressCountry: 'CR',
      postalCode: '10201',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 9.9281,
      longitude: -84.1413,
    },
    areaServed: [
      { '@type': 'City', name: 'Escazú' },
      { '@type': 'City', name: 'Santa Ana' },
      { '@type': 'Place', name: 'La Guácima' },
      { '@type': 'Place', name: 'Lindora' },
      { '@type': 'Place', name: 'Ciudad Colón' },
    ],
    knowsAbout: [
      'Luxury Real Estate Costa Rica',
      'Property Investment Costa Rica',
      'Relocation Services Costa Rica',
      'Escazú Real Estate',
      'Santa Ana Real Estate',
    ],
    sameAs: [
      'https://www.instagram.com/drhousing.cr',
      'https://www.facebook.com/drhousing.cr',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+50686540888',
      contactType: 'customer service',
      availableLanguage: ['English', 'Spanish'],
      contactOption: 'TollFree',
    },
    founder: [
      {
        '@type': 'Person',
        name: 'Diego Vargas',
        jobTitle: 'Founder, CEO & Broker of Record',
      },
      {
        '@type': 'Person',
        name: 'Paola Morales',
        jobTitle: 'Co-Founder & Managing Director',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
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
