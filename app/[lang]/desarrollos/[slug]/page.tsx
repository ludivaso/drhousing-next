import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import DesarrolloDetailClient from './DesarrolloDetailClient'
import { developments, DEVS_BY_SLUG } from '../data'

// Pre-generate routes for all known slugs at build time; 404 for the rest.
export function generateStaticParams() {
  return developments.map((d) => ({ slug: d.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string; lang: string }
}): Promise<Metadata> {
  const dev = DEVS_BY_SLUG[params.slug]
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
    openGraph: {
      title,
      description,
      type: 'website',
      locale: lang === 'es' ? 'es_CR' : 'en_US',
      siteName: 'DR Housing',
      images: [{ url: dev.heroImage, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [dev.heroImage],
    },
  }
}

export default function DesarrolloDetailPage({
  params,
}: {
  params: { slug: string; lang: string }
}) {
  const dev = DEVS_BY_SLUG[params.slug]
  if (!dev) notFound()
  const lang = params.lang === 'es' ? 'es' : 'en'
  return <DesarrolloDetailClient development={dev} lang={lang} />
}
