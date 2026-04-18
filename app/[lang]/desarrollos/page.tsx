import type { Metadata } from 'next'
import { Suspense } from 'react'
import DesarrollosIndexClient from './DesarrollosIndexClient'

// ── Server page (metadata only) ──────────────────────────────────────────────
// All interactive UI lives in `DesarrollosIndexClient`. Keeping the metadata
// export on the server component means the page still gets proper SSR
// metadata for crawlers and social previews.
export async function generateMetadata({
  params,
}: {
  params: { lang: string }
}): Promise<Metadata> {
  const lang = params.lang === 'es' ? 'es' : 'en'
  const title = lang === 'es'
    ? 'Desarrollos | DR Housing'
    : 'New Developments | DR Housing'
  const description = lang === 'es'
    ? 'Construcción nueva y preventas seleccionadas en el Valle Central de Costa Rica.'
    : 'Curated new construction and pre-sales across Costa Rica’s Central Valley.'
  return {
    title,
    description,
    alternates: {
      canonical: `https://drhousing.net/${lang}/desarrollos`,
      languages: {
        es: 'https://drhousing.net/es/desarrollos',
        en: 'https://drhousing.net/en/desarrollos',
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: lang === 'es' ? 'es_CR' : 'en_US',
      siteName: 'DR Housing',
    },
  }
}

export default function DesarrollosPage({ params }: { params: { lang: string } }) {
  const lang = params.lang === 'es' ? 'es' : 'en'
  // Suspense is required because DesarrollosIndexClient calls useSearchParams()
  // for URL-synced filter state — Next 14 requires a boundary for static export.
  return (
    <Suspense fallback={<div className="min-h-[70vh] bg-[#F5F2EE]" />}>
      <DesarrollosIndexClient lang={lang} />
    </Suspense>
  )
}
