'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  ChevronLeft, ChevronRight, MessageCircle,
  Bed, Bath, Car, Maximize, TreePine, Calendar,
} from 'lucide-react'
import { formatPrice } from '@/lib/supabase/queries'
import type { PropertyRow } from '@/src/integrations/supabase/types'
import ImageLightbox from './ImageLightbox'

interface Props {
  property: PropertyRow
  lang: string
  lightboxOpen: boolean
  onLightboxChange: (open: boolean) => void
  onClose?: () => void
}

export default function PropertyDetailPanel({
  property,
  lang,
  lightboxOpen,
  onLightboxChange,
  onClose,
}: Props) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const allImages = Array.from(
    new Set([...(property.featured_images ?? []), ...(property.images ?? [])])
  )

  // Reset photo when property changes
  useEffect(() => {
    setSelectedImageIndex(0)
  }, [property.id])

  const t = {
    bed:          lang === 'es' ? 'Hab'            : 'Bed',
    bath:         lang === 'es' ? 'Baños'          : 'Bath',
    construction: lang === 'es' ? 'Const.'         : 'Built',
    land:         lang === 'es' ? 'Terreno'        : 'Land',
    garage:       lang === 'es' ? 'Parqueo'        : 'Garage',
    yearBuilt:    lang === 'es' ? 'Año'            : 'Year',
    features:     lang === 'es' ? 'Características': 'Features',
    amenities:    lang === 'es' ? 'Amenidades'     : 'Amenities',
    diegosNote:   lang === 'es' ? 'Nota de Diego'  : "Diego's Note",
    askDiego:     lang === 'es' ? 'Pregunta sobre esta propiedad' : 'Ask Diego about this property',
    backToList:   lang === 'es' ? '← Volver a la lista' : '← Back to list',
    tapExpand:    lang === 'es' ? 'Toca para ampliar'   : 'Tap to expand',
    forSale:      lang === 'es' ? 'En venta'    : 'For sale',
    forRent:      lang === 'es' ? 'En alquiler' : 'For rent',
    perMonth:     lang === 'es' ? '/mes'        : '/mo',
    noImages:     lang === 'es' ? 'Sin imágenes': 'No images',
  }

  const displayTitle = lang === 'en'
    ? (property.title_en ?? property.title_es ?? property.title)
    : (property.title_es ?? property.title_en ?? property.title)

  const displayDescription = lang === 'en'
    ? (property.description_en ?? property.description_es ?? property.description ?? '')
    : (property.description_es ?? property.description_en ?? property.description ?? '')

  const displaySubtitle = lang === 'en'
    ? (property.subtitle_en ?? property.subtitle ?? null)
    : (property.subtitle ?? property.subtitle_en ?? null)

  const displayFeatures = lang === 'en'
    ? (property.features_en ?? property.features_es ?? property.features ?? [])
    : (property.features_es ?? property.features_en ?? property.features ?? [])

  const displayAmenities = lang === 'en'
    ? (property.amenities_en ?? property.amenities_es ?? property.amenities ?? [])
    : (property.amenities_es ?? property.amenities_en ?? property.amenities ?? [])

  const isRent = property.status === 'for_rent'
  const price = property.price_sale ?? property.price_rent_monthly
  const refId = property.reference_id ?? property.id.slice(0, 8)

  const waMessage = encodeURIComponent(
    lang === 'es'
      ? `Hola Diego, me interesa la propiedad #${refId}. ¿Podemos hablar?`
      : `Hi Diego, I'm interested in property #${refId}. Can we chat?`
  )

  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border">
      {/* Mobile back button */}
      {onClose && (
        <button
          onClick={onClose}
          className="lg:hidden w-full text-left px-4 py-3 text-sm text-muted-foreground hover:text-foreground border-b border-border transition-colors"
        >
          {t.backToList}
        </button>
      )}

      {/* Main photo */}
      <div
        className="relative w-full overflow-hidden cursor-zoom-in group"
        style={{ aspectRatio: '16/9' }}
        onClick={() => { if (allImages.length > 0) onLightboxChange(true) }}
      >
        {allImages[selectedImageIndex] ? (
          <Image
            src={allImages[selectedImageIndex]}
            alt={displayTitle}
            fill
            className="object-cover"
            unoptimized
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-secondary flex items-center justify-center">
            <span className="text-muted-foreground text-sm">{t.noImages}</span>
          </div>
        )}

        {/* Expand hint */}
        {allImages.length > 0 && (
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {t.tapExpand}
          </div>
        )}

        {/* Image counter */}
        {allImages.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded font-mono backdrop-blur-sm pointer-events-none">
            {selectedImageIndex + 1} / {allImages.length}
          </div>
        )}

        {/* Previous arrow — always visible on mobile, hover on desktop */}
        {selectedImageIndex > 0 && (
          <button
            onClick={e => { e.stopPropagation(); setSelectedImageIndex(i => i - 1) }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10
                       w-10 h-10 rounded-full bg-black/40 hover:bg-black/60
                       backdrop-blur-sm flex items-center justify-center
                       text-white transition-all duration-200
                       opacity-100 md:opacity-0 md:group-hover:opacity-100"
            aria-label={lang === 'es' ? 'Foto anterior' : 'Previous photo'}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Next arrow */}
        {selectedImageIndex < allImages.length - 1 && (
          <button
            onClick={e => { e.stopPropagation(); setSelectedImageIndex(i => i + 1) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10
                       w-10 h-10 rounded-full bg-black/40 hover:bg-black/60
                       backdrop-blur-sm flex items-center justify-center
                       text-white transition-all duration-200
                       opacity-100 md:opacity-0 md:group-hover:opacity-100"
            aria-label={lang === 'es' ? 'Siguiente foto' : 'Next photo'}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Thumbnail strip */}
      {allImages.length > 1 && (
        <div className="flex gap-1.5 px-4 py-3 overflow-x-auto bg-secondary/30">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedImageIndex(i)}
              className={`relative flex-none w-14 h-10 rounded overflow-hidden transition-all ${
                i === selectedImageIndex
                  ? 'ring-2 ring-[#C9A96E] opacity-100'
                  : 'opacity-50 hover:opacity-80'
              }`}
            >
              <Image src={img} alt="" fill className="object-cover" unoptimized />
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {displaySubtitle && (
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                {displaySubtitle}
              </p>
            )}
            <p className="text-xs text-muted-foreground">{property.location_name}</p>
            <h2 className="font-serif text-xl font-semibold text-foreground mt-1">
              {displayTitle}
            </h2>
          </div>
          {price != null && (
            <div className="flex-shrink-0 text-right">
              <p className="text-lg font-bold text-[#C9A96E]">
                {formatPrice(price, property.currency)}
                {isRent && (
                  <span className="text-sm font-normal text-muted-foreground">{t.perMonth}</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">{isRent ? t.forRent : t.forSale}</p>
            </div>
          )}
        </div>

        {/* Specs grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {property.bedrooms > 0 && (
            <div className="flex flex-col items-center gap-1 bg-secondary/50 rounded-lg p-2 text-center">
              <Bed className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{property.bedrooms}</span>
              <span className="text-xs text-muted-foreground">{t.bed}</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="flex flex-col items-center gap-1 bg-secondary/50 rounded-lg p-2 text-center">
              <Bath className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{property.bathrooms}</span>
              <span className="text-xs text-muted-foreground">{t.bath}</span>
            </div>
          )}
          {property.construction_size_sqm != null && (
            <div className="flex flex-col items-center gap-1 bg-secondary/50 rounded-lg p-2 text-center">
              <Maximize className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{property.construction_size_sqm}</span>
              <span className="text-xs text-muted-foreground">{t.construction} m²</span>
            </div>
          )}
          {property.land_size_sqm != null && (
            <div className="flex flex-col items-center gap-1 bg-secondary/50 rounded-lg p-2 text-center">
              <TreePine className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{property.land_size_sqm}</span>
              <span className="text-xs text-muted-foreground">{t.land} m²</span>
            </div>
          )}
          {property.garage_spaces > 0 && (
            <div className="flex flex-col items-center gap-1 bg-secondary/50 rounded-lg p-2 text-center">
              <Car className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{property.garage_spaces}</span>
              <span className="text-xs text-muted-foreground">{t.garage}</span>
            </div>
          )}
          {property.year_built != null && (
            <div className="flex flex-col items-center gap-1 bg-secondary/50 rounded-lg p-2 text-center">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{property.year_built}</span>
              <span className="text-xs text-muted-foreground">{t.yearBuilt}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {displayDescription && (
          <p className="text-sm text-muted-foreground leading-relaxed">{displayDescription}</p>
        )}

        {/* Features */}
        {displayFeatures.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">{t.features}</h4>
            <div className="flex flex-wrap gap-1.5">
              {displayFeatures.map((f, i) => (
                <span key={i} className="text-xs bg-secondary text-muted-foreground px-2.5 py-1 rounded-full">
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Amenities */}
        {displayAmenities.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">{t.amenities}</h4>
            <div className="flex flex-wrap gap-1.5">
              {displayAmenities.map((a, i) => (
                <span key={i} className="text-xs bg-secondary text-muted-foreground px-2.5 py-1 rounded-full">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Diego's Note */}
        {property.plusvalia_notes && (
          <div className="bg-[#C9A96E]/10 border border-[#C9A96E]/30 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-[#C9A96E] mb-1.5">{t.diegosNote}</h4>
            <p className="text-sm text-foreground/80 leading-relaxed">{property.plusvalia_notes}</p>
          </div>
        )}

        {/* WhatsApp CTA */}
        <a
          href={`https://wa.me/50686540888?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                     bg-[#25D366] text-white font-medium hover:bg-[#25D366]/90
                     transition-colors text-sm"
        >
          <MessageCircle className="w-4 h-4" />
          {t.askDiego}
        </a>
      </div>

      {/* Lightbox */}
      {lightboxOpen && allImages.length > 0 && (
        <ImageLightbox
          images={allImages}
          initialIndex={selectedImageIndex}
          onClose={() => onLightboxChange(false)}
        />
      )}
    </div>
  )
}
