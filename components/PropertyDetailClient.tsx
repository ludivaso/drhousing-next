'use client'

import { useState, useEffect, useCallback } from 'react'
import PropertyInquiryModal from '@/components/PropertyInquiryModal'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  BedDouble,
  Bath,
  Building2,
  TreePine,
  Layers,
  MapPin,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
} from 'lucide-react'
import { formatPrice, type PropertyRow } from '@/lib/supabase/queries'
import PropertyCard from '@/components/PropertyCard'
import FavoriteButton from '@/components/FavoriteButton'
import { useI18n } from '@/lib/i18n/context'

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getPropertyTypeLabel(type: string): string {
  const map: Record<string, string> = {
    house:       'Casa',
    apartment:   'Apartamento',
    condo:       'Condominio',
    land:        'Lote',
    commercial:  'Comercial',
    townhouse:   'Townhouse',
  }
  return map[type] ?? type
}

// ── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({
  images,
  startIndex,
  onClose,
}: {
  images: string[]
  startIndex: number
  onClose: () => void
}) {
  const [current, setCurrent] = useState(startIndex)

  const prev = useCallback(() => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1)), [images.length])
  const next = useCallback(() => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1)), [images.length])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [prev, next, onClose])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
        onClick={onClose}
        aria-label="Cerrar"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev */}
      <button
        className="absolute left-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
        onClick={(e) => { e.stopPropagation(); prev() }}
        aria-label="Anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Image */}
      <div
        className="relative w-full max-w-4xl mx-16 aspect-[4/3]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[current]}
          alt={`Photo ${current + 1}`}
          fill
          className="object-contain"
          sizes="100vw"
        />
        <p className="absolute bottom-2 right-2 text-white/70 text-sm font-sans bg-black/40 px-2 py-1 rounded">
          {current + 1} / {images.length}
        </p>
      </div>

      {/* Next */}
      <button
        className="absolute right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
        onClick={(e) => { e.stopPropagation(); next() }}
        aria-label="Siguiente"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  property: PropertyRow
  relatedProperties?: PropertyRow[]
  lang?: 'es' | 'en'
}

