'use client'

import { forwardRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, GripVertical, Bed, Bath, Maximize, MessageCircle } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { formatPrice, getHeroImage } from '@/lib/supabase/queries'
import type { PropertyRow, CuratedListRow } from '@/src/integrations/supabase/types'

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, { es: string; en: string; cls: string }> = {
  for_sale:       { es: 'En Venta',    en: 'For Sale',       cls: 'bg-[#C9A96E]/20 text-[#1A1A1A] border border-[#C9A96E]/40' },
  for_rent:       { es: 'En Alquiler', en: 'For Rent',       cls: 'bg-primary/10 text-primary border border-primary/20' },
  presale:        { es: 'Preventa',    en: 'Pre-Sale',       cls: 'bg-amber-100 text-amber-800 border border-amber-200' },
  under_contract: { es: 'En Proceso',  en: 'Under Contract', cls: 'bg-blue-100 text-blue-800 border border-blue-200' },
  sold:           { es: 'Vendido',     en: 'Sold',           cls: 'bg-gray-100 text-gray-600 border border-gray-200' },
  rented:         { es: 'Alquilado',   en: 'Rented',         cls: 'bg-gray-100 text-gray-600 border border-gray-200' },
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface PropertyCardProps {
  property: PropertyRow
  list: CuratedListRow
  note?: string
  hearted: boolean
  onToggleHeart: (propertyId: string) => void
  onWhatsApp: (property: PropertyRow) => void
  onPropertyClick: (propertyId: string) => void
  /** id must be passed when used inside SortableContext */
  id: string
}

// ── Sortable wrapper ──────────────────────────────────────────────────────────
// Uses @dnd-kit/sortable. On desktop, only the GripVertical handle triggers drag.
// On mobile, the PointerSensor/TouchSensor activation constraint handles it.
export default function PropertyCard({
  property,
  list,
  note,
  hearted,
  onToggleHeart,
  onWhatsApp,
  onPropertyClick,
  id,
}: PropertyCardProps) {
  const lang = list.language === 'es' ? 'es' : 'en'

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex:  isDragging ? 50 : undefined,
  }

  const image  = getHeroImage(property)
  const title  = lang === 'en' && property.title_en ? property.title_en : (property.title_es ?? property.title)
  const price  = property.price_sale ?? property.price_rent_monthly
  const status = STATUS_LABELS[property.status] ?? { es: property.status, en: property.status, cls: 'bg-muted text-muted-foreground' }
  const isRent = property.status === 'for_rent'

  // Property link uses reference_id first, slug fallback per project convention
  const propHref = `/${lang}/property/${property.reference_id ?? property.slug}`

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative bg-white rounded-xl border border-[#E8E3DC] overflow-hidden
                 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* ── Drag handle (desktop only — shown on hover) ────────────────────── */}
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={lang === 'es' ? 'Arrastrar para reordenar' : 'Drag to reorder'}
        className="absolute top-3 left-3 z-20 p-1.5 rounded-md
                   bg-white/80 backdrop-blur-sm text-[#6B6B6B]
                   opacity-0 group-hover:opacity-100 transition-opacity
                   cursor-grab active:cursor-grabbing
                   touch-none select-none"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* ── Heart button ──────────────────────────────────────────────────── */}
      <button
        onClick={(e) => { e.preventDefault(); onToggleHeart(property.id) }}
        aria-label={hearted
          ? (lang === 'es' ? 'Quitar de favoritos' : 'Remove from shortlist')
          : (lang === 'es' ? 'Agregar a favoritos' : 'Add to shortlist')}
        className="absolute top-3 right-3 z-20 p-1.5 rounded-full
                   bg-white/80 backdrop-blur-sm transition-all
                   hover:scale-110 active:scale-95"
      >
        <Heart
          className="w-5 h-5 transition-colors"
          style={hearted
            ? { fill: '#C9A96E', stroke: '#C9A96E' }
            : { fill: 'transparent', stroke: '#6B6B6B' }}
        />
      </button>

      {/* ── Property image ────────────────────────────────────────────────── */}
      <Link
        href={propHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onPropertyClick(property.id)}
        className="block"
        tabIndex={-1}
      >
        <div className="relative h-52 bg-[#F5F2EE] overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[#A0A0A0] text-sm">
                {lang === 'es' ? 'Sin imagen' : 'No image'}
              </span>
            </div>
          )}
          {/* Status badge */}
          <div className="absolute top-3 left-10">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.cls}`}>
              {lang === 'en' ? status.en : status.es}
            </span>
          </div>
          {/* Price */}
          {price && (
            <div className="absolute bottom-3 right-3 bg-[#1A1A1A]/80 text-white
                            px-3 py-1.5 rounded text-sm font-semibold backdrop-blur-sm">
              {formatPrice(price, property.currency ?? 'USD')}
              {isRent && (
                <span className="text-xs font-normal opacity-80">
                  {lang === 'en' ? '/mo' : '/mes'}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* ── Card content ──────────────────────────────────────────────────── */}
      <div className="p-5">

        {/* Task 2 — Personal note from Diego (hidden when absent) */}
        {note && (
          <div className="mb-4 border-t border-[#C9A96E] pt-3">
            <div className="text-[10px] uppercase tracking-widest text-[#C9A96E] mb-1 font-medium">
              {lang === 'es' ? 'Nota de Diego' : "Diego's Note"}
            </div>
            <p className="font-serif italic text-[15px] leading-relaxed text-[#3A3A3A]">
              {note}
            </p>
          </div>
        )}

        {/* Location + Title */}
        <p className="text-xs text-[#6B6B6B] uppercase tracking-wide mb-1">
          {property.location_name}
        </p>
        <Link
          href={propHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onPropertyClick(property.id)}
        >
          <h3 className="font-serif text-[17px] font-semibold text-[#1A1A1A]
                         hover:text-[#C9A96E] transition-colors line-clamp-2 mb-3">
            {title}
          </h3>
        </Link>

        {/* Specs strip */}
        <div className="flex items-center gap-4 text-sm text-[#6B6B6B] mb-4">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 flex-shrink-0" />
              {property.bedrooms}
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 flex-shrink-0" />
              {property.bathrooms}
            </span>
          )}
          {property.construction_size_sqm && (
            <span className="flex items-center gap-1.5">
              <Maximize className="w-4 h-4 flex-shrink-0" />
              {property.construction_size_sqm} m²
            </span>
          )}
        </div>

        {/* Task 8 — Per-property WhatsApp button */}
        <button
          onClick={() => onWhatsApp(property)}
          className="group/wa inline-flex items-center gap-2 px-3 py-1.5
                     bg-[#25D366] hover:bg-[#1EB854] text-white text-xs
                     font-medium rounded-full transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            {lang === 'es' ? 'Pregunta sobre esta' : 'Ask about this one'}
          </span>
        </button>
      </div>
    </div>
  )
}

// forwardRef export used by drag overlay (renders a non-sortable clone)
export const PropertyCardPlain = forwardRef<
  HTMLDivElement,
  { property: PropertyRow; lang: 'en' | 'es' }
>(function PropertyCardPlain({ property, lang }, ref) {
  const image = getHeroImage(property)
  const title = lang === 'en' && property.title_en ? property.title_en : (property.title_es ?? property.title)

  return (
    <div
      ref={ref}
      className="bg-white rounded-xl border border-[#C9A96E] shadow-xl overflow-hidden rotate-1"
    >
      <div className="relative h-40 bg-[#F5F2EE]">
        {image && (
          <Image src={image} alt={title} fill className="object-cover" unoptimized />
        )}
      </div>
      <div className="px-4 py-3">
        <p className="font-serif text-sm font-semibold line-clamp-1">{title}</p>
      </div>
    </div>
  )
})
