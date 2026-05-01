'use client'

import Image from 'next/image'
import { Bed, Bath, Maximize } from 'lucide-react'
import { formatPrice, getHeroImage } from '@/lib/supabase/queries'
import type { PropertyRow } from '@/src/integrations/supabase/types'

const STATUS_LABELS: Record<string, { es: string; en: string; cls: string }> = {
  for_sale:       { es: 'En Venta',    en: 'For Sale',       cls: 'bg-amber-100 text-amber-800 border border-amber-200' },
  for_rent:       { es: 'En Alquiler', en: 'For Rent',       cls: 'bg-blue-100 text-blue-800 border border-blue-200' },
  presale:        { es: 'Preventa',    en: 'Pre-Sale',       cls: 'bg-amber-100 text-amber-800 border border-amber-200' },
  under_contract: { es: 'En Proceso',  en: 'Under Contract', cls: 'bg-blue-100 text-blue-800 border border-blue-200' },
  sold:           { es: 'Vendido',     en: 'Sold',           cls: 'bg-gray-100 text-gray-600 border border-gray-200' },
  rented:         { es: 'Alquilado',   en: 'Rented',         cls: 'bg-gray-100 text-gray-600 border border-gray-200' },
}

interface Props {
  property: PropertyRow
  lang: string
  isSelected: boolean
  index: number
  onClick: () => void
}

export default function PropertyCard({ property, lang, isSelected, index, onClick }: Props) {
  const image = getHeroImage(property)
  const displayTitle = lang === 'en'
    ? (property.title_en ?? property.title_es ?? property.title)
    : (property.title_es ?? property.title_en ?? property.title)

  const isRent = property.status === 'for_rent'
  const price = property.price_sale ?? property.price_rent_monthly
  const status = STATUS_LABELS[property.status] ?? {
    es: property.status,
    en: property.status,
    cls: 'bg-gray-100 text-gray-600 border border-gray-200',
  }

  return (
    <button
      onClick={onClick}
      className={`
        group flex-none lg:flex-none w-56 lg:w-full text-left rounded-xl overflow-hidden
        border-2 transition-all duration-200
        ${isSelected
          ? 'border-[#C9A96E] shadow-lg'
          : 'border-border hover:border-[#C9A96E]/50 hover:shadow-md'}
        bg-card
      `}
    >
      {/* Image */}
      <div className="relative h-32 lg:h-36 overflow-hidden bg-secondary">
        {image ? (
          <Image
            src={image}
            alt={displayTitle}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-muted-foreground text-xs">
              {lang === 'es' ? 'Sin imagen' : 'No image'}
            </span>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.cls}`}>
            {lang === 'en' ? status.en : status.es}
          </span>
        </div>
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded font-mono">
          #{index + 1}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="text-xs text-muted-foreground truncate mb-0.5">{property.location_name}</p>
        <h3 className={`text-sm font-semibold line-clamp-2 mb-2 transition-colors ${
          isSelected ? 'text-[#C9A96E]' : 'text-foreground group-hover:text-[#C9A96E]'
        }`}>
          {displayTitle}
        </h3>
        {price != null && (
          <p className="text-sm font-bold text-foreground">
            {formatPrice(price, property.currency)}
            {isRent && (
              <span className="text-xs font-normal text-muted-foreground ml-0.5">
                {lang === 'es' ? '/mes' : '/mo'}
              </span>
            )}
          </p>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bed className="w-3 h-3" />{property.bedrooms}
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bath className="w-3 h-3" />{property.bathrooms}
            </span>
          )}
          {property.construction_size_sqm != null && (
            <span className="flex items-center gap-1">
              <Maximize className="w-3 h-3" />{property.construction_size_sqm}m²
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
