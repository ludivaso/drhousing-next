'use client'

import { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'

interface Props {
  lang: 'en' | 'es'
  onLangChange: (lang: 'en' | 'es') => void
  clientName: string | null
  whatsAppMessage: string
}

export default function CuratedListHeader({
  lang,
  onLangChange,
  clientName,
  whatsAppMessage,
}: Props) {
  // ── Scroll-aware background ───────────────────────────────────────────────
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-30 transition-colors duration-300 ${
        scrolled
          ? 'bg-[#F5F2EE] border-b border-[#E8E3DC]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4"
        style={{ height: '72px' }}
      >

        {/* Logo — inverted (white) over transparent hero, natural over solid bg */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="DR Housing"
            className={`h-16 w-auto transition-all duration-300 ${
              scrolled ? '' : 'brightness-0 invert'
            }`}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        </div>

        {/* Center — private selection label (hidden on small screens) */}
        {clientName && (
          <div className="hidden sm:block text-center flex-1">
            <p className={`text-[10px] uppercase tracking-widest font-medium transition-colors duration-300 ${
              scrolled ? 'text-[#9B9B9B]' : 'text-white/60'
            }`}>
              {lang === 'es' ? 'Selección Privada' : 'Private Selection'}
            </p>
            <p className={`text-xs font-medium truncate max-w-[200px] mx-auto transition-colors duration-300 ${
              scrolled ? 'text-[#3A3A3A]' : 'text-white/90'
            }`}>
              {clientName}
            </p>
          </div>
        )}

        {/* Right — lang toggle + WhatsApp */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* EN | ES pill */}
          <div className={`flex items-center rounded-full border overflow-hidden text-xs font-medium transition-colors duration-300 ${
            scrolled ? 'border-[#E8E3DC]' : 'border-white/40'
          }`}>
            <button
              onClick={() => onLangChange('en')}
              className={`px-3 py-1.5 transition-colors duration-150 ${
                lang === 'en'
                  ? 'bg-[#C9A96E] text-white'
                  : scrolled
                    ? 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F0EBE3]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              aria-pressed={lang === 'en'}
            >
              EN
            </button>
            <button
              onClick={() => onLangChange('es')}
              className={`px-3 py-1.5 transition-colors duration-150 ${
                lang === 'es'
                  ? 'bg-[#C9A96E] text-white'
                  : scrolled
                    ? 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F0EBE3]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              aria-pressed={lang === 'es'}
            >
              ES
            </button>
          </div>

          {/* WhatsApp icon only */}
          <a
            href={`https://wa.me/50686540888?text=${encodeURIComponent(whatsAppMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-8 h-8 rounded-full flex items-center justify-center
                        transition-colors duration-150 ${
              scrolled
                ? 'bg-[#25D366] hover:bg-[#1FB855]'
                : 'bg-white/20 hover:bg-white/30'
            }`}
            aria-label="WhatsApp"
          >
            <MessageCircle className="w-4 h-4 text-white" />
          </a>
        </div>

      </div>
    </header>
  )
}
