'use client'

import { Heart, Bed, Bath, Maximize } from 'lucide-react'
import { formatPrice, getHeroImage } from '@/lib/supabase/queries'
import type { PropertyRow } from '@/src/integrations/supabase/types'

// ── Carousel card ─────────────────────────────────────────────────────────────
// 280 × ~380px fixed card; snap-start so carousel snaps to card edges.
// Clicking the card fires onSelect — detail expands below the carousel.
// Heart button stops propagation so it doesn't accidentally open the detail.

interface CarouselCardProps {
  property: PropertyRow
  isSelected: boolean
  hearted: boolean
  onSelect: () => void
  onHeart: () => void
  onWhatsApp: () => void
  language: string
}

export default function CarouselCard({
  property,
  isSelected,
  hearted,
  onSelect,
  onHeart,
  language,
}: CarouselCardProps) {
  const lang  = language === 'es' ? 'es' : 'en'
  const image = getHeroImage(property)
  const title = lang === 'en' && property.title_en
    ? property.title_en
    : (property.title_es ?? property.title ?? '')
  const price = property.price_sale
    ? formatPrice(property.price_sale, property.currency ?? 'USD')
    : property.price_rent_monthly
    ? `${formatPrice(property.price_rent_monthly, property.currency ?? 'USD')}/mo`
    : null
  const refId = property.reference_id ?? property.id.slice(0, 8).toUpperCase()

  return (
    <div
      onClick={onSelect}
      className={[
        'flex-none w-[280px] rounded-xl overflow-hidden bg-white shadow-md',
        'snap-start cursor-pointer transition-all duration-200 select-none',
        isSelected
          ? 'ring-2 ring-[#C9A96E] shadow-xl scale-[1.02]'
          : 'hover:shadow-lg hover:scale-[1.01]',
      ].join(' ')}
    >
      {/* Image + overlays */}
      <div className="relative h-[180px] bg-[#E8E3DC] overflow-hidden">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={title}
            className={[
              'w-full h-full object-cover transition-transform duration-500',
              isSelected ? 'scale-[1.04]' : '',
            ].join(' ')}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[#A0A0A0] text-sm">
              {lang === 'es' ? 'Sin imagen' : 'No image'}
            </span>
          </div>
        )}

        {/* Reference ID badge */}
        <div className="absolute top-2.5 left-2.5 bg-black/60 text-white
                        text-[10px] font-mono px-2 py-0.5 rounded">
          #{refId}
        </div>

        {/* Heart button */}
        <button
          onClick={e => { e.stopPropagation(); onHeart() }}
          aria-label={hearted
            ? (lang === 'es' ? 'Quitar de favoritos' : 'Remove from shortlist')
            : (lang === 'es' ? 'Agregar a favoritos' : 'Add to shortlist')}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full
                     bg-white/80 backdrop-blur-sm flex items-center justify-center
                     shadow-sm transition-transform hover:scale-110 active:scale-95"
        >
          <Heart
            className="w-4 h-4"
            fill={hearted ? '#C9A96E' : 'none'}
            stroke={hearted ? '#C9A96E' : '#6B6B6B'}
          />
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-serif text-[15px] font-semibold text-[#1A1A1A]
                      leading-tight line-clamp-2 mb-2">
          {title}
        </p>
        {price && (
          <p className="text-[#C9A96E] font-semibold text-[15px] mb-2">{price}</p>
        )}
        <div className="flex items-center gap-3 text-[#6B6B6B] text-xs">
          {(property.bedrooms ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5" />
              {property.bedrooms}
            </span>
          )}
          {(property.bathrooms ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5" />
              {property.bathrooms}
            </span>
          )}
          {(property.construction_size_sqm ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <Maximize className="w-3.5 h-3.5" />
              {property.construction_size_sqm} m²
            </span>
          )}
        </div>
        {property.location_name && (
          <p className="text-[10px] text-[#9B9B9B] mt-1.5 truncate">
            {property.location_name}
          </p>
        )}
      </div>

      {/* Selected gold bar at bottom */}
      {isSelected && <div className="h-1 bg-[#C9A96E] w-full" />}
    </div>
  )
}
