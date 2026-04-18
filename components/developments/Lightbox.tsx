'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  images: string[]
  openIndex: number | null
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  closeLabel: string
  prevLabel: string
  nextLabel: string
}

// ── Lightbox ─────────────────────────────────────────────────────────────────
// Full-viewport image viewer, same interaction model as the interior-design
// gallery: body-scroll-lock, Esc to close, ArrowLeft/Right to page, overlay
// click closes, image click does nothing.
export default function Lightbox({
  images,
  openIndex,
  onClose,
  onPrev,
  onNext,
  closeLabel,
  prevLabel,
  nextLabel,
}: Props) {
  // Lock body scroll while open and preserve the user's scroll position.
  useEffect(() => {
    if (openIndex === null) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [openIndex])

  // Keyboard navigation
  useEffect(() => {
    if (openIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if      (e.key === 'Escape')     onClose()
      else if (e.key === 'ArrowLeft')  onPrev()
      else if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openIndex, onClose, onPrev, onNext])

  if (openIndex === null) return null

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose() }}
        aria-label={closeLabel}
        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Counter */}
      <span className="absolute top-6 left-1/2 -translate-x-1/2 text-white/70 text-sm font-sans tracking-widest">
        {openIndex + 1} / {images.length}
      </span>

      {/* Prev */}
      <button
        onClick={(e) => { e.stopPropagation(); onPrev() }}
        aria-label={prevLabel}
        className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Main image */}
      <div
        className="relative w-[92vw] h-[78vh] max-w-[1400px]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[openIndex]}
          alt=""
          fill
          sizes="92vw"
          className="object-contain"
          unoptimized
          priority
        />
      </div>

      {/* Next */}
      <button
        onClick={(e) => { e.stopPropagation(); onNext() }}
        aria-label={nextLabel}
        className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  )
}
