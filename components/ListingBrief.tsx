'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Bed, Bath, Maximize } from 'lucide-react'
import type { PropertyRow } from '@/src/integrations/supabase/types'
import { formatPrice, getHeroImage } from '@/lib/supabase/queries'
import { useI18n } from '@/lib/i18n/context'

interface ListingBriefProps {
  property: PropertyRow
}

function getStatusClass(p: PropertyRow): string {
  if (p.price_sale && p.price_rent_monthly) return 'badge-both'
  if (p.price_rent_monthly && !p.price_sale) return 'badge-rent'
  return 'badge-sale'
}

function getDisplayPrice(p: PropertyRow, lang: string): string | null {
  const price = p.price_sale ?? p.price_rent_monthly
  if (!price) return null
  const formatted = formatPrice(price)
  return p.price_rent_monthly && !p.price_sale
    ? `${formatted}${lang === 'en' ? '/mo' : '/mes'}`
    : formatted
}

export default function ListingBrief({ property: p }: ListingBriefProps) {
  const { lang, t } = useI18n()
  const heroImage = getHeroImage(p)
  const price = getDisplayPrice(p, lang)
  const title = lang === "en" && p.title_en ? p.title_en : p.title

  const statusLabel = (() => {
    if (p.price_sale && p.price_rent_monthly) return t('property.status.both')
    if (p.price_rent_monthly && !p.price_sale) return t('property.status.for_rent')
    return t('property.status.for_sale')
  })()

  return (
    <Link
      href={`/property/${p.reference_id || p.slug}`}
      className="group flex items-start gap-5 py-5 border-b border-border last:border-b-0 hover:bg-secondary/40 -mx-4 px-4 transition-colors rounded"
    >
      {/* Thumbnail */}
      <div className="w-24 h-20 sm:w-32 sm:h-24 flex-shrink-0 overflow-hidden rounded bg-muted">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={title || ''}
            width={128}
            height={96}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-muted" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={getStatusClass(p)}>{statusLabel}</span>
              {p.property_type && (
                <span className="text-xs text-muted-foreground">{p.property_type}</span>
              )}
            </div>

            <h3 className="font-serif text-base sm:text-lg font-medium text-foreground line-clamp-1 group-hover:text-[#C9A96E] transition-colors">
              {title}
            </h3>

            {p.location_name && (
              <p className="text-xs text-muted-foreground tracking-wide uppercase mt-0.5">
                {p.location_name}
              </p>
            )}

            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              {p.bedrooms != null && (
                <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" />{p.bedrooms}</span>
              )}
              {p.bathrooms != null && (
                <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{p.bathrooms}</span>
              )}
              {p.construction_size_sqm != null && (
                <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5" />{p.construction_size_sqm} m²</span>
              )}
            </div>
          </div>

          {price && (
            <div className="text-right flex-shrink-0">
              <p className="font-serif text-base sm:text-lg font-semibold text-foreground whitespace-nowrap">
                {price}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
