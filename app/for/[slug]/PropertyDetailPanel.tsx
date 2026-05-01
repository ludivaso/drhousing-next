'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import {
  Bed, Bath, Maximize, Ruler, Calendar,
  MessageCircle, ArrowLeft, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { formatPrice } from '@/lib/supabase/queries'
import type { PropertyRow } from '@/src/integrations/supabase/types'
import ImageLightbox from './ImageLightbox'

interface PropertyDetailPanelProps {
  property: PropertyRow
  note: string | null
  language: string
  clientName: string | null
  onWhatsApp: () => void
  onClose: () => void
}

export default function PropertyDetailPanel({
  property,
  note,
  language,
  onWhatsApp,
  onClose,
}: PropertyDetailPanelProps) {
  const lang = language === 'es' ? 'es' : 'en'

  // ── Image gallery ─────────────────────────────────────────────────────────
  const allImages = useMemo(() => {
    const combined = [
      ...(property.featured_images ?? []),
      ...(property.images ?? []),
    ]
    // Deduplicate while preserving order
    return combined.filter((img, i, arr) => arr.indexOf(img) === i).slice(0, 20)
  }, [property.featured_images, property.images])

  const [mainImageIndex, setMainImageIndex] = useState(0)
  const mainImage = allImages[mainImageIndex] ?? null

  // Reset gallery to first image whenever the displayed property changes
  useEffect(() => { setMainImageIndex(0) }, [property.id])

  // ── Lightbox ──────────────────────────────────────────────────────────────
  const [lightboxOpen, setLightboxOpen] = useState(false)

  // ── Touch swipe for gallery ────────────────────────────────────────────────
  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const deltaX = touchStartX.current - e.changedTouches[0].clientX
    const deltaY = touchStartY.current - e.changedTouches[0].clientY
    // Only act on dominant horizontal swipes with minimum 50px distance
    if (Math.abs(deltaX) < Math.abs(deltaY)) return
    if (Math.abs(deltaX) < 50) return
    if (deltaX > 0) {
      setMainImageIndex(i => Math.min(i + 1, allImages.length - 1))
    } else {
      setMainImageIndex(i => Math.max(i - 1, 0))
    }
  }

  // ── Keyboard navigation (arrow keys when lightbox is closed) ──────────────
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (lightboxOpen) return // lightbox owns keys when open
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setMainImageIndex(i => Math.max(0, i - 1))
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        setMainImageIndex(i => Math.min(allImages.length - 1, i + 1))
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [allImages.length, lightboxOpen])

  // ── Description expand/collapse ───────────────────────────────────────────
  const description =
    (lang === 'en' ? (property.description_en ?? property.description) : (property.description ?? property.description_en)) ??
    (property.ai_generated_description_en ?? property.ai_generated_description_es) ??
    null
  const DESCRIPTION_LIMIT = 300
  const [descExpanded, setDescExpanded] = useState(false)
  const descTruncated = description && description.length > DESCRIPTION_LIMIT && !descExpanded

  // ── Features & amenities ──────────────────────────────────────────────────
  const features = (lang === 'en'
    ? (property.features_en ?? property.features)
    : (property.features ?? property.features_en)
  ) ?? []

  const amenities = (lang === 'en'
    ? (property.amenities_en ?? property.amenities)
    : (property.amenities ?? property.amenities_en)
  ) ?? []

  // ── Price ─────────────────────────────────────────────────────────────────
  const isRent  = !!property.price_rent_monthly && !property.price_sale
  const price   = property.price_sale ?? property.price_rent_monthly
  const title   = (lang === 'en' ? (property.title_en ?? property.title) : (property.title_es ?? property.title)) ?? ''
  const refId   = property.reference_id ?? property.id.slice(0, 8).toUpperCase()

  return (
    <div className="w-full bg-white">

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      {lightboxOpen && (
        <ImageLightbox
          images={allImages}
          initialIndex={mainImageIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* ── Back button ───────────────────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-1">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 text-[#6B6B6B] text-sm
                     hover:text-[#C9A96E] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          {lang === 'es' ? 'Volver a la lista' : 'Back to list'}
        </button>
      </div>

      {/* ── Main image ────────────────────────────────────────────────────── */}
      {mainImage ? (
        <div
          className="relative w-full overflow-hidden rounded-none cursor-zoom-in group"
          style={{ aspectRatio: '16/9' }}
          onClick={() => setLightboxOpen(true)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mainImage}
            alt={title}
            className="w-full h-full object-cover object-center"
            style={{ display: 'block' }}
          />

          {/* Zoom hint */}
          <div className="absolute bottom-2 right-2 bg-black/50 rounded-full px-2 py-1
                          text-white text-[10px] flex items-center gap-1 pointer-events-none">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
            {lang === 'es' ? 'Ver fotos' : 'View photos'}
          </div>

          {/* Previous arrow — always visible on mobile, hover-only on desktop */}
          {mainImageIndex > 0 && (
            <button
              onClick={e => { e.stopPropagation(); setMainImageIndex(i => i - 1) }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10
                         w-10 h-10 rounded-full
                         bg-black/40 hover:bg-black/60
                         backdrop-blur-sm
                         flex items-center justify-center
                         text-white
                         transition-all duration-200
                         opacity-100 md:opacity-0 md:group-hover:opacity-100"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Next arrow — always visible on mobile, hover-only on desktop */}
          {mainImageIndex < allImages.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); setMainImageIndex(i => i + 1) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10
                         w-10 h-10 rounded-full
                         bg-black/40 hover:bg-black/60
                         backdrop-blur-sm
                         flex items-center justify-center
                         text-white
                         transition-all duration-200
                         opacity-100 md:opacity-0 md:group-hover:opacity-100"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      ) : (
        <div className="w-full h-48 bg-[#F5F2EE] flex items-center justify-center">
          <span className="text-[#A0A0A0] text-sm">
            {lang === 'es' ? 'Sin imagen' : 'No image'}
          </span>
        </div>
      )}

      {/* ── Thumbnail strip ───────────────────────────────────────────────── */}
      {allImages.length > 1 && (
        <div
          className="flex gap-2 px-6 mt-2 pb-1 overflow-x-auto bg-[#FAFAF8] border-b border-[#E8E3DC] py-3"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
        >
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setMainImageIndex(i)}
              className={[
                'flex-none rounded overflow-hidden transition-all duration-150',
                i === mainImageIndex
                  ? 'ring-2 ring-[#C9A96E] opacity-100'
                  : 'opacity-50 hover:opacity-80',
              ].join(' ')}
              style={{ width: '64px', aspectRatio: '4/3' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="px-6 py-6 max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <div className="flex items-start justify-between gap-4 flex-wrap mb-1">
            <span className="text-[10px] font-mono text-[#9B9B9B] tracking-widest">
              #{refId}
            </span>
            {property.location_name && (
              <span className="text-xs text-[#6B6B6B] uppercase tracking-wide">
                {property.location_name}
              </span>
            )}
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-[#1A1A1A]
                         leading-tight mb-2">
            {title}
          </h2>
          {price && (
            <p className="text-[#C9A96E] text-xl font-semibold">
              {formatPrice(price, property.currency ?? 'USD')}
              {isRent && (
                <span className="text-sm font-normal text-[#9B9B9B] ml-1">
                  {lang === 'es' ? '/mes' : '/mo'}
                </span>
              )}
            </p>
          )}
        </div>

        {/* Spec bar */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 py-4
                        border-t border-b border-[#E8E3DC]">
          {(property.bedrooms ?? 0) > 0 && (
            <span className="flex items-center gap-2 text-[#3A3A3A] text-sm">
              <Bed className="w-4 h-4 text-[#C9A96E] flex-shrink-0" />
              {property.bedrooms}{' '}
              {lang === 'es' ? 'hab.' : 'bed.'}
            </span>
          )}
          {(property.bathrooms ?? 0) > 0 && (
            <span className="flex items-center gap-2 text-[#3A3A3A] text-sm">
              <Bath className="w-4 h-4 text-[#C9A96E] flex-shrink-0" />
              {property.bathrooms}{' '}
              {lang === 'es' ? 'baños' : 'bath.'}
            </span>
          )}
          {(property.construction_size_sqm ?? 0) > 0 && (
            <span className="flex items-center gap-2 text-[#3A3A3A] text-sm">
              <Maximize className="w-4 h-4 text-[#C9A96E] flex-shrink-0" />
              {property.construction_size_sqm} m²{' '}
              {lang === 'es' ? 'construidos' : 'built'}
            </span>
          )}
          {(property.land_size_sqm ?? 0) > 0 && (
            <span className="flex items-center gap-2 text-[#3A3A3A] text-sm">
              <Ruler className="w-4 h-4 text-[#C9A96E] flex-shrink-0" />
              {property.land_size_sqm} m²{' '}
              {lang === 'es' ? 'terreno' : 'land'}
            </span>
          )}
          {property.year_built && (
            <span className="flex items-center gap-2 text-[#3A3A3A] text-sm">
              <Calendar className="w-4 h-4 text-[#C9A96E] flex-shrink-0" />
              {property.year_built}
            </span>
          )}
        </div>

        {/* Diego's personal note */}
        {note && (
          <div className="border-t-2 border-[#C9A96E] pt-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9A96E] font-medium mb-2">
              {lang === 'es' ? 'Nota de Diego' : "Diego's Note"}
            </p>
            <p className="font-serif italic text-[16px] leading-relaxed text-[#3A3A3A]">
              {note}
            </p>
          </div>
        )}

        {/* Description */}
        {description && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#9B9B9B] font-medium mb-2">
              {lang === 'es' ? 'Descripción' : 'Description'}
            </p>
            <p className="text-[#3A3A3A] text-sm leading-relaxed">
              {descTruncated ? description.slice(0, DESCRIPTION_LIMIT) + '…' : description}
            </p>
            {description.length > DESCRIPTION_LIMIT && (
              <button
                onClick={() => setDescExpanded(v => !v)}
                className="mt-2 inline-flex items-center gap-1 text-xs text-[#C9A96E]
                           hover:text-[#B89656] transition-colors"
              >
                {descExpanded
                  ? (lang === 'es' ? 'Ver menos' : 'Show less')
                  : (lang === 'es' ? 'Ver más' : 'Show more')}
                {descExpanded
                  ? <ChevronUp className="w-3.5 h-3.5" />
                  : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        )}

        {/* Features */}
        {features.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#9B9B9B] font-medium mb-3">
              {lang === 'es' ? 'Características' : 'Features'}
            </p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#3A3A3A]">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-[#C9A96E] flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Amenities */}
        {amenities.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#9B9B9B] font-medium mb-3">
              {lang === 'es' ? 'Amenidades' : 'Amenities'}
            </p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {amenities.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#3A3A3A]">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-[#C9A96E] flex-shrink-0" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* WhatsApp CTA */}
        <div className="pt-2 pb-8">
          <button
            onClick={onWhatsApp}
            className="w-full flex items-center justify-center gap-3 py-4 px-6
                       bg-[#25D366] hover:bg-[#1EB854] text-white rounded-xl
                       font-medium text-base transition-colors shadow-sm"
          >
            <MessageCircle className="w-5 h-5 flex-shrink-0" />
            {lang === 'es'
              ? 'Pregunta a Diego sobre esta propiedad'
              : 'Ask Diego about this property'}
          </button>
        </div>

      </div>
    </div>
  )
}
