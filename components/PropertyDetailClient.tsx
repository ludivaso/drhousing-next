'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Bed, Bath, Maximize, LandPlot, MapPin } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { formatPrice, type PropertyRow } from '@/lib/supabase/queries'
import WhatsAppCTA, { WhatsAppFAB } from '@/components/WhatsAppCTA'
import { useI18n } from '@/lib/i18n/context'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://drhousing.net'

// Neighbourhood centre-points for the map fallback
const NEIGHBORHOOD_COORDS: Record<string, [number, number]> = {
  'Escazú':             [9.9188, -84.1386],
  'Santa Ana':          [9.9281, -84.1836],
  'La Guácima':         [9.9667, -84.2167],
  'Lindora':            [9.9500, -84.1500],
  'Ciudad Colón':       [9.9033, -84.2600],
  'Pozos':              [9.9350, -84.1800],
  'Hacienda Los Reyes': [9.9550, -84.1300],
  'Rohrmoser':          [9.9400, -84.0950],
  'Sabana':             [9.9370, -84.1020],
  'Alajuela':           [10.0162, -84.2141],
  'Heredia':            [9.9983, -84.1170],
}

function getMapCoords(locationName: string | null): [number, number] {
  if (!locationName) return [9.9188, -84.1386]
  for (const [key, coords] of Object.entries(NEIGHBORHOOD_COORDS)) {
    if (locationName.toLowerCase().includes(key.toLowerCase())) return coords
  }
  return [9.9188, -84.1386]
}

interface Props {
  property: PropertyRow
}

