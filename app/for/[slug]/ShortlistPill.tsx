'use client'

import { Heart } from 'lucide-react'

interface ShortlistPillProps {
  count: number
  lang: 'en' | 'es'
  onScrollToFirst: () => void
}

export default function ShortlistPill({ count, lang, onScrollToFirst }: ShortlistPillProps) {
  if (count === 0) return null

  return (
    <button
      onClick={onScrollToFirst}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-40
                 bg-[#C9A96E] hover:bg-[#B89656] text-white
                 px-5 py-2.5 rounded-full shadow-lg
                 flex items-center gap-2 font-medium text-sm
                 animate-fade-in animate-slide-up"
    >
      <Heart className="w-4 h-4 fill-white stroke-white flex-shrink-0" />
      {lang === 'es' ? `Mi lista (${count})` : `My shortlist (${count})`}
    </button>
  )
}
