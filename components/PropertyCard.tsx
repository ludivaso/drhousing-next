import Link from 'next/link'
import Image from 'next/image'
import { Bed, Bath, Maximize } from 'lucide-react'
import { type PropertyRow, getHeroImage, formatPrice } from '@/lib/supabase/queries'
import FavoriteButton from '@/components/FavoriteButton'
import en from '@/messages/en.json'
import es from '@/messages/es.json'

const STATUS_CLASSES: Record<string, string> = {
  for_sale:       'badge-sale',
  for_rent:       'badge-rent',
  both:           'badge-both',
  presale:        'badge-both',
  under_contract: 'bg-amber-600 text-white text-xs font-medium tracking-wide px-2.5 py-1 rounded',
  sold:           'bg-muted text-muted-foreground text-xs font-medium tracking-wide px-2.5 py-1 rounded',
  rented:         'bg-muted text-muted-foreground text-xs font-medium tracking-wide px-2.5 py-1 rounded',
}

function getStatusLabel(status: string, lang: 'es' | 'en'): string {
  const msgs = lang === 'en' ? en : es
  const map: Record<string, string> = {
    for_sale:       msgs.property.status.for_sale,
    for_rent:       msgs.property.status.for_rent,
    both:           msgs.property.status.both,
    presale:        msgs.property.status.presale,
    under_contract: msgs.property.status.under_contract,
    sold:           msgs.property.status.sold,
    rented:         msgs.property.status.rented,
  }
  return map[status] ?? status
}

interface PropertyCardProps {
  property: PropertyRow
  lang?: 'es' | 'en'
}

export default function PropertyCard({ property, lang = 'es' }: PropertyCardProps) {
  const heroImage = getHeroImage(property)
  const title = lang === 'es'
    ? (property.title_es || property.ai_generated_title_es || property.title_en || property.title || '')
    : (property.title_en || property.ai_generated_title_en || property.title_es || property.title || '')
  const subtitle = lang === 'es'
    ? (property.subtitle || property.subtitle_en || '')
    : (property.subtitle_en || property.subtitle || '')
  const msgs = lang === 'en' ? en : es
  const statusLabel = getStatusLabel(property.status, lang)
  const statusClass = STATUS_CLASSES[property.status] ?? 'badge-sale'

  return (
    <Link
      href={`/${lang}/property/${property.slug}`}
      // Exact class from Lovable: block group overflow-hidden bg-card rounded-[10px] border border-border shadow-sm hover:shadow-md transition-shadow duration-300
      className="block group overflow-hidden bg-card rounded-[10px] border border-border shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      {/* Image — aspect-[4/3] exact from audit */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            // Exact: group-hover:scale-[1.03] transition-transform duration-300 ease-out
            className="object-cover group-hover:scale-[1.03] transition-transform duration-300 ease-out"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm font-sans">
            {msgs.property.noImage}
          </div>
        )}

        {/* Status badge: top-3 left-3 — exact position from audit */}
        <span className={`absolute top-3 left-3 uppercase tracking-wide ${statusClass}`}>
          {statusLabel}
        </span>


        {/* Favorite button: top-2 right-2 */}
        <FavoriteButton
          propertyId={property.id}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-sm"
        />
      </div>

      {/* Content — p-5 space-y-3 exact from audit */}
      <div className="p-5 space-y-3">

        {/* Location — show normalized zone when available, fall back to raw location_name */}
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-sans truncate">
          {property.zone || property.location_name}
        </p>

        {/* Title — exact: font-serif text-lg font-medium text-foreground leading-snug line-clamp-2 group-hover:text-primary */}
        <h3 className="font-serif text-lg font-medium text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>

        {/* Subtitle — exact: text-[13px] font-light italic color #6B6B6B */}
        {subtitle && (
          <p className="text-[13px] font-light italic font-sans" style={{ color: '#6B6B6B' }}>
            {subtitle}
          </p>
        )}

        {/* Stats — exact: flex items-center gap-4 text-sm text-muted-foreground */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground font-sans">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1.5">
              <Bed className="w-4 h-4" />
              {property.bedrooms}
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1.5">
              <Bath className="w-4 h-4" />
              {property.bathrooms}
            </span>
          )}
          {property.construction_size_sqm && (
            <span className="flex items-center gap-1.5">
              <Maximize className="w-4 h-4" />
              {property.construction_size_sqm} m²
            </span>
          )}
        </div>

        {/* Price — exact: pt-3 border-t border-border/50 */}
        <div className="pt-3 border-t border-border/50">
          {property.price_sale && (
            // Exact: font-serif text-xl tracking-tight text-foreground (NOT gold — that's only in detail page)
            <span className="font-serif text-xl tracking-tight text-foreground">
              {formatPrice(property.price_sale, property.currency)}
            </span>
          )}
          {property.price_rent_monthly && (
            <div className="mt-0.5">
              <span className="font-serif text-xl tracking-tight text-foreground">
                {formatPrice(property.price_rent_monthly, property.currency)}
              </span>
              <span className="text-sm text-muted-foreground font-sans">{msgs.property.perMonth}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
