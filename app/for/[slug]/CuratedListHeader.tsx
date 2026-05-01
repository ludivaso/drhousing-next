'use client'

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
  return (
    <header className="sticky top-0 z-30 bg-[#F5F2EE] border-b border-[#E8E3DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="DR Housing"
            className="h-7 w-auto"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        </div>

        {/* Center — private selection label (hidden on small screens) */}
        {clientName && (
          <div className="hidden sm:block text-center flex-1">
            <p className="text-[10px] uppercase tracking-widest text-[#9B9B9B] font-medium">
              {lang === 'es' ? 'Selección Privada' : 'Private Selection'}
            </p>
            <p className="text-xs font-medium text-[#3A3A3A] truncate max-w-[200px] mx-auto">
              {clientName}
            </p>
          </div>
        )}

        {/* Right — lang toggle + WhatsApp */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* EN | ES pill */}
          <div className="flex items-center rounded-full border border-[#E8E3DC] overflow-hidden text-xs font-medium">
            <button
              onClick={() => onLangChange('en')}
              className={`px-3 py-1.5 transition-colors duration-150 ${
                lang === 'en'
                  ? 'bg-[#C9A96E] text-white'
                  : 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F0EBE3]'
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
                  : 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F0EBE3]'
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
            className="w-8 h-8 rounded-full bg-[#25D366] hover:bg-[#1FB855]
                       flex items-center justify-center transition-colors"
            aria-label="WhatsApp"
          >
            <MessageCircle className="w-4 h-4 text-white" />
          </a>
        </div>

      </div>
    </header>
  )
}