export default function PropertyDetailClient({ property }: Props) {
  const { t, lang } = useI18n()
  const p = property

  const whatsappMessage = `${lang === 'en' ? 'Hello, I\'m interested in' : 'Hola, me interesa la propiedad'}: ${p.title} — ${SITE_URL}/property/${p.slug}`

  const title       = (lang === 'en' && (p as any).title_en)       ? (p as any).title_en       : p.title
  const description = lang === "en" && p.description_en ? p.description_en : p.description
  const allImages   = p.images ?? []
  const askLabel    = t('propertyDetail.askAboutProperty')

  const [lat, lng] = getMapCoords(p.location_name)
  const mapSrc = `https://maps.google.com/maps?q=${lat},${lng}&t=m&z=14&output=embed&hl=${lang}`

  return (
    <>
      <main className="min-h-screen bg-background pb-24 md:pb-0">

        {/* Back nav */}
        <div className="bg-card border-b border-border">
          <div className="container-wide py-4">
            <Link
              href="/propiedades"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-sans"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('propertyDetail.backToProperties')}
            </Link>
          </div>
        </div>

        {/* Header */}
        <section className="bg-background">
          <div className="container-wide pt-4 pb-5">
            <div className="flex flex-wrap items-start gap-3 mb-3">
              <StatusBadge status={p.status} lang={lang} />
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground font-sans capitalize">
                {p.property_type}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-1">
              {title}
            </h1>

            {p.subtitle && (
              <p className="mt-1 mb-3 font-light italic text-[15px] font-sans" style={{ color: '#6B6B6B' }}>
                {p.subtitle}
              </p>
            )}

            <div className="mb-1">
              {p.price_sale && (
                <span className="font-serif text-xl sm:text-2xl font-bold" style={{ color: '#C9A96E' }}>
                  {formatPrice(p.price_sale, p.currency)}
                </span>
              )}
              {p.price_rent_monthly && (
                <div className="mt-1">
                  <span className="font-serif text-xl sm:text-2xl font-bold" style={{ color: '#C9A96E' }}>
                    {formatPrice(p.price_rent_monthly, p.currency)}
                  </span>
                  <span className="text-sm text-muted-foreground font-sans">
                    {t('propertyDetail.perMonth')}
                  </span>
                </div>
              )}
            </div>

            <h2 className="flex items-center gap-2 text-[14px] mt-2 font-sans font-normal" style={{ color: '#6B6B6B' }}>
              <MapPin className="w-4 h-4" />
              <span>{p.location_name}</span>
            </h2>
          </div>
        </section>

        {/* Gallery */}
        <section className="bg-muted">
          <div className="container-wide py-6">
            {allImages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                <div className="aspect-[4/3] rounded-xl overflow-hidden group">
                  <Image
                    src={allImages[0]}
                    alt={title}
                    width={800}
                    height={600}
                    priority
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {allImages.slice(1, 5).map((img, i) => (
                    <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden group">
                      <Image
                        src={img}
                        alt={`Photo ${i + 2}`}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                  {allImages.length < 5 &&
                    Array.from({ length: 5 - Math.max(allImages.length, 1) }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-[4/3] rounded-lg bg-border" />
                    ))}
                </div>
              </div>
            ) : (
              <div className="aspect-[16/9] rounded-xl bg-border flex items-center justify-center text-muted-foreground font-sans text-sm">
                {lang === 'en' ? 'No images' : 'Sin imágenes'}
              </div>
            )}
          </div>
        </section>

        {/* Body */}
        <div className="container-wide py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Main column */}
            <div className="lg:col-span-2 space-y-10">

              {/* Mobile WhatsApp CTA */}
              <div className="md:hidden">
                <WhatsAppCTA message={whatsappMessage} label={askLabel} variant="hero" />
              </div>

              {/* Spec bar */}
              <SpecBar property={p} t={t} lang={lang} />

              {/* Amenities */}
              {(p.amenities?.length ?? 0) > 0 && (
                <section>
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                    {t('propertyDetail.mainFeatures')}
                  </h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {p.amenities!.map((a) => (
                      <li key={a} className="flex items-center gap-2 font-sans text-sm text-foreground">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#C9A96E' }} />
                        {a}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Description (locale-aware) */}
              {description && (
                <section>
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                    {t('propertyDetail.description')}
                  </h2>
                  <div className="prose prose-stone max-w-none font-sans text-foreground text-sm leading-relaxed">
                    <ReactMarkdown>{description}</ReactMarkdown>
                  </div>
                </section>
              )}

              {/* Investment Perspective */}
              {p.plusvalia_notes && (
                <section
                  className="pl-6 py-6 pr-6 rounded-r-lg"
                  style={{ borderLeft: '4px solid #C9A96E', backgroundColor: '#F5F2EE' }}
                >
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                    {t('propertyDetail.investmentPerspective')}
                  </h2>
                  <div className="prose prose-stone max-w-none font-sans text-foreground text-sm leading-relaxed">
                    <ReactMarkdown>{p.plusvalia_notes}</ReactMarkdown>
                  </div>
                </section>
              )}

              {/* Map */}
              <section>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                  {t('propertyDetail.neighborhoodMap')}
                </h2>
                <div className="rounded-xl overflow-hidden border border-border" style={{ height: 320 }}>
                  <iframe
                    src={mapSrc}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`${p.location_name} map`}
                  />
                </div>
                {p.location_name && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {p.location_name}
                  </p>
                )}
              </section>

              {/* Desktop bottom CTA */}
              <section className="border-t border-border pt-10 text-center hidden md:block">
                <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
                  {t('propertyDetail.interested')}
                </h2>
                <p className="font-sans text-muted-foreground text-sm mb-6">
                  {t('propertyDetail.contactForVisit')}
                </p>
                <WhatsAppCTA message={whatsappMessage} label={askLabel} variant="footer" />
              </section>
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block space-y-6">
              <div className="card-elevated p-6 space-y-4 sticky top-28">
                <div>
                  {p.price_sale && (
                    <p className="font-serif font-bold text-2xl" style={{ color: '#C9A96E' }}>
                      {formatPrice(p.price_sale, p.currency)}
                    </p>
                  )}
                  {p.price_rent_monthly && (
                    <p className="font-sans text-muted-foreground text-base">
                      {formatPrice(p.price_rent_monthly, p.currency)}
                      <span className="text-xs">{t('propertyDetail.perMonth')}</span>
                    </p>
                  )}
                </div>

                <div className="border-t border-border pt-4 grid grid-cols-2 gap-3">
                  <QuickSpec icon={<Bed className="w-4 h-4" />}      label={t('propertyDetail.beds')}     value={p.bedrooms} />
                  <QuickSpec icon={<Bath className="w-4 h-4" />}     label={t('propertyDetail.baths')}    value={p.bathrooms} />
                  {p.construction_size_sqm && (
                    <QuickSpec icon={<Maximize className="w-4 h-4" />} label={t('propertyDetail.construction')} value={`${p.construction_size_sqm} m²`} />
                  )}
                  {p.land_size_sqm && (
                    <QuickSpec icon={<LandPlot className="w-4 h-4" />} label={t('propertyDetail.land')} value={`${p.land_size_sqm} m²`} />
                  )}
                </div>

                <div className="border-t border-border pt-4">
                  <WhatsAppCTA message={whatsappMessage} label={askLabel} variant="sidebar" />
                </div>

                <p className="font-sans text-muted-foreground text-xs text-center">
                  {t('propertyDetail.advisor')}
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <WhatsAppFAB message={whatsappMessage} />
    </>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function StatusBadge({ status, lang }: { status: string; lang: string }) {
  const map: Record<string, string> = {
    for_sale:       'badge-sale',
    for_rent:       'badge-rent',
    both:           'badge-both',
    presale:        'badge-both',
    under_contract: 'bg-amber-600 text-white text-xs font-medium tracking-wide px-2.5 py-1 rounded',
    sold:           'bg-muted text-muted-foreground text-xs font-medium tracking-wide px-2.5 py-1 rounded',
    rented:         'bg-muted text-muted-foreground text-xs font-medium tracking-wide px-2.5 py-1 rounded',
  }
  const labels: Record<string, { es: string; en: string }> = {
    for_sale:       { es: 'En Venta',        en: 'For Sale' },
    for_rent:       { es: 'En Alquiler',     en: 'For Rent' },
    both:           { es: 'Venta & Alquiler',en: 'Sale & Rent' },
    presale:        { es: 'Preventa',        en: 'Pre-Sale' },
    under_contract: { es: 'Bajo Contrato',   en: 'Under Contract' },
    sold:           { es: 'Vendido',         en: 'Sold' },
    rented:         { es: 'Alquilado',       en: 'Rented' },
  }
  const label = labels[status]?.[lang as 'es' | 'en'] ?? status
  return (
    <span className={`uppercase tracking-wide font-sans ${map[status] ?? 'badge-sale'}`}>
      {label}
    </span>
  )
}

function SpecBar({ property: p, t, lang }: { property: PropertyRow; t: (k: string) => string; lang: string }) {
  const specs = [
    p.bedrooms > 0  && { icon: <Bed className="w-5 h-5" />,      value: p.bedrooms,                       label: p.bedrooms === 1 ? t('propertyDetail.bedroom') : t('propertyDetail.beds') },
    p.bathrooms > 0 && { icon: <Bath className="w-5 h-5" />,     value: p.bathrooms,                      label: p.bathrooms === 1 ? t('propertyDetail.bathroom') : t('propertyDetail.baths') },
    p.construction_size_sqm && { icon: <Maximize className="w-5 h-5" />, value: `${p.construction_size_sqm} m²`, label: t('propertyDetail.construction') },
    p.land_size_sqm         && { icon: <LandPlot className="w-5 h-5" />, value: `${p.land_size_sqm} m²`,        label: t('propertyDetail.land') },
  ].filter(Boolean) as { icon: React.ReactNode; value: string | number; label: string }[]

  if (specs.length === 0) return null

  return (
    <div className="border-t border-b border-border py-5 flex flex-wrap gap-6">
      {specs.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <span style={{ color: '#C9A96E' }}>{s.icon}</span>
          <div>
            <p className="font-sans font-semibold text-foreground text-base leading-none">{s.value}</p>
            <p className="font-sans text-muted-foreground text-xs mt-0.5">{s.label}</p>
          </div>
          {i < specs.length - 1 && <span className="ml-4 h-8 w-px bg-border" />}
        </div>
      ))}
    </div>
  )
}

function QuickSpec({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ color: '#C9A96E' }}>{icon}</span>
      <div>
        <p className="font-sans text-muted-foreground text-xs">{label}</p>
        <p className="font-sans font-medium text-foreground text-sm">{value}</p>
      </div>
    </div>
  )
}
