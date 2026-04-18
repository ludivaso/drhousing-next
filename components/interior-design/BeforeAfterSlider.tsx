'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import Image from 'next/image'

// ── Single interactive before/after image comparison ─────────────────────────
// The slider handle is dragged (mouse + touch) to reveal either side. Position
// is stored as a percentage so it works at any viewport width.
interface BeforeAfterProps {
  before: string
  after: string
  beforeLabel: string
  afterLabel: string
  caption: string
}

function BeforeAfter({ before, after, beforeLabel, afterLabel, caption }: BeforeAfterProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState(50)
  const [dragging, setDragging] = useState(false)

  // Compute percentage from a client X coordinate — clamped to [0, 100]
  const setFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const pct = ((clientX - rect.left) / rect.width) * 100
    setPosition(Math.max(0, Math.min(100, pct)))
  }, [])

  // Pointer events unify mouse + touch without the sync / bubbling headaches
  // of the old mousedown/touchstart pair.
  useEffect(() => {
    if (!dragging) return
    const move = (e: PointerEvent) => setFromClientX(e.clientX)
    const up   = () => setDragging(false)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [dragging, setFromClientX])

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-900 select-none cursor-ew-resize"
        onPointerDown={(e) => {
          setDragging(true)
          setFromClientX(e.clientX)
        }}
      >
        {/* AFTER — full layer */}
        <Image
          src={after}
          alt={afterLabel}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          unoptimized
        />

        {/* BEFORE — clipped from left */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${position}%` }}
        >
          <Image
            src={before}
            alt={beforeLabel}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            style={{ width: containerRef.current?.offsetWidth }}
            unoptimized
          />
        </div>

        {/* Labels */}
        <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs tracking-widest uppercase bg-black/50 text-white backdrop-blur-sm">
          {beforeLabel}
        </span>
        <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs tracking-widest uppercase bg-white/90 text-neutral-900 backdrop-blur-sm">
          {afterLabel}
        </span>

        {/* Drag handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_20px_rgba(0,0,0,0.4)] pointer-events-none"
          style={{ left: `${position}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-neutral-900" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 5l-5 7 5 7" />
              <path d="M16 5l5 7-5 7" />
            </svg>
          </div>
        </div>
      </div>
      <p className="font-sans text-sm text-muted-foreground text-center">
        {caption}
      </p>
    </div>
  )
}

// ── Section wrapper — renders N pairs in a responsive grid ───────────────────
export interface BeforeAfterPair {
  before: string
  after: string
  caption: string
}

interface BeforeAfterSliderProps {
  pairs: BeforeAfterPair[]
  beforeLabel: string
  afterLabel: string
  hint: string
}

export default function BeforeAfterSlider({
  pairs,
  beforeLabel,
  afterLabel,
  hint,
}: BeforeAfterSliderProps) {
  return (
    <div className="space-y-8">
      <p className="font-sans text-sm text-muted-foreground text-center italic">
        ← {hint} →
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {pairs.map((pair, i) => (
          <BeforeAfter
            key={i}
            before={pair.before}
            after={pair.after}
            beforeLabel={beforeLabel}
            afterLabel={afterLabel}
            caption={pair.caption}
          />
        ))}
      </div>
    </div>
  )
}
