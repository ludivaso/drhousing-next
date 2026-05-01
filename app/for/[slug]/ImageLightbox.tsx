'use client'

import { useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  images: string[]
  initialIndex: number
  onClose: () => void
}

export default function ImageLightbox({ images, initialIndex, onClose }: Props) {
  const [index, setIndex] = useState(initialIndex)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setIndex(i => Math.min(i + 1, images.length - 1))
      if (e.key === 'ArrowLeft') setIndex(i => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [images.length, onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full
                   bg-white/10 hover:bg-white/20 flex items-center
                   justify-center text-white transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10
                      text-white/60 text-sm font-mono">
        {index + 1} / {images.length}
      </div>

      {index > 0 && (
        <button
          onClick={e => { e.stopPropagation(); setIndex(i => i - 1) }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10
                     w-11 h-11 rounded-full bg-white/10 hover:bg-white/20
                     flex items-center justify-center text-white transition-colors"
          aria-label="Previous photo"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[index]}
        alt=""
        className="max-h-[90vh] max-w-[92vw] object-contain"
        onClick={e => e.stopPropagation()}
      />

      {index < images.length - 1 && (
        <button
          onClick={e => { e.stopPropagation(); setIndex(i => i + 1) }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10
                     w-11 h-11 rounded-full bg-white/10 hover:bg-white/20
                     flex items-center justify-center text-white transition-colors"
          aria-label="Next photo"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      <div className="absolute bottom-4 left-0 right-0 flex justify-center
                      gap-2 px-4 overflow-x-auto">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={e => { e.stopPropagation(); setIndex(i) }}
            className={`flex-none w-12 h-8 rounded overflow-hidden transition-opacity
                        ${i === index
                          ? 'opacity-100 ring-1 ring-[#C9A96E]'
                          : 'opacity-50 hover:opacity-75'}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}
