import Image from 'next/image'
import { supabase } from '@/lib/supabase/client'

// ── PageHeroBanner ────────────────────────────────────────────────────────────
// Full-bleed hero image banner for /sellers, /buyers, and any future landing
// page that needs a top-of-page visual entry point without an H1 overlay.
//
// CMS-managed: if a row exists in hero_media with page_slug = pageKey and
// is_enabled = true, its image_file URL is used. Otherwise the fallbackImageUrl
// renders — no error state, no empty space.
//
// Slides under the fixed navbar via -mt-16 / -mt-[72px] (same trick as
// CatalogHero). The data-hero="true" attribute triggers the Navbar's
// transparent→solid scroll transition automatically.
//
// Keep this a Server Component — it has no interactivity and we want the
// correct image URL present in the initial HTML for LCP.

interface PageHeroBannerProps {
  /** Matches hero_media.page_slug — e.g. "sellers", "buyers" */
  pageKey: string
  /** Rendered if no hero_media record exists for this pageKey */
  fallbackImageUrl: string
  /** Small-caps overlay label — e.g. "FOR SELLERS · WESTERN CORRIDOR" */
  eyebrow: string
  lang: 'en' | 'es'
}

export default async function PageHeroBanner({
  pageKey,
  fallbackImageUrl,
  eyebrow,
  lang,
}: PageHeroBannerProps) {
  // ── CMS image fetch ────────────────────────────────────────────────────────
  let imageUrl = fallbackImageUrl

  try {
    const { data: heroMedia } = await supabase
      .from('hero_media')
      .select('image_file, is_enabled')
      .eq('page_slug', pageKey)
      .maybeSingle()

    if (heroMedia?.is_enabled && heroMedia?.image_file) {
      imageUrl = heroMedia.image_file
    }
  } catch {
    // Non-fatal — fallback image renders silently
  }

  const altText =
    lang === 'es'
      ? 'Propiedad de lujo en el Corredor Oeste de Costa Rica'
      : "Luxury property in Costa Rica's Western Corridor"

  return (
    // data-hero="true" → Navbar detects this for transparent-over-hero behaviour
    <div data-hero="true" className="relative w-full -mt-16 lg:-mt-[72px]">
      <div className="relative h-[40vh] md:h-[55vh] w-full overflow-hidden bg-[#1A1A1A]">
        <Image
          src={imageUrl}
          alt={altText}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          unoptimized
        />

        {/* Dark gradient — 35–45 % opacity keeps eyebrow readable over any image */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/35 to-black/50" />

        {/* Eyebrow / page label — centred, small-caps, generous letter-spacing */}
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <p className="font-sans text-xs md:text-sm tracking-[0.3em] uppercase text-white/90 font-medium text-center">
            {eyebrow}
          </p>
        </div>
      </div>
    </div>
  )
}
