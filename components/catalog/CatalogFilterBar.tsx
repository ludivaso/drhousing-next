'use client'

import type { ReactNode } from 'react'

// ── CatalogFilterBar ─────────────────────────────────────────────────────────
// Shared catalog filter shell. Renders a white, elevated, rounded card that:
//  • Floats up to overlap the bottom of the adjacent <CatalogHero> via a
//    negative top margin (Sotheby's / Christie's / The Agency pattern).
//  • Becomes sticky beneath the global navbar on scroll so users never lose
//    filter access while browsing.
//
// The shell is intentionally content-agnostic — each page composes its own
// search input, filter pills, and active-chips row inside. This keeps the
// filter *semantics* per-page (properties and developments have different
// filter models) while guaranteeing the *chrome* stays identical.
//
// Sticky offset note: `top-20 md:top-[124px]` is calibrated to the existing
// Navbar (fixed, two-row on desktop with the contact strip). Update in tandem
// if the navbar height changes.

interface CatalogFilterBarProps {
  children: ReactNode
  /** Match the width of the content below (e.g. the results grid container). */
  maxWidthClass?: string
}

export default function CatalogFilterBar({
  children,
  maxWidthClass = 'max-w-6xl',
}: CatalogFilterBarProps) {
  return (
    <div
      className={`sticky top-20 md:top-[124px] z-40 -mt-12 md:-mt-14 mx-auto ${maxWidthClass} px-4`}
    >
      <div className="bg-white rounded-xl shadow-xl border border-[#E8E3DC] p-4 md:p-5 space-y-3">
        {children}
      </div>
    </div>
  )
}
