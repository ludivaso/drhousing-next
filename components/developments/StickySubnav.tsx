'use client'

import { useEffect, useState } from 'react'

interface Props {
  lang: 'en' | 'es'
}

const LINKS: ReadonlyArray<{ id: string; en: string; es: string }> = [
  { id: 'overview',   en: 'Overview',   es: 'Vista General' },
  { id: 'residences', en: 'Residences', es: 'Residencias' },
  { id: 'gallery',    en: 'Gallery',    es: 'Galería' },
  { id: 'amenities',  en: 'Amenities',  es: 'Amenidades' },
  { id: 'location',   en: 'Location',   es: 'Ubicación' },
  { id: 'inquiry',    en: 'Inquiry',    es: 'Contacto' },
]

// ── StickySubnav ─────────────────────────────────────────────────────────────
// Appears after the hero scrolls off (~85% of viewport height). Anchors use
// smooth scroll via native CSS scroll-behavior (set on <html> in globals).
export default function StickySubnav({ lang }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.85)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      aria-label={lang === 'es' ? 'Navegación de sección' : 'Section navigation'}
      className={`
        sticky top-20 md:top-[124px] z-30
        border-b border-[#E8E3DC] bg-[#F5F2EE]/85 backdrop-blur
        transition-all duration-300
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
      `}
    >
      <div className="container-wide">
        <ul className="flex items-center gap-6 md:gap-10 overflow-x-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {LINKS.map((l) => (
            <li key={l.id} className="shrink-0">
              <a
                href={`#${l.id}`}
                className="font-sans text-xs tracking-widest uppercase text-[#6B6158] hover:text-[#1A1A1A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] rounded"
              >
                {lang === 'es' ? l.es : l.en}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
