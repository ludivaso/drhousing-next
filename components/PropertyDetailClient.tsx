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
import { formatPrice, type PropertyRow, type AgentRow, type FeatureRow } from '@/lib/supabase/queries'
import PropertyCard from '@/components/PropertyCard'
import FavoriteButton from '@/components/FavoriteButton'
import { useI18n } from '@/lib/i18n/context'
import { usePathname } from 'next/navigation'
import PropertyDetails, { type PropertyFeatureItem } from '@/components/properties/PropertyDetails'

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string, lang: 'es' | 'en' = 'es'): string {
  return new Date(dateStr).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-CR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const CATEGORY_LABELS: Record<string, { en: string; es: string }> = {
  Security:       { en: 'Security',       es: 'Seguridad' },
  Wellness:       { en: 'Wellness',       es: 'Bienestar' },
  Sports:         { en: 'Sports',         es: 'Deportes' },
  Outdoor:        { en: 'Outdoor',        es: 'Exterior' },
  Views:          { en: 'Views',          es: 'Vistas' },
  Climate:        { en: 'Climate',        es: 'Clima' },
  Technology:     { en: 'Technology',     es: 'Tecnología' },
  Kitchen:        { en: 'Kitchen',        es: 'Cocina' },
  Interior:       { en: 'Interior',       es: 'Interior' },
  Entertainment:  { en: 'Entertainment',  es: 'Entretenimiento' },
  Services:       { en: 'Services',       es: 'Servicios' },
  Kids:           { en: 'Kids',           es: 'Niños' },
  Parking:        { en: 'Parking',        es: 'Estacionamiento' },
  Rooms:          { en: 'Rooms',          es: 'Ambientes' },
  Infrastructure: { en: 'Infrastructure', es: 'Infraestructura' },
  Location:       { en: 'Location',       es: 'Ubicación' },
  General:        { en: 'General',        es: 'General' },
}

const LABEL_OVERRIDES: Record<string, string> = {
  'Ac': 'A/C',
  'Tv': 'TV',
  'Bbq': 'BBQ',
}

function formatLabel(s: string): string {
  return s
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .split(' ')
    .map((word) => LABEL_OVERRIDES[word] ?? word)
    .join(' ')
}

// ── YouTube embed URL helper ──────────────────────────────────────────────────

/**
 * Extracts the video ID from any common YouTube URL format and returns
 * a proper embed URL. Returns null if parsing fails.
 *
 * Supported formats:
 *   https://www.youtube.com/watch?v=VIDEO_ID
 *   https://youtu.be/VIDEO_ID
 *   https://youtube.com/shorts/VIDEO_ID
 *   https://www.youtube.com/embed/VIDEO_ID
 *   https://youtube.com/v/VIDEO_ID
 */
function getYouTubeEmbedUrl(raw: string): string | null {
  try {
    const url = new URL(raw)
    let videoId: string | null = null

    // youtube.com/watch?v=ID
    if (url.searchParams.has('v')) {
      videoId = url.searchParams.get('v')
    }
    // youtube.com/shorts/ID  or  youtube.com/embed/ID  or  youtube.com/v/ID
    else if (/\/(shorts|embed|v)\//.test(url.pathname)) {
      const match = url.pathname.match(/\/(shorts|embed|v)\/([^/?&]+)/)
      videoId = match?.[2] ?? null
    }
    // youtu.be/ID
    else if (url.hostname === 'youtu.be') {
      videoId = url.pathname.slice(1).split('/')[0] || null
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  } catch {
    return null
  }
}

// ── Feature data split for PropertyDetails ────────────────────────────────────

function toFeatureItem(f: FeatureRow, lang: 'en' | 'es'): PropertyFeatureItem {
  return {
    label: (lang === 'en' ? f.name_en : f.name_es) || f.name_en || f.name_es || '',
    category: f.category || 'General',
    icon: f.icon || f.category || '',
  }
}

function buildPropertyDetailsData(
  propertyFeatures: FeatureRow[],
  // Raw canonical columns — null means not yet AI-assigned
  featuresEnRaw: string[] | null | undefined,
  featuresEsRaw: string[] | null | undefined,
  amenitiesEnRaw: string[] | null | undefined,
  amenitiesEsRaw: string[] | null | undefined,
  // Legacy fields
  amenities: string[] | null,
  features: string[] | null,
  featuresEn: string[] | undefined,   // has fallback baked in from page.tsx
  featuresEs: string[] | undefined,
  lang: 'en' | 'es',
): { highlights: PropertyFeatureItem[]; shared: PropertyFeatureItem[]; exclusive: PropertyFeatureItem[] } {
  const hasItems = (arr: string[] | null | undefined): boolean =>
    Array.isArray(arr) && arr.length > 0

  // ── Priority 1: Canonical columns (post-AI reassignment) ──────────────────
  // Use the RAW property columns (not the fallback props) so we don't
  // accidentally treat old legacy data as canonical.
  if (hasItems(featuresEnRaw) || hasItems(amenitiesEnRaw)) {
    const featureLabels = lang === 'es' && hasItems(featuresEsRaw)
      ? featuresEsRaw!
      : (featuresEnRaw ?? [])
    const amenityLabels = lang === 'es' && hasItems(amenitiesEsRaw)
      ? amenitiesEsRaw!
      : (amenitiesEnRaw ?? [])

    const highlights = featureLabels.map(label => ({ label, category: 'General', icon: label }))
    const shared     = amenityLabels.map(label => ({ label, category: 'General', icon: label }))
    return { highlights, shared, exclusive: [] }
  }

  // ── Priority 2: property_features join table (manual / legacy normalized) ──
  if (propertyFeatures.length > 0) {
    const highlights = propertyFeatures.map(f => toFeatureItem(f, lang))
    const shared = (amenities ?? []).map(a => ({
      label: formatLabel(a),
      category: lang === 'es' ? 'Amenidades' : 'Amenities',
      icon: a,
    }))
    return { highlights, shared, exclusive: [] }
  }

  // ── Priority 3: Legacy string arrays ──────────────────────────────────────
  const rawFeatures = lang === 'es'
    ? (featuresEs?.length ? featuresEs : features ?? [])
    : (featuresEn?.length ? featuresEn : features ?? [])
  const isTranslated = rawFeatures.some(f => /[ ñáéíóúü]/i.test(f))
  const highlights = rawFeatures.map(f => ({
    label: isTranslated ? f : formatLabel(f),
    category: 'General',
    icon: f,
  }))
  const shared = (amenities ?? []).map(a => ({
    label: formatLabel(a),
    category: lang === 'es' ? 'Amenidades' : 'Amenities',
    icon: a,
  }))
  return { highlights, shared, exclusive: [] }
}

// ── Fullscreen Lightbox ──────────────────────────────────────────────────────

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
  const { t } = useI18n()

  const prev = useCallback(() => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1)), [images.length])
  const next = useCallback(() => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1)), [images.length])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [prev, next, onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('propertyDetail.galleryLabel')}
      className="fixed inset-0 z-[100] bg-black flex flex-col"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-sm">
        <span className="text-white/80 text-sm font-sans font-medium">
          {current + 1} / {images.length}
        </span>
        <button
          className="text-white/80 hover:text-white bg-white/10 rounded-full p-2 hover:bg-white/20 transition-colors"
          onClick={onClose}
          aria-label={t('propertyDetail.close')}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main image area */}
      <div className="flex-1 relative flex items-center justify-center min-h-0">
        {/* Prev */}
        <button
          className="absolute left-3 z-10 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-3 transition-colors"
          onClick={prev}
          aria-label={t('propertyDetail.previous')}
        >
          <ChevronLeft className="w-7 h-7" />
        </button>

        {/* Image */}
        <div className="relative w-full h-full max-w-6xl mx-16">
          <Image
            key={current}
            src={images[current]}
            alt={`Photo ${current + 1}`}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>

        {/* Next */}
        <button
          className="absolute right-3 z-10 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-3 transition-colors"
          onClick={next}
          aria-label={t('propertyDetail.next')}
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      </div>

      {/* Thumbnail strip */}
      <div className="bg-black/80 backdrop-blur-sm px-4 py-3 overflow-x-auto">
        <div className="flex gap-2 justify-center">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`relative w-16 h-12 rounded-md overflow-hidden flex-shrink-0 border-2 transition-all ${
                i === current
                  ? 'border-white opacity-100'
                  : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  property: PropertyRow
  relatedProperties?: PropertyRow[]
  agent?: AgentRow | null
  propertyFeatures?: FeatureRow[]
  titleEn: string
  titleEs: string
  subtitleEn: string
  subtitleEs: string
  descriptionEn: string
  descriptionEs: string
  featuresEn?: string[]
  featuresEs?: string[]
  lang?: 'en' | 'es'
  priceSale?: number | null
  priceRent?: number | null
  currency?: string
}

export default function PropertyDetailClient({ property, relatedProperties = [], agent, propertyFeatures = [], titleEn, titleEs, subtitleEn, subtitleEs, descriptionEn, descriptionEs, featuresEn, featuresEs, priceSale, priceRent, currency = 'USD' }: Props) {
  const pathname = usePathname()
  const lang: 'es' | 'en' = pathname.startsWith('/es') ? 'es' : 'en'
  const { t } = useI18n()
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

  const title       = lang === 'en' ? titleEn       : titleEs
  const subtitle    = lang === 'en' ? subtitleEn    : subtitleEs
  const description = lang === 'en' ? descriptionEn : descriptionEs

  const whatsappText  = encodeURIComponent(t('propertyDetail.whatsAppMessage', { ref: p.reference_id ?? p.title ?? '' }))
  const whatsappHref  = `https://wa.me/50686540888?text=${whatsappText}`

  // Status badge logic
  function getStatusBadge() {
    if (p.price_sale && p.price_rent_monthly) {
      return { label: t('property.status.both'), className: 'bg-amber-500 text-white text-xs font-medium tracking-wide uppercase px-2.5 py-1 rounded font-sans' }
    }
    if (p.price_sale) {
      return { label: t('property.status.for_sale'), className: 'bg-green-600 text-white text-xs font-medium tracking-wide uppercase px-2.5 py-1 rounded font-sans' }
    }
    if (p.price_rent_monthly) {
      return { label: t('property.status.for_rent'), className: 'bg-blue-600 text-white text-xs font-medium tracking-wide uppercase px-2.5 py-1 rounded font-sans' }
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

  // Build data for PropertyDetails component
  const { highlights, shared, exclusive } = buildPropertyDetailsData(
    propertyFeatures,
    p.features_en,   // raw canonical — null if not yet AI-assigned
    p.features_es,
    p.amenities_en,
    p.amenities_es,
    p.amenities,     // legacy
    p.features,
    featuresEn,      // has legacy fallback baked in
    featuresEs,
    lang,
  )

  return (
    <>
      <main className="min-h-screen bg-background pb-24 md:pb-0">

        {/* Back nav */}
        <div className="bg-card border-b border-border">
          <div className="container-wide py-4">
            <Link
              href={`/${lang}/properties`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-sans"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('propertyDetail.backToProperties')}
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
                <span className="text-xs font-medium px-2.5 py-1 rounded bg-muted text-muted-foreground font-sans">
                  {({
                    luxury:       { en: 'Luxury',       es: 'Lujo' },
                    ultra_luxury: { en: 'Ultra Luxury', es: 'Ultra Lujo' },
                    high_end:     { en: 'High End',     es: 'Alta Gama' },
                    mid_range:    { en: 'Mid Range',    es: 'Precio Medio' },
                    high:         { en: 'High End',     es: 'Alta Gama' },
                    mid:          { en: 'Mid Range',    es: 'Precio Medio' },
                  } as Record<string, { en: string; es: string }>)[p.tier]?.[lang] ?? formatLabel(p.tier)}
                </span>
              )}
              <span className="text-xs font-medium px-2.5 py-1 rounded border border-border text-muted-foreground font-sans">
                {({
                  house:      { en: 'House',      es: 'Casa' },
                  apartment:  { en: 'Apartment',  es: 'Apartamento' },
                  condo:      { en: 'Condo',      es: 'Condominio' },
                  land:       { en: 'Land',       es: 'Terreno' },
                  commercial: { en: 'Commercial', es: 'Comercial' },
                  office:     { en: 'Office',     es: 'Oficina' },
                  farm:       { en: 'Farm',       es: 'Finca' },
                  penthouse:  { en: 'Penthouse',  es: 'Penthouse' },
                  townhouse:  { en: 'Townhouse',  es: 'Townhouse' },
                } as Record<string, { en: string; es: string }>)[p.property_type]?.[lang] ?? p.property_type}
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
            {subtitle && (
              <p className="mt-1 mb-3 font-light italic text-[15px] font-sans" style={{ color: '#6B6B6B' }}>
                {subtitle}
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
                  <span className="text-sm font-sans text-muted-foreground font-normal ml-1">{lang === 'en' ? '/month' : '/mes'}</span>
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

        {/* ── PHOTO GALLERY — Airbnb-style ─────────────────────────────── */}
        <section className="bg-muted">
          <div className="container-wide py-6">
            {allImages.length > 0 ? (
              <div className="relative">
                {/* Hero row: 1 large + up to 4 small (Airbnb layout) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-xl overflow-hidden">
                  {/* Large hero — spans 2 cols + 2 rows on desktop */}
                  <div
                    className="md:col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto relative group cursor-pointer"
                    style={{ minHeight: '320px' }}
                    onClick={() => openLightbox(0)}
                  >
                    <Image
                      src={allImages[0]}
                      alt={title}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>
                  {/* 4 smaller images filling the right half */}
                  {allImages.slice(1, 5).map((img, i) => (
                    <div
                      key={i}
                      className="hidden md:block aspect-[4/3] relative group cursor-pointer"
                      onClick={() => openLightbox(i + 1)}
                    >
                      <Image
                        src={img}
                        alt={`Photo ${i + 2}`}
                        fill
                        sizes="25vw"
                        className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>

                {/* Remaining images — scrollable grid below hero */}
                {allImages.length > 5 && (
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {allImages.slice(5).map((img, i) => (
                      <div
                        key={i}
                        className="aspect-[4/3] relative rounded-lg overflow-hidden group cursor-pointer"
                        onClick={() => openLightbox(i + 5)}
                      >
                        <Image
                          src={img}
                          alt={`Photo ${i + 6}`}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                          className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* "View all photos" overlay button on hero */}
                {allImages.length > 5 && (
                  <button
                    className="absolute bottom-4 right-4 bg-white/95 text-foreground text-sm font-sans font-medium
                               px-4 py-2.5 rounded-lg shadow-md hover:bg-white hover:shadow-lg transition-all
                               flex items-center gap-2 border border-border/50"
                    onClick={() => openLightbox(0)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    {t('propertyDetail.viewAllPhotosCount', { count: allImages.length })}
                  </button>
                )}

                {/* Mobile: show count overlay when only hero is visible */}
                {allImages.length > 1 && (
                  <button
                    className="md:hidden absolute bottom-4 right-4 bg-white/95 text-foreground text-sm font-sans font-medium
                               px-4 py-2.5 rounded-lg shadow-md hover:bg-white transition-all border border-border/50"
                    onClick={() => openLightbox(0)}
                  >
                    {t('propertyDetail.viewAllPhotosCount', { count: allImages.length })}
                  </button>
                )}
              </div>
            ) : (
              <div className="aspect-[16/9] rounded-xl bg-border flex items-center justify-center text-muted-foreground font-sans text-sm">
                {t('propertyDetail.noImages')}
              </div>
            )}

            {/* YouTube embed */}
            {p.youtube_enabled === true && p.youtube_url && (() => {
              const embedUrl = getYouTubeEmbedUrl(p.youtube_url)
              if (!embedUrl) return null
              return (
                <div className="mt-6 aspect-video rounded-xl overflow-hidden">
                  <iframe
                    src={embedUrl}
                    title={t('propertyDetail.videoTitle')}
                    width="100%"
                    height="100%"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )
            })()}
          </div>
        </section>

        {/* ── BODY GRID ─────────────────────────────────────────────────── */}
        <div className="container-wide py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── MAIN COLUMN ─────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-10">

              {/* Spec bar */}
              <SpecBar property={p} lang={lang} />

              {/* Description */}
              {description && (
                <section>
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                    {t('propertyDetail.description')}
                  </h2>
                  <div className="font-sans text-sm text-foreground leading-relaxed">
                    <p style={{ whiteSpace: 'pre-wrap' }}>{displayedDesc}</p>
                    {isLong && (
                      <button
                        className="mt-2 text-sm font-medium font-sans hover:opacity-80 transition-opacity"
                        style={{ color: '#C9A96E' }}
                        onClick={() => setDescExpanded((v) => !v)}
                      >
                        {descExpanded ? t('propertyDetail.readLess') : t('propertyDetail.readMore')}
                      </button>
                    )}
                  </div>
                </section>
              )}

              {/* Features & Amenities — premium PropertyDetails component */}
              {(highlights.length > 0 || shared.length > 0 || exclusive.length > 0) && (
                <section>
                  <PropertyDetails
                    residenceHighlights={highlights}
                    sharedAmenities={shared}
                    exclusiveAmenities={exclusive}
                    lang={lang}
                  />
                </section>
              )}

              {/* Plusvalía / Investment Perspective */}
              {p.plusvalia_notes && (
                <section
                  className="pl-6 py-6 pr-6 rounded-r-lg"
                  style={{ borderLeft: '3px solid #C9A96E', backgroundColor: '#F5F2EE' }}
                >
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                    {t('propertyDetail.investmentPerspective')}
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
                  {t('propertyDetail.askAboutProperty')}
                </Link>
              </section>

              {/* Google Maps */}
              <section>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                  {t('propertyDetail.location')}
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
                    {t('propertyDetail.similarProperties')}
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
                      {t('propertyDetail.reference')}
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
                  {t('propertyDetail.callNow')}
                </a>

                {/* Email inquiry */}
                <button
                  onClick={() => setInquiryOpen(true)}
                  className="flex items-center gap-3 w-full py-3 px-4 rounded-lg border border-border font-sans text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" style={{ color: '#C9A96E' }} />
                  {t('propertyDetail.requestInfo')}
                </button>

                {/* Agent card */}
                <div className="border-t border-border pt-4">
                  <p className="text-xs font-sans text-muted-foreground uppercase tracking-wide mb-2">
                    {t('propertyDetail.agent')}
                  </p>
                  {agent ? (
                    <div className="flex items-center gap-3">
                      {agent.photo_url ? (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                          <Image src={agent.photo_url} alt={agent.full_name} fill className="object-cover" unoptimized />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-serif font-semibold text-muted-foreground">
                            {agent.full_name[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-sans text-sm font-medium text-foreground">{agent.full_name}</p>
                        <p className="font-sans text-xs text-muted-foreground capitalize">{agent.role}</p>
                        {agent.phone && (
                          <a href={`tel:${agent.phone}`} className="font-sans text-xs text-muted-foreground hover:text-foreground">
                            {agent.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-serif font-semibold text-muted-foreground">D</span>
                      </div>
                      <div>
                        <p className="font-sans text-sm font-medium text-foreground">DR Housing</p>
                        <p className="font-sans text-xs text-muted-foreground">{t('propertyDetail.agent')}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Listed date */}
                <div className="border-t border-border pt-4">
                  <p className="text-xs font-sans text-muted-foreground uppercase tracking-wide mb-1">
                    {t('propertyDetail.listed')}
                  </p>
                  <p className="font-sans text-sm text-foreground">{formatDate(p.created_at, lang)}</p>
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
                  {t('propertyDetail.consultWhatsApp')}
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

function SpecBar({ property: p, lang = 'es' }: { property: PropertyRow; lang: 'es' | 'en' }) {
  type SpecItem = { icon: React.ReactNode; value: React.ReactNode; label: string }

  const specs: SpecItem[] = []

  if (p.bedrooms > 0) {
    specs.push({
      icon: <BedDouble className="w-5 h-5" />,
      value: p.bedrooms,
      label: lang === 'en' ? 'Bedrooms' : 'Habitaciones',
    })
  }
  if (p.bathrooms > 0) {
    specs.push({
      icon: <Bath className="w-5 h-5" />,
      value: p.bathrooms,
      label: lang === 'en' ? 'Bathrooms' : 'Baños',
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
      label: lang === 'en' ? 'Built' : 'Construcción',
    })
  }
  if (p.land_size_sqm && p.land_size_sqm > 0) {
    specs.push({
      icon: <TreePine className="w-5 h-5" />,
      value: `${p.land_size_sqm} m²`,
      label: lang === 'en' ? 'Land' : 'Terreno',
    })
  }
  if (p.levels && p.levels > 0) {
    specs.push({
      icon: <Layers className="w-5 h-5" />,
      value: p.levels === 1 ? (
        <span style={{ color: '#C9A96E' }}>{lang === 'en' ? 'Single Level' : 'Un Nivel'}</span>
      ) : p.levels,
      label: lang === 'en' ? 'Levels' : 'Niveles',
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