export default function PropertyDetailClient({ property, relatedProperties = [], lang: langProp }: Props) {
  const { lang: i18nLang } = useI18n()
  const lang = langProp ?? i18nLang
  const p = property

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [inquiryOpen, setInquiryOpen] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)

  // Deduplicated image list: featured first, then fill with images
  const allImages: string[] = []
  const seen = new Set<string>()
  for (const img of (p.featured_images ?? [])) {
    if (img && !seen.has(img)) { allImages.push(img); seen.add(img) }
  }
  for (const img of (p.images ?? [])) {
    if (img && !seen.has(img)) { allImages.push(img); seen.add(img) }
  }

  const title       = (lang === 'en' && p.title_en) ? p.title_en : p.title
  const description = (lang === 'en' && p.description_en) ? p.description_en : (p.description ?? '')

  const whatsappText  = encodeURIComponent(`Hola, me interesa la propiedad ${p.reference_id ?? p.title}`)
  const whatsappHref  = `https://wa.me/50686540888?text=${whatsappText}`

  // Status badge logic
  function getStatusBadge() {
    if (p.price_sale && p.price_rent_monthly) {
      return { label: 'Venta y Alquiler', className: 'bg-amber-500 text-white text-xs font-medium tracking-wide uppercase px-2.5 py-1 rounded font-sans' }
    }
    if (p.price_sale) {
      return { label: 'En Venta', className: 'bg-green-600 text-white text-xs font-medium tracking-wide uppercase px-2.5 py-1 rounded font-sans' }
    }
    if (p.price_rent_monthly) {
      return { label: 'En Alquiler', className: 'bg-blue-600 text-white text-xs font-medium tracking-wide uppercase px-2.5 py-1 rounded font-sans' }
    }
    return null
  }

  const statusBadge = getStatusBadge()

  function openLightbox(index: number) {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  // Description truncation
  const DESC_LIMIT = 300
  const isLong = description.length > DESC_LIMIT
  const displayedDesc = isLong && !descExpanded ? description.slice(0, DESC_LIMIT) + '…' : description

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
              Volver a propiedades
            </Link>
          </div>
        </div>

        {/* ── HEADER ───────────────────────────────────────────────────── */}
        <section className="bg-background">
          <div className="container-wide pt-6 pb-5">

            {/* Badge row */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {statusBadge && (
                <span className={statusBadge.className}>{statusBadge.label}</span>
              )}
              {p.tier && (
                <span className="text-xs font-medium px-2.5 py-1 rounded bg-muted text-muted-foreground font-sans capitalize">
                  {p.tier}
                </span>
              )}
              <span className="text-xs font-medium px-2.5 py-1 rounded border border-border text-muted-foreground font-sans">
                {getPropertyTypeLabel(p.property_type)}
              </span>
            </div>

            {/* Title */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="font-serif text-3xl font-semibold text-foreground mb-1">
                {title}
              </h1>
              <FavoriteButton
                propertyId={p.id}
                className="mt-1 w-9 h-9 rounded-full border border-border bg-background hover:bg-muted shadow-sm flex-shrink-0"
              />
            </div>

            {/* Subtitle */}
            {p.subtitle && (
              <p className="mt-1 mb-3 font-light italic text-[15px] font-sans" style={{ color: '#6B6B6B' }}>
                {p.subtitle}
              </p>
            )}

            {/* Price */}
            <div className="mb-1 space-y-1">
              {p.original_price && p.price_sale && p.original_price > p.price_sale && (
                <p className="font-sans text-muted-foreground text-base line-through">
                  {formatPrice(p.original_price, p.currency)}
                </p>
              )}
              {p.price_sale && (
                <p className="font-serif text-2xl font-bold" style={{ color: '#C9A96E' }}>
                  {formatPrice(p.price_sale, p.currency)}
                </p>
              )}
              {p.price_rent_monthly && (
                <p className="font-serif text-xl font-bold text-blue-600">
                  {formatPrice(p.price_rent_monthly, p.currency)}
                  <span className="text-sm font-sans text-muted-foreground font-normal ml-1">/mes</span>
                </p>
              )}
              {p.price_note && (
                <p className="font-sans text-sm text-muted-foreground">{p.price_note}</p>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center gap-1.5 text-sm font-sans mt-2" style={{ color: '#6B6B6B' }}>
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>{p.location_name}</span>
            </div>
          </div>
        </section>

        {/* ── PHOTO GALLERY ─────────────────────────────────────────────── */}
        <section className="bg-muted">
          <div className="container-wide py-6">
            {allImages.length > 0 ? (
              <div className="relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Large image left — spans 2 rows */}
                  <div
                    className="md:row-span-2 aspect-[4/3] md:aspect-auto relative rounded-xl overflow-hidden group cursor-pointer"
                    style={{ minHeight: '300px' }}
                    onClick={() => openLightbox(0)}
                  >
                    <Image
                      src={allImages[0]}
                      alt={title}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* 4 smaller images in 2x2 grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {allImages.slice(1, 5).map((img, i) => (
                      <div
                        key={i}
                        className="aspect-[4/3] relative rounded-lg overflow-hidden group cursor-pointer"
                        onClick={() => openLightbox(i + 1)}
                      >
                        <Image
                          src={img}
                          alt={`Foto ${i + 2}`}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                    {/* Empty placeholders */}
                    {Array.from({ length: Math.max(0, 4 - (allImages.length - 1)) }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-[4/3] rounded-lg bg-border" />
                    ))}
                  </div>
                </div>

                {/* "Ver todas las fotos" button */}
                {allImages.length > 1 && (
                  <button
                    className="absolute bottom-4 right-4 bg-white/90 text-foreground text-sm font-sans font-medium px-4 py-2 rounded-lg shadow hover:bg-white transition-colors"
                    onClick={() => openLightbox(0)}
                  >
                    Ver todas las fotos ({allImages.length})
                  </button>
                )}
              </div>
            ) : (
              <div className="aspect-[16/9] rounded-xl bg-border flex items-center justify-center text-muted-foreground font-sans text-sm">
                Sin imágenes
              </div>
            )}

            {/* YouTube embed */}
            {p.youtube_enabled === true && p.youtube_url && (
              <div className="mt-6 aspect-video rounded-xl overflow-hidden">
                <iframe
                  src={p.youtube_url.replace('watch?v=', 'embed/')}
                  title="Video de la propiedad"
                  width="100%"
                  height="100%"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </section>

        {/* ── BODY GRID ─────────────────────────────────────────────────── */}
        <div className="container-wide py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── MAIN COLUMN ─────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-10">

              {/* Spec bar */}
              <SpecBar property={p} />

              {/* Description */}
              {description && (
                <section>
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                    Descripción
                  </h2>
                  <div className="font-sans text-sm text-foreground leading-relaxed">
                    <p style={{ whiteSpace: 'pre-wrap' }}>{displayedDesc}</p>
                    {isLong && (
                      <button
                        className="mt-2 text-sm font-medium font-sans hover:opacity-80 transition-opacity"
                        style={{ color: '#C9A96E' }}
                        onClick={() => setDescExpanded((v) => !v)}
                      >
                        {descExpanded ? 'Leer menos' : 'Leer más'}
                      </button>
                    )}
                  </div>
                </section>
              )}

              {/* Features grid */}
              {(p.features?.length ?? 0) > 0 && (
                <section>
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                    Características
                  </h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(p.features ?? []).map((f) => (
                      <li key={f} className="flex items-center gap-2 font-sans text-sm text-foreground">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#C9A96E' }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Amenities grid */}
              {(p.amenities?.length ?? 0) > 0 && (
                <section>
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                    Amenidades
                  </h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {(p.amenities ?? []).map((a) => (
                      <li key={a} className="flex items-center gap-2 font-sans text-sm text-foreground">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#C9A96E' }} />
                        {a}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Plusvalía / Investment Perspective */}
              {p.plusvalia_notes && (
                <section
                  className="pl-6 py-6 pr-6 rounded-r-lg"
                  style={{ borderLeft: '3px solid #C9A96E', backgroundColor: '#F5F2EE' }}
                >
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                    Perspectiva de Inversión
                  </h2>
                  <p className="font-sans text-sm text-foreground leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
                    {p.plusvalia_notes}
                  </p>
                </section>
              )}

              {/* WhatsApp CTA hero */}
              <section>
                <Link
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-4 rounded-xl font-sans font-semibold text-base text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <WhatsAppIcon />
                  Consultar sobre esta propiedad
                </Link>
              </section>

              {/* Google Maps */}
              <section>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                  Ubicación
                </h2>
                {p.lat !== null && p.lng !== null ? (
                  <iframe
                    src={`https://maps.google.com/maps?q=${p.lat},${p.lng}&z=15&output=embed`}
                    title={`Mapa: ${p.location_name}`}
                    width="100%"
                    height="300"
                    className="w-full rounded-lg border border-border"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="flex items-center gap-2 py-4 font-sans text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    {p.location_name}
                  </div>
                )}
              </section>

              {/* Related properties */}
              {relatedProperties.length > 0 && (
                <section>
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
                    Propiedades Similares
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {relatedProperties.map((rp) => (
                      <PropertyCard key={rp.id} property={rp} lang={lang} />
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* ── SIDEBAR ──────────────────────────────────────────────── */}
            <aside className="hidden lg:block">
              <div
                className="rounded-xl border border-border bg-card p-6 space-y-5 sticky top-28 shadow-sm"
              >
                {/* Reference ID */}
                {p.reference_id && (
                  <div>
                    <p className="text-xs font-sans text-muted-foreground uppercase tracking-wide mb-1">
                      Referencia
                    </p>
                    <p className="font-mono text-sm text-foreground">{p.reference_id}</p>
                  </div>
                )}

                {/* Call */}
                <a
                  href="tel:+50686540888"
                  className="flex items-center gap-3 w-full py-3 px-4 rounded-lg border border-border font-sans text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <Phone className="w-4 h-4 flex-shrink-0" style={{ color: '#C9A96E' }} />
                  Llamar ahora
                </a>

                {/* Email inquiry */}
                <button
                  onClick={() => setInquiryOpen(true)}
                  className="flex items-center gap-3 w-full py-3 px-4 rounded-lg border border-border font-sans text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" style={{ color: '#C9A96E' }} />
                  Solicitar información
                </button>

                {/* Agent card */}
                <div className="border-t border-border pt-4">
                  <p className="text-xs font-sans text-muted-foreground uppercase tracking-wide mb-2">
                    Agente
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-serif font-semibold text-muted-foreground">
                        {((p as PropertyRow & { listing_agent_name?: string }).listing_agent_name ?? 'A')[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-sans text-sm font-medium text-foreground">
                        {(p as PropertyRow & { listing_agent_name?: string }).listing_agent_name ?? 'Agente DR Housing'}
                      </p>
                      <p className="font-sans text-xs text-muted-foreground">DR Housing</p>
                    </div>
                  </div>
                </div>

                {/* Listed date */}
                <div className="border-t border-border pt-4">
                  <p className="text-xs font-sans text-muted-foreground uppercase tracking-wide mb-1">
                    Publicado
                  </p>
                  <p className="font-sans text-sm text-foreground">{formatDate(p.created_at)}</p>
                </div>

                {/* WhatsApp in sidebar */}
                <Link
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-sans text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <WhatsAppIcon size={18} />
                  Consultar por WhatsApp
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Lightbox */}
      {lightboxOpen && allImages.length > 0 && (
        <Lightbox
          images={allImages}
          startIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* Mobile sticky WhatsApp FAB */}
      <Link
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="fixed bottom-24 right-5 z-50 flex items-center justify-center rounded-full text-white shadow-lg hover:opacity-90 transition-opacity md:hidden"
        style={{ width: 56, height: 56, backgroundColor: '#25D366' }}
      >
        <WhatsAppIcon size={28} />
      </Link>

      <PropertyInquiryModal
        property={p}
        open={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
      />
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SpecBar({ property: p }: { property: PropertyRow }) {
  type SpecItem = { icon: React.ReactNode; value: React.ReactNode; label: string }

  const specs: SpecItem[] = []

  if (p.bedrooms > 0) {
    specs.push({
      icon: <BedDouble className="w-5 h-5" />,
      value: p.bedrooms,
      label: 'Habitaciones',
    })
  }
  if (p.bathrooms > 0) {
    specs.push({
      icon: <Bath className="w-5 h-5" />,
      value: p.bathrooms,
      label: 'Baños',
    })
  }
  if (p.construction_size_sqm) {
    const ft2 = Math.round(p.construction_size_sqm * 10.764)
    specs.push({
      icon: <Building2 className="w-5 h-5" />,
      value: (
        <span>
          {p.construction_size_sqm} m²{' '}
          <span className="text-xs text-muted-foreground font-normal">({ft2} ft²)</span>
        </span>
      ),
      label: 'Construcción',
    })
  }
  if (p.land_size_sqm && p.land_size_sqm > 0) {
    specs.push({
      icon: <TreePine className="w-5 h-5" />,
      value: `${p.land_size_sqm} m²`,
      label: 'Terreno',
    })
  }
  if (p.levels && p.levels > 0) {
    specs.push({
      icon: <Layers className="w-5 h-5" />,
      value: p.levels === 1 ? (
        <span style={{ color: '#C9A96E' }}>Un Nivel</span>
      ) : p.levels,
      label: 'Niveles',
    })
  }

  if (specs.length === 0) return null

  return (
    <div
      className="flex flex-wrap gap-6 py-5"
      style={{ borderTop: '1px solid #E8E3DC', borderBottom: '1px solid #E8E3DC' }}
    >
      {specs.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <span style={{ color: '#C9A96E' }}>{s.icon}</span>
          <div>
            <p className="font-sans font-semibold text-foreground text-base leading-none">{s.value}</p>
            <p className="font-sans text-muted-foreground text-xs mt-0.5">{s.label}</p>
          </div>
          {i < specs.length - 1 && (
            <span className="ml-4 h-8 w-px" style={{ backgroundColor: '#E8E3DC' }} />
          )}
        </div>
      ))}
    </div>
  )
}

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}
