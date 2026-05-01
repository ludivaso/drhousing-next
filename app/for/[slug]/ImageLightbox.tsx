'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageLightboxProps {
  images: string[]
  initialIndex: number
  onClose: () => void
}

export default function ImageLightbox({ images, initialIndex, onClose }: ImageLightboxProps) {
  const [current, setCurrent] = useState(initialIndex)

  const prev = useCallback(() => {
    setCurrent(i => (i - 1 + images.length) % images.length)
  }, [images.length])

  const next = useCallback(() => {
    setCurrent(i => (i + 1) % images.length)
  }, [images.length])

  // Keyboard navigation + scroll lock
  useEffect(() => {
    const savedOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = savedOverflow
    }
  }, [onClose, prev, next])

  if (images.length === 0) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95"
      onClick={onClose}
    >
      {/* ── Close button ────────────────────────────────────────────────── */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose() }}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full
                   bg-white/10 hover:bg-white/25 flex items-center justify-center
                   text-white transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      {/* ── Counter ─────────────────────────────────────────────────────── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10
                      text-white/60 text-xs font-mono tracking-widest">
        {current + 1} / {images.length}
      </div>

      {/* ── Main image ──────────────────────────────────────────────────── */}
      <div
        className="flex-1 flex items-center justify-center relative px-14"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prev arrow */}
        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); prev() }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10
                       w-10 h-10 rounded-full bg-white/10 hover:bg-white/25
                       flex items-center justify-center text-white transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={current}
          src={images[current]}
          alt={`Photo ${current + 1}`}
          className="max-w-full max-h-full object-contain select-none"
          style={{ maxHeight: 'calc(100vh - 160px)' }}
          draggable={false}
        />

        {/* Next arrow */}
        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); next() }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10
                       w-10 h-10 rounded-full bg-white/10 hover:bg-white/25
                       flex items-center justify-center text-white transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ── Thumbnail strip ─────────────────────────────────────────────── */}
      {images.length > 1 && (
        <div
          className="flex gap-2 px-4 pb-4 pt-2 overflow-x-auto justify-center"
          style={{ scrollbarWidth: 'none' } as React.CSSProperties}
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i) }}
              className={[
                'flex-none w-14 h-10 rounded overflow-hidden transition-all',
                i === current
                  ? 'ring-2 ring-[#C9A96E] opacity-100'
                  : 'opacity-40 hover:opacity-70',
              ].join(' ')}
              aria-label={`Photo ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className="w-full h-full object-cover" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
