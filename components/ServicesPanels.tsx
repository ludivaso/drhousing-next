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
    href: 'interior-design',
    image:
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80&auto=format&fit=crop',
  },
]

// ── Single panel card ─────────────────────────────────────────────────────────
//
// Three visual states:
//   default  → grayscale, overlay rgba(26,26,26,0.25)
//   hover    → full color + scale(1.02), overlay rgba(26,26,26,0.15)   [desktop]
//   active   → full color, overlay rgba(26,26,26,0.05), gold accent line
//
// Mobile two-step: first tap → active; second tap (card already active) → navigate.
// Desktop: hover drives color; first click → active; second click → navigate.

function PanelCard({
  card,
  lang,
  isActive,
  onActivate,
}: {
  card: ServiceCardConfig
  lang: 'en' | 'es'
  isActive: boolean
  onActivate: () => void
}) {
  const [hovered, setHovered] = useState(false)

  const slug = card.href
    .replace(/^\//, '')
    .replace('propiedades', 'properties')
    .replace('servicios', 'services')
    .replace('agentes', 'agents')
    .replace('contacto', 'contact')
    .replace('herramientas', 'tools')

  const href = `/${lang}/${slug}`

  // Derived visual state
  const showColor  = isActive || hovered
  const overlayAlpha = isActive ? 0.05 : hovered ? 0.15 : 0.25

  const handleClick = (e: React.MouseEvent) => {
    if (!isActive) {
      e.preventDefault()
      onActivate()
    }
    // isActive → Link navigates naturally
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative overflow-hidden h-72 md:h-full cursor-pointer block"
      aria-current={isActive ? 'true' : undefined}
    >
      {/* Image — grayscale ↔ color, subtle zoom on hover */}
      <Image
        src={card.image}
        alt={lang === 'en' ? card.titleEn : card.titleEs}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover"
        style={{
          filter: showColor ? 'grayscale(0%)' : 'grayscale(100%)',
          transform: hovered ? 'scale(1.02)' : 'scale(1)',
          transition: 'filter 400ms ease-out, transform 400ms ease-out',
        }}
        unoptimized
      />

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: `rgba(26,26,26,${overlayAlpha})`,
          transition: 'background-color 400ms ease-out',
        }}
      />

      {/* Text — centered, no extra elements */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        <h3 className="font-serif text-[28px] font-light text-white leading-tight tracking-wide">
          {lang === 'en' ? card.titleEn : card.titleEs}
        </h3>

        {/* Gold accent line — only on active, animates width */}
        <div
          style={{
            height: '2px',
            width: isActive ? '48px' : '0px',
            backgroundColor: '#C9A96E',
            marginTop: '12px',
            transition: 'width 400ms ease-out',
          }}
        />
      </div>
    </Link>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

interface ServicesPanelsProps {
  cards?: ServiceCardConfig[]
  panelOverlay?: number  // kept for API compatibility, no longer used
}

export default function ServicesPanels({ cards }: ServicesPanelsProps) {
  const pathname = usePathname()
  const lang: 'en' | 'es' = pathname.startsWith('/es') ? 'es' : 'en'
  const activeCards = cards ?? DEFAULT_CARDS

  const [activeHref, setActiveHref] = useState<string | null>(null)

  return (
    <div className="flex flex-col md:grid md:grid-cols-3 w-full md:h-[520px]">
      {activeCards.map((card) => (
        <PanelCard
          key={card.href}
          card={card}
          lang={lang}
          isActive={activeHref === card.href}
          onActivate={() => setActiveHref(card.href)}
        />
      ))}
    </div>
  )
}
