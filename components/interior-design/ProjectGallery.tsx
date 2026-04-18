'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

// ── Gallery grid + fullscreen lightbox ───────────────────────────────────────
// Same interaction pattern we use on property-detail galleries: click → open
// full-viewport viewer with thumbnail strip + keyboard arrows + body-scroll
// lock. Keeps the two galleries feeling like one product.
export interface GalleryImage {
  src: string
  alt: string
}

interface ProjectGalleryProps {
  images: GalleryImage[]
  closeLabel: string
  prevLabel: string
  nextLabel: string
}

export default function ProjectGallery({
  images,
  closeLabel,
  prevLabel,
  nextLabel,
}: ProjectGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  // Lock body scroll while the lightbox is open. Saves the scroll position
  // on the body element so closing returns the user to their exact place.
  useEffect(() => {
    if (openIndex === null) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [openIndex])

  const close = useCallback(() => setOpenIndex(null), [])
  const prev  = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length)),
    [images.length],
  )
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % images.length)),
    [images.length],
  )

  // Keyboard navigation — escape to close, arrows to page
  useEffect(() => {
    if (openIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if      (e.key === 'Escape')     close()
      else if (e.key === 'ArrowLeft')  prev()
      else if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openIndex, close, prev, next])

  return (
    <>
      {/* Grid — first image spans two columns on desktop for a more editorial
          layout; the rest flow in a standard 3-col grid. */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setOpenIndex(i)}
            aria-label={img.alt}
            className={`
              group relative overflow-hidden rounded-lg bg-neutral-100
              aspect-[4/3]
              ${i === 0 ? 'col-span-2 md:col-span-2 md:row-span-2 md:aspect-auto' : ''}
            `}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes={i === 0
                ? '(max-width: 768px) 100vw, 50vw'
                : '(max-width: 768px) 50vw, 25vw'}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {openIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center"
          onClick={close}
        >
          {/* Close */}
          <button
            onClick={(e) => { e.stopPropagation(); close() }}
            aria-label={closeLabel}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Counter */}
          <span className="absolute top-6 left-1/2 -translate-x-1/2 text-white/70 text-sm font-sans tracking-widest">
            {openIndex + 1} / {images.length}
          </span>

          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); prev() }}
            aria-label={prevLabel}
            className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Main image */}
          <div
            className="relative w-[92vw] h-[78vh] max-w-[1400px]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[openIndex].src}
              alt={images[openIndex].alt}
              fill
              sizes="92vw"
              className="object-contain"
              unoptimized
              priority
            />
          </div>

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); next() }}
            aria-label={nextLabel}
            className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </>
  )
}
