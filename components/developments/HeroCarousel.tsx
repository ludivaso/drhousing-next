'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

interface Props {
  images: string[]
}

// ── HeroCarousel ─────────────────────────────────────────────────────────────
// Full-viewport fade carousel of the first 5 gallery images. Pauses on hover
// so users can read the headline over a stable frame, auto-advances every 6
// seconds otherwise. Thumbnails at the bottom double as jump controls.
export default function HeroCarousel({ images }: Props) {
  const slides = images.slice(0, 5)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (paused || slides.length <= 1) return
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, 6000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [paused, slides.length])

  return (
    <div
      className="relative w-full min-h-[92vh] overflow-hidden bg-[#1A1A1A]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides — all mounted, crossfade by opacity */}
      {slides.map((src, i) => (
        <div
          key={src + i}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden={i !== index}
        >
          <Image
            src={src}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
            unoptimized
          />
        </div>
      ))}

      {/* Gradient overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70 pointer-events-none" />

      {/* Thumbnail strip */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 md:bottom-10 left-0 right-0 z-20 flex items-center justify-center gap-2 md:gap-3 px-4">
          {slides.map((src, i) => {
            const active = i === index
            return (
              <button
                key={src + '-thumb-' + i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Slide ${i + 1}`}
                aria-current={active}
                className={`
                  relative w-14 h-10 md:w-20 md:h-14 rounded-md overflow-hidden transition-all
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]
                  ${active ? 'ring-2 ring-[#C9A96E]' : 'opacity-60 hover:opacity-100'}
                `}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                  unoptimized
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
