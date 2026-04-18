'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  BedDouble,
  BellRing,
  Check,
  Download,
  Dumbbell,
  Flower2,
  Heart,
  Home,
  MapPin,
  PawPrint,
  Plane,
  Share2,
  Shield,
  ShoppingBag,
  Stethoscope,
  Sun,
  Waves,
  Wifi,
  Wine,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import HeroCarousel from '@/components/developments/HeroCarousel'
import StickySubnav from '@/components/developments/StickySubnav'
import InquiryForm from '@/components/developments/InquiryForm'
import MobileStickyBar from '@/components/developments/MobileStickyBar'
import Lightbox from '@/components/developments/Lightbox'
import {
  formatPrice,
  STATUS_LABEL,
  STATUS_STYLE,
  type Development,
} from '../data'

// ── Icon registry ────────────────────────────────────────────────────────────
// Data references lucide icons by string name; this map resolves them to the
// actual components at render time.
const AMENITY_ICONS: Record<string, LucideIcon> = {
  Waves, Shield, Home, Dumbbell, Flower2, BellRing, PawPrint, Sun, Zap, Wifi, BedDouble, Wine,
}

const FAV_KEY = 'dev_favorites'

interface Props {
  development: Development
  lang: 'en' | 'es'
}

export default function DesarrolloDetailClient({ development: dev, lang }: Props) {
  const name      = lang === 'es' ? dev.nameEs     : dev.nameEn
  const subtitle  = lang === 'es' ? dev.subtitleEs : dev.subtitleEn
  const description = lang === 'es' ? dev.descriptionEs : dev.descriptionEn
  const paragraphs = description.split('\n\n')

  const statusLabel = STATUS_LABEL[dev.status][lang]
  const statusStyle = STATUS_STYLE[dev.status]

  // ── Favorite state synced with localStorage ────────────────────────────────
  const [isFav, setIsFav] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(FAV_KEY)
      if (!raw) return
      const set = new Set<string>(JSON.parse(raw) as string[])
      setIsFav(set.has(dev.id))
    } catch {
      // ignore malformed storage
    }
  }, [dev.id])

  const toggleFav = () => {
    setIsFav((prev) => {
      const next = !prev
      try {
        const raw = window.localStorage.getItem(FAV_KEY)
        const set = new Set<string>(raw ? (JSON.parse(raw) as string[]) : [])
        if (next) set.add(dev.id)
        else set.delete(dev.id)
        window.localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(set)))
      } catch {
        // ignore
      }
      return next
    })
  }

  // ── Lightbox state ─────────────────────────────────────────────────────────
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const prev = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i - 1 + dev.gallery.length) % dev.gallery.length)),
    [dev.gallery.length],
  )
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % dev.gallery.length)),
    [dev.gallery.length],
  )
  const close = useCallback(() => setOpenIndex(null), [])

  // ── Share (Web Share with clipboard fallback) ──────────────────────────────
  const [copied, setCopied] = useState(false)
  const handleShare = async () => {
    if (typeof window === 'undefined') return
    const url = window.location.href
    const shareData = { title: name, text: subtitle, url }
    const nav = window.navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>
    }
    try {
      if (typeof nav.share === 'function') {
        await nav.share(shareData)
        return
      }
      if (nav.clipboard) {
        await nav.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      // user-cancelled or API unavailable — no-op
    }
  }

  // ── Copy ───────────────────────────────────────────────────────────────────
  const t = {
    backAll:         lang === 'es' ? '← Todos los desarrollos' : '← All Developments',
    shareLabel:      lang === 'es' ? 'Compartir' : 'Share',
    favOn:           lang === 'es' ? 'Quitar de favoritos' : 'Remove from favorites',
    favOff:          lang === 'es' ? 'Agregar a favoritos' : 'Add to favorites',
    copied:          lang === 'es' ? 'Enlace copiado' : 'Link copied',
    overviewEyebrow: lang === 'es' ? 'Resumen' : 'Overview',
    overviewTitle:   lang === 'es' ? 'Sobre el proyecto' : 'About the project',
    highlights:      lang === 'es' ? 'Puntos destacados' : 'Key highlights',
    downloadBrochure:lang === 'es' ? 'Descargar brochure' : 'Download brochure',
    deliveryLabel:   lang === 'es' ? 'Entrega' : 'Delivery',
    deliveredLabel:  lang === 'es' ? 'Entregado' : 'Delivered',
    unitsLabel:      lang === 'es' ? 'Unidades' : 'Units',
    fromLabel:       lang === 'es' ? 'Desde' : 'From',
    statusLabel:     lang === 'es' ? 'Estado' : 'Status',
    developerLabel:  lang === 'es' ? 'Desarrollador' : 'Developer',
    residencesEyebrow: lang === 'es' ? 'Residencias' : 'Residences',
    residencesTitle: lang === 'es' ? 'Unidades disponibles' : 'Available residences',
    unit:            lang === 'es' ? 'Unidad' : 'Unit',
    beds:            lang === 'es' ? 'Hab' : 'Beds',
    baths:           lang === 'es' ? 'Baños' : 'Baths',
    sqm:             'm²',
    price:           lang === 'es' ? 'Precio' : 'Price',
    availability:    lang === 'es' ? 'Disponibles' : 'Available',
    inquire:         lang === 'es' ? 'Consultar' : 'Inquire',
    galleryEyebrow:  lang === 'es' ? 'Galería' : 'Gallery',
    galleryTitle:    lang === 'es' ? 'Imágenes del proyecto' : 'Project imagery',
    amenitiesEyebrow:lang === 'es' ? 'Amenidades' : 'Amenities',
    amenitiesTitle:  lang === 'es' ? 'Lo que incluye la comunidad' : 'What the community includes',
    locationEyebrow: lang === 'es' ? 'Ubicación' : 'Location',
    locationTitle:   lang === 'es' ? 'Vecindario y entorno' : 'Neighborhood and surroundings',
    neighborhoodBody: lang === 'es'
      ? 'El proyecto se integra a un entorno establecido, con acceso cercano a servicios esenciales, opciones de educación y vida diaria. Las propiedades en esta zona han sostenido una demanda constante gracias a su conectividad y carácter residencial consolidado.'
      : 'The project sits within an established setting, with nearby access to essential services, education, and daily life. Properties in this area have sustained consistent demand thanks to connectivity and a consolidated residential character.',
    nearby:          lang === 'es' ? 'Cercanías' : 'Nearby',
    airport:         lang === 'es' ? 'Aeropuerto' : 'Airport',
    multiplaza:      'Multiplaza',
    hospital:        lang === 'es' ? 'Hospital CIMA' : 'CIMA Hospital',
    lindora:         'Lindora',
    min:             lang === 'es' ? 'min' : 'min',
    videoEyebrow:    lang === 'es' ? 'Video' : 'Video',
    videoTitle:      lang === 'es' ? 'Recorrido visual' : 'Walkthrough',
    mobileFromMsg:   lang === 'es'
      ? `Hola DR Housing, me interesa ${name}. ¿Me pueden enviar información?`
      : `Hi DR Housing, I'm interested in ${name}. Could you send me information?`,
    closeLabel:      lang === 'es' ? 'Cerrar' : 'Close',
    prevLabel:       lang === 'es' ? 'Anterior' : 'Previous',
    nextLabel:       lang === 'es' ? 'Siguiente' : 'Next',
  }

  // Formatted delivery date
  const deliveryDisplay = (() => {
    if (!dev.deliveryDate) return '—'
    const d = new Date(dev.deliveryDate)
    const month = d.toLocaleString(lang === 'es' ? 'es-CR' : 'en-US', { month: 'long' })
    return `${month.charAt(0).toUpperCase() + month.slice(1)} ${d.getFullYear()}`
  })()
  const deliveryWord = (dev.status === 'ready' || dev.status === 'sold-out')
    ? t.deliveredLabel
    : t.deliveryLabel

  // Top 6 amenities used as "highlights"
  const highlightList = dev.amenities.slice(0, 6)

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative">
        <HeroCarousel images={dev.gallery.length > 0 ? dev.gallery : [dev.heroImage]} />

        {/* Top-right action buttons (share + favorite + status) */}
        <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
          <span
            className={`text-[11px] font-sans font-medium tracking-widest uppercase px-3 py-1.5 rounded-full ${statusStyle}`}
          >
            {statusLabel}
          </span>
          <button
            type="button"
            onClick={handleShare}
            aria-label={t.shareLabel}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 flex items-center justify-center text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={toggleFav}
            aria-label={isFav ? t.favOn : t.favOff}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 flex items-center justify-center text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-[#C9A96E] text-[#C9A96E]' : ''}`} />
          </button>
        </div>

        {copied && (
          <div className="absolute top-20 right-6 z-20 bg-[#1A1A1A] text-white text-xs px-3 py-2 rounded-full">
            {t.copied}
          </div>
        )}

        {/* Bottom-left title block over the carousel */}
        <div className="absolute bottom-24 md:bottom-28 left-0 right-0 z-20 pointer-events-none">
          <div className="container-wide">
            <Link
              href={`/${lang}/desarrollos`}
              className="pointer-events-auto inline-flex items-center gap-2 text-white/80 hover:text-white font-sans text-xs tracking-widest uppercase mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] rounded"
            >
              {t.backAll}
            </Link>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white leading-[1.05] max-w-4xl">
              {name}
            </h1>
            <p className="mt-4 max-w-2xl font-sans text-sm md:text-base text-white/80 leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* ── STICKY SUBNAV ─────────────────────────────────────────────────── */}
      <StickySubnav lang={lang} />

      {/* ── OVERVIEW ──────────────────────────────────────────────────────── */}
      <section id="overview" className="py-20 md:py-28 bg-[#F5F2EE]" style={{ scrollMarginTop: '160px' }}>
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Narrative */}
            <div className="lg:col-span-7">
              <p className="font-sans text-xs tracking-[0.3em] uppercase text-[#C9A96E] mb-6">
                {t.overviewEyebrow}
              </p>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-[#1A1A1A] leading-[1.15] mb-8">
                {t.overviewTitle}
              </h2>

              <div className="space-y-6">
                {paragraphs.map((p, i) => (
                  <p key={i} className="font-sans text-base md:text-lg text-[#1A1A1A]/85 leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>

              <div className="mt-12 pt-10 border-t border-[#E8E3DC]">
                <p className="font-sans text-xs tracking-widest uppercase text-[#6B6158] mb-5">
                  {t.highlights}
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {highlightList.map((a, i) => (
                    <li key={i} className="flex items-center gap-3 font-sans text-sm text-[#1A1A1A]">
                      <Check className="w-4 h-4 text-[#C9A96E] shrink-0" />
                      {lang === 'es' ? a.es : a.en}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Project Card (sticky) */}
            <aside className="lg:col-span-5">
              <div className="lg:sticky lg:top-40 bg-white border border-[#E8E3DC] rounded-2xl p-8 md:p-10">
                <p className="font-sans text-xs tracking-widest uppercase text-[#6B6158] mb-1">
                  {t.developerLabel}
                </p>
                <p className="font-serif text-lg text-[#1A1A1A] mb-8">
                  {dev.developerName}
                </p>

                <dl className="space-y-5">
                  <Stat label={deliveryWord} value={deliveryDisplay} />
                  <Stat label={t.unitsLabel} value={String(dev.unitCount)} />
                  <Stat
                    label={t.fromLabel}
                    value={formatPrice(dev.priceFromUsd)}
                    accent
                  />
                  <Stat label={t.statusLabel} value={statusLabel} />
                </dl>

                {dev.brochureUrl && (
                  <a
                    href={dev.brochureUrl}
                    target={dev.brochureUrl.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="mt-10 inline-flex w-full items-center justify-center gap-2 px-6 py-4 rounded-lg bg-[#C9A96E] text-[#1A1A1A] font-sans text-sm font-medium tracking-widest uppercase hover:bg-[#B89558] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A]"
                  >
                    <Download className="w-4 h-4" />
                    {t.downloadBrochure}
                  </a>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── RESIDENCES ────────────────────────────────────────────────────── */}
      <section id="residences" className="py-20 md:py-28 bg-background" style={{ scrollMarginTop: '160px' }}>
        <div className="container-wide">
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-[#C9A96E] mb-4">
            {t.residencesEyebrow}
          </p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-[#1A1A1A] leading-tight mb-10">
            {t.residencesTitle}
          </h2>

          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full min-w-[780px] border-collapse">
              <thead>
                <tr className="text-left border-b border-[#E8E3DC]">
                  <Th>{t.unit}</Th>
                  <Th>{t.beds}</Th>
                  <Th>{t.baths}</Th>
                  <Th>{t.sqm}</Th>
                  <Th>{t.price}</Th>
                  <Th>{t.availability}</Th>
                  <Th> </Th>
                </tr>
              </thead>
              <tbody>
                {dev.unitTypes.map((u, i) => (
                  <tr key={i} className="border-b border-[#E8E3DC]/60">
                    <td className="py-5 pr-4 font-serif text-base text-[#1A1A1A]">
                      {lang === 'es' ? u.labelEs : u.labelEn}
                    </td>
                    <td className="py-5 pr-4 font-sans text-sm text-[#1A1A1A]">{u.beds}</td>
                    <td className="py-5 pr-4 font-sans text-sm text-[#1A1A1A]">{u.baths}</td>
                    <td className="py-5 pr-4 font-sans text-sm text-[#1A1A1A]">{u.sqm}</td>
                    <td className="py-5 pr-4 font-sans text-sm text-[#1A1A1A]">
                      {formatPrice(u.priceUsd)}
                    </td>
                    <td className="py-5 pr-4 font-sans text-sm">
                      {u.available > 0 ? (
                        <span className="text-[#1A3A2A]">
                          {u.available} {lang === 'es' ? 'de' : 'of'} {u.available}
                        </span>
                      ) : (
                        <span className="text-[#6B6158]">
                          {lang === 'es' ? 'Agotado' : 'Sold out'}
                        </span>
                      )}
                    </td>
                    <td className="py-5">
                      <a
                        href="#inquiry"
                        className="inline-flex items-center font-sans text-xs tracking-widest uppercase text-[#C9A96E] hover:text-[#B89558] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] rounded"
                      >
                        {t.inquire}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── GALLERY ───────────────────────────────────────────────────────── */}
      <section id="gallery" className="py-20 md:py-28 bg-[#F5F2EE]" style={{ scrollMarginTop: '160px' }}>
        <div className="container-wide">
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-[#C9A96E] mb-4">
            {t.galleryEyebrow}
          </p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-[#1A1A1A] leading-tight mb-10">
            {t.galleryTitle}
          </h2>

          <GalleryGrid
            images={dev.gallery}
            onOpen={setOpenIndex}
          />
        </div>
      </section>

      {/* ── AMENITIES ─────────────────────────────────────────────────────── */}
      <section id="amenities" className="py-20 md:py-28 bg-background" style={{ scrollMarginTop: '160px' }}>
        <div className="container-wide">
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-[#C9A96E] mb-4">
            {t.amenitiesEyebrow}
          </p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-[#1A1A1A] leading-tight mb-12">
            {t.amenitiesTitle}
          </h2>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dev.amenities.map((a, i) => {
              const Icon = AMENITY_ICONS[a.icon] ?? Home
              return (
                <li
                  key={i}
                  className="flex items-center gap-4 p-5 border border-[#E8E3DC] rounded-xl bg-white"
                >
                  <div className="w-11 h-11 rounded-full bg-[#F5F2EE] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#C9A96E]" />
                  </div>
                  <span className="font-sans text-sm md:text-base text-[#1A1A1A]">
                    {lang === 'es' ? a.es : a.en}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* ── LOCATION ──────────────────────────────────────────────────────── */}
      <section id="location" className="py-20 md:py-28 bg-[#F5F2EE]" style={{ scrollMarginTop: '160px' }}>
        <div className="container-wide">
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-[#C9A96E] mb-4">
            {t.locationEyebrow}
          </p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-[#1A1A1A] leading-tight mb-12">
            {t.locationTitle}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Map placeholder — styled neutral box */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#E8E3DC] bg-[#E8E3DC] flex items-center justify-center">
              {/* TODO: replace with real map embed (Mapbox/Google) once keys are provisioned */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#F5F2EE_0%,#E8E3DC_100%)]" />
              <div className="relative text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white flex items-center justify-center">
                  <MapPin className="w-7 h-7 text-[#C9A96E]" />
                </div>
                <p className="font-serif text-xl text-[#1A1A1A]">{dev.locationName}</p>
                <p className="font-sans text-xs tracking-widest uppercase text-[#6B6158] mt-1">
                  {dev.zone}
                </p>
              </div>
            </div>

            {/* Copy + nearby cards */}
            <div>
              <p className="font-sans text-base md:text-lg text-[#1A1A1A]/85 leading-relaxed mb-10">
                {t.neighborhoodBody}
              </p>

              <p className="font-sans text-xs tracking-widest uppercase text-[#6B6158] mb-5">
                {t.nearby}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <NearbyCard icon={Plane}        label={t.airport}    value={`18 ${t.min}`} />
                <NearbyCard icon={ShoppingBag}  label={t.multiplaza} value={`9 ${t.min}`} />
                <NearbyCard icon={Stethoscope}  label={t.hospital}   value={`12 ${t.min}`} />
                <NearbyCard icon={MapPin}       label={t.lindora}    value={`7 ${t.min}`} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VIDEO (optional) ──────────────────────────────────────────────── */}
      {dev.videoUrl && (
        <section className="py-20 md:py-28 bg-background" style={{ scrollMarginTop: '160px' }}>
          <div className="container-wide max-w-4xl">
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-[#C9A96E] mb-4 text-center">
              {t.videoEyebrow}
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-light text-[#1A1A1A] leading-tight text-center mb-10">
              {t.videoTitle}
            </h2>
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
              <iframe
                src={dev.videoUrl}
                title={name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        </section>
      )}

      {/* ── INQUIRY ───────────────────────────────────────────────────────── */}
      <section id="inquiry" className="py-20 md:py-28 bg-background" style={{ scrollMarginTop: '160px' }}>
        <div className="container-wide max-w-3xl">
          <InquiryForm lang={lang} devName={name} />
        </div>
      </section>

      {/* ── LIGHTBOX (portal-like via fixed) ──────────────────────────────── */}
      <Lightbox
        images={dev.gallery}
        openIndex={openIndex}
        onClose={close}
        onPrev={prev}
        onNext={next}
        closeLabel={t.closeLabel}
        prevLabel={t.prevLabel}
        nextLabel={t.nextLabel}
      />

      {/* ── MOBILE STICKY BAR ─────────────────────────────────────────────── */}
      <MobileStickyBar
        priceFromUsd={dev.priceFromUsd}
        whatsappMsg={t.mobileFromMsg}
        lang={lang}
      />
      {/* Spacer so the sticky bar doesn't cover the inquiry form on mobile */}
      <div className="md:hidden h-20" aria-hidden />
    </>
  )
}

// ── Small display helpers ────────────────────────────────────────────────────

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[#E8E3DC] pb-4 last:border-0 last:pb-0">
      <dt className="font-sans text-xs tracking-widest uppercase text-[#6B6158]">
        {label}
      </dt>
      <dd className={`font-serif text-lg ${accent ? 'text-[#C9A96E]' : 'text-[#1A1A1A]'}`}>
        {value}
      </dd>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="pb-4 pr-4 font-sans text-[11px] tracking-widest uppercase text-[#6B6158] text-left">
      {children}
    </th>
  )
}

function NearbyCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="p-4 rounded-xl border border-[#E8E3DC] bg-white flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-[#F5F2EE] flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[#C9A96E]" />
      </div>
      <div>
        <p className="font-sans text-[11px] tracking-widest uppercase text-[#6B6158]">
          {label}
        </p>
        <p className="font-serif text-sm text-[#1A1A1A]">{value}</p>
      </div>
    </div>
  )
}

// ── GalleryGrid ──────────────────────────────────────────────────────────────
// 12-image editorial grid: alternating wide + square cells for a magazine
// cadence. All images open the shared Lightbox.
function GalleryGrid({
  images,
  onOpen,
}: {
  images: string[]
  onOpen: (i: number) => void
}) {
  const cells = images.slice(0, 12)
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[220px] gap-3 md:gap-4">
      {cells.map((src, i) => {
        // Wide cells at indexes 0, 5, 8 — rest are square
        const wide = i === 0 || i === 5 || i === 8
        return (
          <button
            key={src + i}
            type="button"
            onClick={() => onOpen(i)}
            aria-label={`Image ${i + 1}`}
            className={`
              group relative overflow-hidden rounded-lg bg-neutral-100
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]
              ${wide ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'}
            `}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes={wide ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </button>
        )
      })}
    </div>
  )
}
