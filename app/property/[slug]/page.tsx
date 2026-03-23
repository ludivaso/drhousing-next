import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, Bed, Bath, Maximize, LandPlot, MapPin } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import {
  getPropertyBySlug,
  getPublicSlugs,
  getHeroImage,
  formatPrice,
  type PropertyRow,
} from '@/lib/supabase/queries'
import WhatsAppCTA, { WhatsAppFAB } from '@/components/WhatsAppCTA'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://drhousing.net'

export const revalidate = 1800

export async function generateStaticParams() {
  const slugs = await getPublicSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const property = await getPropertyBySlug(params.slug)
  if (!property) return {}

  const title       = property.meta_title || property.title
  const description = property.meta_description || property.description?.slice(0, 160) || ''
  const heroImage   = getHeroImage(property)
  const ogImage     = heroImage
    ? heroImage.startsWith('http') ? heroImage : `${SITE_URL}${heroImage}`
    : `${SITE_URL}/og-default.jpg`

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/property/${property.slug}` },
    openGraph: {
      title: property.meta_title || property.title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: 'article',
      url: `${SITE_URL}/property/${property.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: property.meta_title || property.title,
      description,
      images: [ogImage],
    },
  }
}

export default async function PropertyDetailPage({ params }: { params: { slug: string } }) {
  const property = await getPropertyBySlug(params.slug)
  if (!property) notFound()

  const heroImage       = getHeroImage(property)
  const allImages       = property.images ?? []
  const whatsappMessage = `Hola, me interesa la propiedad: ${property.title} — ${SITE_URL}/property/${property.slug}`

  return (
    <>
      <main className="min-h-screen bg-background pb-24 md:pb-0">

        {/* ── BACK NAV — exact from Lovable: bg-card border-b border-border ── */}
        <div className="bg-card border-b border-border">
          <div className="container-wide py-4">
            <Link
              href="/property"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-sans"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Propiedades
            </Link>
          </div>
        </div>

        {/* ── HEADER SECTION — exact from Lovable PropertyDetailPage ── */}
        <section className="bg-background">
          <div className="container-wide pt-4 pb-5">

            {/* Badge row — status badge */}
            <div className="flex flex-wrap items-start gap-3 mb-3">
              <StatusBadge status={property.status} />
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground font-sans capitalize">
                {property.property_type}
              </span>
            </div>

            {/* H1 — exact: font-serif text-3xl sm:text-4xl font-semibold text-foreground */}
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-1">
              {property.title}
            </h1>

            {/* Subtitle — exact: font-light italic text-[15px] color: #6B6B6B */}
            {property.subtitle_es && (
              <p className="mt-1 mb-3 font-light italic text-[15px] font-sans" style={{ color: '#6B6B6B' }}>
                {property.subtitle_es}
              </p>
            )}

            {/* Price — exact: font-serif text-xl sm:text-2xl font-bold color: #C9A96E */}
            <div className="mb-1">
              {property.price_sale && (
                <span className="font-serif text-xl sm:text-2xl font-bold" style={{ color: '#C9A96E' }}>
                  {formatPrice(property.price_sale, property.currency)}
                </span>
              )}
              {property.price_rent_monthly && (
                <div className="mt-1">
                  <span className="font-serif text-xl sm:text-2xl font-bold" style={{ color: '#C9A96E' }}>
                    {formatPrice(property.price_rent_monthly, property.currency)}
                  </span>
                  <span className="text-sm text-muted-foreground font-sans">/mes</span>
                </div>
              )}
            </div>

            {/* Location — exact: flex items-center gap-2 text-[14px] color: #6B6B6B */}
            <h2 className="flex items-center gap-2 text-[14px] mt-2 font-sans font-normal" style={{ color: '#6B6B6B' }}>
              <MapPin className="w-4 h-4" />
              <span>{property.location_name}</span>
            </h2>
          </div>
        </section>

        {/* ── GALLERY — exact grid from Lovable ── */}
        <section className="bg-muted">
          <div className="container-wide py-6">
            {allImages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                {/* Hero image: aspect-[4/3] rounded-xl */}
                <div className="aspect-[4/3] rounded-xl overflow-hidden group">
                  <Image
                    src={allImages[0]}
                    alt={property.title}
                    width={800}
                    height={600}
                    priority
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* 2×2 grid of thumbnails — rounded-lg */}
                <div className="grid grid-cols-2 gap-4">
                  {allImages.slice(1, 5).map((img, i) => (
                    <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden group">
                      <Image
                        src={img}
                        alt={`Foto ${i + 2}`}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                  {/* Fill empty slots */}
                  {allImages.length < 5 &&
                    Array.from({ length: 5 - Math.max(allImages.length, 1) }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-[4/3] rounded-lg bg-border" />
                    ))}
                </div>
              </div>
            ) : (
              <div className="aspect-[16/9] rounded-xl bg-border flex items-center justify-center text-muted-foreground font-sans text-sm">
                Sin imágenes
              </div>
            )}
          </div>
        </section>

        {/* ── BODY ── */}
        <div className="container-wide py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* ── MAIN COLUMN ── */}
            <div className="lg:col-span-2 space-y-10">

              {/* Mobile WhatsApp CTA — visible without scroll */}
              <div className="md:hidden">
                <WhatsAppCTA message={whatsappMessage} label="Preguntar sobre esta propiedad" variant="hero" />
              </div>

              {/* Spec bar */}
              <SpecBar property={property} />

              {/* Amenities */}
              {(property.amenities?.length ?? 0) > 0 && (
                <section>
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                    Características Principales
                  </h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {property.amenities!.map((a) => (
                      <li key={a} className="flex items-center gap-2 font-sans text-sm text-foreground">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#C9A96E' }} />
                        {a}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Spanish description */}
              {property.description && (
                <section>
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                    Descripción
                  </h2>
                  <div className="prose prose-stone max-w-none font-sans text-foreground text-sm leading-relaxed">
                    <ReactMarkdown>{property.description}</ReactMarkdown>
                  </div>
                </section>
              )}

              {/* Investment Perspective — conditional, only if plusvalia_notes */}
              {property.plusvalia_notes && (
                <section
                  className="pl-6 py-6 pr-6 rounded-r-lg"
                  style={{
                    borderLeft: '4px solid #C9A96E',
                    backgroundColor: '#F5F2EE',
                  }}
                >
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                    Perspectiva de Inversión
                  </h2>
                  <div className="prose prose-stone max-w-none font-sans text-foreground text-sm leading-relaxed">
                    <ReactMarkdown>{property.plusvalia_notes}</ReactMarkdown>
                  </div>
                </section>
              )}

              {/* English description toggle */}
              {property.description_en && (
                <section className="border-t border-border pt-8">
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                    Description (English)
                  </h2>
                  <div className="prose prose-stone max-w-none font-sans text-muted-foreground text-sm leading-relaxed">
                    <ReactMarkdown>{property.description_en}</ReactMarkdown>
                  </div>
                </section>
              )}

              {/* Desktop bottom CTA */}
              <section className="border-t border-border pt-10 text-center hidden md:block">
                <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
                  ¿Le interesa esta propiedad?
                </h2>
                <p className="font-sans text-muted-foreground text-sm mb-6">
                  Contáctenos para más información o para agendar una visita.
                </p>
                <WhatsAppCTA message={whatsappMessage} label="Preguntar sobre esta propiedad" variant="footer" />
              </section>
            </div>

            {/* ── SIDEBAR ── */}
            <aside className="hidden lg:block space-y-6">
              <div className="card-elevated p-6 space-y-4 sticky top-28">

                {/* Price */}
                <div>
                  {property.price_sale && (
                    <p className="font-serif font-bold text-2xl" style={{ color: '#C9A96E' }}>
                      {formatPrice(property.price_sale, property.currency)}
                    </p>
                  )}
                  {property.price_rent_monthly && (
                    <p className="font-sans text-muted-foreground text-base">
                      {formatPrice(property.price_rent_monthly, property.currency)}
                      <span className="text-xs">/mes</span>
                    </p>
                  )}
                </div>

                {/* Quick specs */}
                <div className="border-t border-border pt-4 grid grid-cols-2 gap-3">
                  <QuickSpec icon={<Bed className="w-4 h-4" />}      label="Habitaciones" value={property.bedrooms} />
                  <QuickSpec icon={<Bath className="w-4 h-4" />}     label="Baños"        value={property.bathrooms} />
                  {property.construction_size_sqm && (
                    <QuickSpec icon={<Maximize className="w-4 h-4" />} label="Construcción" value={`${property.construction_size_sqm} m²`} />
                  )}
                  {property.land_size_sqm && (
                    <QuickSpec icon={<LandPlot className="w-4 h-4" />} label="Terreno"      value={`${property.land_size_sqm} m²`} />
                  )}
                </div>

                {/* CTA */}
                <div className="border-t border-border pt-4">
                  <WhatsAppCTA message={whatsappMessage} label="Preguntar sobre esta propiedad" variant="sidebar" />
                </div>

                <p className="font-sans text-muted-foreground text-xs text-center">
                  DR Housing · +506 8654-0888
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Mobile sticky FAB */}
      <WhatsAppFAB message={whatsappMessage} />
    </>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    for_sale:       'badge-sale',
    for_rent:       'badge-rent',
    both:           'badge-both',
    presale:        'badge-both',
    under_contract: 'bg-amber-600 text-white text-xs font-medium tracking-wide px-2.5 py-1 rounded',
    sold:           'bg-muted text-muted-foreground text-xs font-medium tracking-wide px-2.5 py-1 rounded',
    rented:         'bg-muted text-muted-foreground text-xs font-medium tracking-wide px-2.5 py-1 rounded',
  }
  const labels: Record<string, string> = {
    for_sale: 'En Venta', for_rent: 'En Alquiler', both: 'Venta & Alquiler',
    presale: 'Preventa', under_contract: 'Bajo Contrato', sold: 'Vendido', rented: 'Alquilado',
  }
  return (
    <span className={`uppercase tracking-wide font-sans ${map[status] ?? 'badge-sale'}`}>
      {labels[status] ?? status}
    </span>
  )
}

function SpecBar({ property }: { property: PropertyRow }) {
  const specs = [
    property.bedrooms > 0    && { icon: <Bed className="w-5 h-5" />,      value: property.bedrooms,                  label: property.bedrooms === 1 ? 'Habitación' : 'Habitaciones' },
    property.bathrooms > 0   && { icon: <Bath className="w-5 h-5" />,     value: property.bathrooms,                 label: property.bathrooms === 1 ? 'Baño' : 'Baños' },
    property.construction_size_sqm && { icon: <Maximize className="w-5 h-5" />, value: `${property.construction_size_sqm} m²`, label: 'Construcción' },
    property.land_size_sqm   && { icon: <LandPlot className="w-5 h-5" />, value: `${property.land_size_sqm} m²`,    label: 'Terreno' },
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
