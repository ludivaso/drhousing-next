'use client'

import { useState, useMemo } from 'react'
import {
  Bed, Bath, Maximize, Ruler, Calendar,
  MessageCircle, ArrowLeft, ChevronDown, ChevronUp,
} from 'lucide-react'
import { formatPrice } from '@/lib/supabase/queries'
import type { PropertyRow } from '@/src/integrations/supabase/types'

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
        <div className="relative w-full bg-[#F5F2EE]" style={{ height: 'clamp(240px, 50vh, 480px)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mainImage}
            alt={title}
            className="w-full h-full object-cover"
          />
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
          className="flex gap-2 px-6 py-3 overflow-x-auto bg-[#FAFAF8]
                     border-b border-[#E8E3DC]"
          style={{ scrollbarWidth: 'none' } as React.CSSProperties}
        >
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setMainImageIndex(i)}
              className={[
                'flex-none w-16 h-12 rounded-md overflow-hidden transition-all',
                i === mainImageIndex
                  ? 'ring-2 ring-[#C9A96E] opacity-100'
                  : 'opacity-60 hover:opacity-90',
              ].join(' ')}
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
