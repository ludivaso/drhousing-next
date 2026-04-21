import Image from 'next/image'

// ── CatalogHero ──────────────────────────────────────────────────────────────
// Shared catalog hero used by /properties and /desarrollos. Fixed aspect band
// (45vh, capped at 360–520px) with a centered eyebrow + serif headline +
// optional subtitle over a darkened architectural photo. The bottom of the
// hero is intentionally plain so the adjacent <CatalogFilterBar> can overlap
// it from below via negative margin.
//
// Keep this a server component — it has no interactivity.

interface CatalogHeroProps {
  imageUrl: string
  eyebrow: string        // e.g. "Portfolio" / "Developments"
  title: string
  subtitle?: string
  lang: 'en' | 'es'      // reserved for future alt-text / locale tweaks
  priority?: boolean     // default true — this is above-the-fold
}

export default function CatalogHero({
  imageUrl,
  eyebrow,
  title,
  subtitle,
  priority = true,
}: CatalogHeroProps) {
  return (
    <div data-hero="true" className="relative w-full -mt-16 lg:-mt-[72px]">
      <div className="relative h-[45vh] min-h-[360px] max-h-[520px] w-full overflow-hidden bg-[#1A1A1A]">
        <Image
          src={imageUrl}
          alt={eyebrow}
          fill
          priority={priority}
          sizes="100vw"
          className="object-cover"
          unoptimized
        />

        {/* Vertical gradient — darker at the bottom so the floating filter
            shelf (rendered by the parent) stays legible where it overlaps. */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />

        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="max-w-3xl text-center text-white">
            <p className="font-sans text-xs tracking-[0.2em] uppercase opacity-80 mb-4">
              {eyebrow}
            </p>
            <h1 className="font-serif text-3xl md:text-5xl font-light leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-4 mx-auto max-w-xl font-sans text-sm md:text-base opacity-90 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
