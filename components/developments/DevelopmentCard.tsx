'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart } from 'lucide-react'
import type { Development } from '@/app/[lang]/desarrollos/data'
import {
  STATUS_LABEL,
  STATUS_STYLE,
  formatPrice,
} from '@/app/[lang]/desarrollos/data'

interface Props {
  dev: Development
  lang: 'en' | 'es'
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
}

// ── DevelopmentCard ──────────────────────────────────────────────────────────
// Editorial project tile used on the index grid. Click anywhere on the card
// routes to the detail page; the heart button stops propagation so it can
// toggle favorites without triggering navigation.
export default function DevelopmentCard({ dev, lang, isFavorite, onToggleFavorite }: Props) {
  const name     = lang === 'es' ? dev.nameEs   : dev.nameEn
  const subtitle = lang === 'es' ? dev.subtitleEs : dev.subtitleEn
  const statusLabel = STATUS_LABEL[dev.status][lang]
  const statusStyle = STATUS_STYLE[dev.status]

  // Bedroom range across unit types — "3–5 bed" or "3 bed" when uniform
  const beds = dev.unitTypes.map((u) => u.beds)
  const minBeds = Math.min(...beds)
  const maxBeds = Math.max(...beds)
  const bedsLabel = minBeds === maxBeds ? `${minBeds}` : `${minBeds}–${maxBeds}`

  // Delivery: "Delivery 2027" / "Delivered 2024" / "—" when null
  let deliveryLabel = '—'
  if (dev.deliveryDate) {
    const year = new Date(dev.deliveryDate).getFullYear()
    const isPast = dev.status === 'ready' || dev.status === 'sold-out'
    deliveryLabel = lang === 'es'
      ? `${isPast ? 'Entregado' : 'Entrega'} ${year}`
      : `${isPast ? 'Delivered' : 'Delivery'} ${year}`
  }

  // "From $X.XM" — gold for pre-sale to signal early-access pricing
  const fromLabel = lang === 'es' ? 'Desde' : 'From'
  const priceClass = dev.status === 'pre-sale' ? 'text-[#C9A96E]' : 'text-[#1A1A1A]'

  const ariaFav = isFavorite
    ? (lang === 'es' ? 'Quitar de favoritos' : 'Remove from favorites')
    : (lang === 'es' ? 'Agregar a favoritos' : 'Add to favorites')

  return (
    <Link
      href={`/${lang}/desarrollos/${dev.slug}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] rounded-lg"
    >
      {/* 4:5 image with hover zoom */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-[#E8E3DC]">
        <Image
          src={dev.heroImage}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          unoptimized
        />

        {/* Status badge */}
        <span
          className={`absolute top-4 left-4 text-[11px] font-sans font-medium tracking-widest uppercase px-3 py-1.5 rounded-full ${statusStyle}`}
        >
          {statusLabel}
        </span>

        {/* Favorite heart */}
        <button
          type="button"
          aria-label={ariaFav}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onToggleFavorite(dev.id)
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/85 backdrop-blur flex items-center justify-center hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]"
        >
          <Heart
            className={`w-4 h-4 ${isFavorite ? 'fill-[#C9A96E] text-[#C9A96E]' : 'text-[#1A1A1A]'}`}
          />
        </button>
      </div>

      {/* Text block */}
      <div className="pt-5">
        <h3 className="font-serif text-[22px] font-light text-[#1A1A1A] leading-tight">
          {name}
        </h3>
        <p className="mt-2 font-sans text-[13px] tracking-widest uppercase text-[#6B6158]">
          {dev.locationName} · {dev.zone}
        </p>
        <p className={`mt-3 font-serif text-lg ${priceClass}`}>
          {fromLabel} {formatPrice(dev.priceFromUsd)}
        </p>

        <div className="mt-4 pt-4 border-t border-[#E8E3DC] flex flex-wrap gap-x-3 gap-y-1 text-[12px] font-sans text-[#6B6158]">
          <span>{deliveryLabel}</span>
          <span aria-hidden>·</span>
          <span>
            {dev.unitCount} {lang === 'es' ? 'residencias' : 'residences'}
          </span>
          <span aria-hidden>·</span>
          <span>
            {bedsLabel} {lang === 'es' ? 'hab' : 'bed'}
          </span>
          <p className="sr-only">{subtitle}</p>
        </div>
      </div>
    </Link>
  )
}
