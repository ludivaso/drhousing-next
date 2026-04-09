'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import type { ServiceCardConfig } from '@/lib/supabase/settings'

const DEFAULT_CARDS: ServiceCardConfig[] = [
  {
    titleEn: 'Portfolio',
    titleEs: 'Portafolio',
    subtitleEn: 'Luxury homes & investments',
    subtitleEs: 'Propiedades de lujo e inversión',
    href: 'properties',
    image:
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80&auto=format&fit=crop',
  },
  {
    titleEn: 'Developments',
    titleEs: 'Desarrollos',
    subtitleEn: 'New construction & pre-sales',
    subtitleEs: 'Construcción nueva y preventas',
    href: 'desarrollos',
    image:
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80&auto=format&fit=crop',
  },
  {
    titleEn: 'Interior Design',
    titleEs: 'Diseño Interior',
    subtitleEn: 'Curated living spaces',
    subtitleEs: 'Espacios diseñados a medida',
    href: 'services',
    image:
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80&auto=format&fit=crop',
  },
]

// ── Single panel card — uses useState so hover overlay can animate dynamically ─
function PanelCard({
  card,
  lang,
  overlayOpacity,
}: {
  card: ServiceCardConfig
  lang: 'en' | 'es'
  overlayOpacity: number   // 0-100
}) {
  const [hovered, setHovered] = useState(false)
  // On hover the overlay lifts to ~half the resting opacity (same feel as before)
  const hoverOpacity = overlayOpacity * 0.5

  // Normalise legacy Spanish full-paths stored in DB before the EN routing migration
  const LEGACY_PATH_MAP: Record<string, string> = {
    '/propiedades':  'properties',
    '/desarrollos':  'desarrollos',
    '/servicios':    'services',
    '/contacto':     'contact',
    '/herramientas': 'tools',
    '/agentes':      'agents',
  }
  const normalised = LEGACY_PATH_MAP[card.href] ?? card.href
  // normalised may be a full lang-prefixed path already or just a slug
  const href = normalised.startsWith('/') ? normalised : `/${lang}/${normalised}`

  return (
    <Link
      href={href}
      className="group relative overflow-hidden h-72 md:h-full cursor-pointer block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Background image — grayscale → colour on hover */}
      <Image
        src={card.image}
        alt={lang === 'en' ? card.titleEn : card.titleEs}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover transition-all duration-500 grayscale group-hover:grayscale-0"
        unoptimized
      />

      {/* Dynamic dark overlay — lighter on hover */}
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{
          backgroundColor: `rgba(0,0,0,${(hovered ? hoverOpacity : overlayOpacity) / 100})`,
        }}
      />

      {/* Centered text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        <h3
          className="font-serif text-[28px] font-semibold text-white leading-tight
                     transition-transform duration-500 group-hover:scale-105"
        >
          {lang === 'en' ? card.titleEn : card.titleEs}
        </h3>

        <p
          className="mt-3 text-sm font-sans text-white/80
                     opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        >
          {lang === 'en' ? card.subtitleEn : card.subtitleEs}
        </p>

        <span
          className="mt-5 text-xs font-sans font-medium tracking-widest uppercase text-white/90
                     opacity-0 group-hover:opacity-100
                     translate-y-4 group-hover:translate-y-0
                     transition-all duration-500"
        >
          {lang === 'en' ? 'Explore' : 'Explorar'} →
        </span>
      </div>
    </Link>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

interface ServicesPanelsProps {
  cards?: ServiceCardConfig[]
  /** Black overlay opacity 0-100. Default 55 */
  panelOverlay?: number
}

export default function ServicesPanels({ cards, panelOverlay }: ServicesPanelsProps) {
  const pathname = usePathname()
  const lang: 'en' | 'es' = pathname.startsWith('/es') ? 'es' : 'en'
  const activeCards   = cards ?? DEFAULT_CARDS
  const overlayOpacity = panelOverlay ?? 55

  return (
    <div className="flex flex-col md:grid md:grid-cols-3 w-full md:h-[520px]">
      {activeCards.map((card) => (
        <PanelCard
          key={card.href}
          card={card}
          lang={lang}
          overlayOpacity={overlayOpacity}
        />
      ))}
    </div>
  )
}
