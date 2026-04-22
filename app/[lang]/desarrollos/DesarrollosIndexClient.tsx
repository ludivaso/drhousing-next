'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Crown, Lock, Palette, X } from 'lucide-react'
import WhatsAppCTA from '@/components/WhatsAppCTA'
import DevelopmentCard from '@/components/developments/DevelopmentCard'
import CatalogHero from '@/components/catalog/CatalogHero'
import CatalogFilterBar from '@/components/catalog/CatalogFilterBar'
import {
  developments as staticDevelopments,
  STATUS_LABEL,
  type DevStatus,
  type Development,
} from './data'

interface Props {
  lang: 'en' | 'es'
  developments?: Development[]
}

type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'delivery'

const STATUS_KEYS: DevStatus[] = ['pre-sale', 'under-construction', 'ready', 'sold-out']
const ZONE_KEYS = ['Escazú', 'Santa Ana', 'Alajuela'] as const
const BED_OPTIONS = [1, 2, 3, 4] as const
const PRICE_MAX_CAP = 5_000_000
const FAV_KEY = 'dev_favorites'

// ── DesarrollosIndexClient ───────────────────────────────────────────────────
// Filter / sort / favorite experience for the Developments index. State is
// mirrored to the URL so deep-links (e.g. /en/desarrollos?status=pre-sale)
// resolve to the correct filter view and users can share filtered sets.
export default function DesarrollosIndexClient({ lang, developments = staticDevelopments }: Props) {
  const router       = useRouter()
  const searchParams = useSearchParams()

  // ── Seed state from URL ────────────────────────────────────────────────────
  const initialStatus = useMemo(() => {
    const raw = searchParams.get('status')
    if (!raw) return new Set<DevStatus>()
    return new Set(raw.split(',').filter((s): s is DevStatus => STATUS_KEYS.includes(s as DevStatus)))
  }, [searchParams])

  const initialZone     = searchParams.get('zone') ?? 'all'
  const initialBedsStr  = searchParams.get('beds')
  const initialBeds: number | null = initialBedsStr ? Number(initialBedsStr) : null
  const initialPriceStr = searchParams.get('priceMax')
  const initialPriceMax = initialPriceStr ? Number(initialPriceStr) : PRICE_MAX_CAP
  const initialSort     = (searchParams.get('sort') as SortKey | null) ?? 'newest'

  const [statusSet, setStatusSet] = useState<Set<DevStatus>>(initialStatus)
  const [zone, setZone]           = useState<string>(initialZone)
  const [minBeds, setMinBeds]     = useState<number | null>(initialBeds)
  const [priceMax, setPriceMax]   = useState<number>(initialPriceMax)
  const [sort, setSort]           = useState<SortKey>(initialSort)

  // ── Favorites (localStorage) ───────────────────────────────────────────────
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(FAV_KEY)
      if (raw) setFavorites(new Set(JSON.parse(raw) as string[]))
    } catch {
      // ignore — malformed storage shouldn't break the page
    }
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try {
        window.localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(next)))
      } catch {
        // storage quota / private mode — not fatal
      }
      return next
    })
  }, [])

  // ── URL sync ───────────────────────────────────────────────────────────────
  // Keep the address bar aligned to the active filters. `replace` avoids
  // polluting the back stack with every slider tick.
  useEffect(() => {
    const params = new URLSearchParams()
    if (statusSet.size > 0)    params.set('status', Array.from(statusSet).join(','))
    if (zone !== 'all')        params.set('zone', zone)
    if (minBeds !== null)      params.set('beds', String(minBeds))
    if (priceMax < PRICE_MAX_CAP) params.set('priceMax', String(priceMax))
    if (sort !== 'newest')     params.set('sort', sort)
    const qs = params.toString()
    const url = qs ? `?${qs}` : window.location.pathname
    router.replace(url, { scroll: false })
  }, [statusSet, zone, minBeds, priceMax, sort, router])

  const hasActiveFilter =
    statusSet.size > 0 ||
    zone !== 'all' ||
    minBeds !== null ||
    priceMax < PRICE_MAX_CAP ||
    sort !== 'newest'

  const clearAll = () => {
    setStatusSet(new Set())
    setZone('all')
    setMinBeds(null)
    setPriceMax(PRICE_MAX_CAP)
    setSort('newest')
  }

  // ── Filter + sort ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let out = developments.filter((d) => {
      if (statusSet.size > 0 && !statusSet.has(d.status)) return false
      if (zone !== 'all' && d.zone !== zone) return false
      if (minBeds !== null) {
        const hasMatch = d.unitTypes.some((u) => u.beds >= minBeds)
        if (!hasMatch) return false
      }
      if (d.priceFromUsd > priceMax) return false
      return true
    })

    // Sort
    switch (sort) {
      case 'price-asc':
        out = out.slice().sort((a, b) => a.priceFromUsd - b.priceFromUsd)
        break
      case 'price-desc':
        out = out.slice().sort((a, b) => b.priceFromUsd - a.priceFromUsd)
        break
      case 'delivery':
        out = out.slice().sort((a, b) => {
          const ta = a.deliveryDate ? new Date(a.deliveryDate).getTime() : Infinity
          const tb = b.deliveryDate ? new Date(b.deliveryDate).getTime() : Infinity
          return ta - tb
        })
        break
      case 'newest':
      default:
        out = out.slice().sort((a, b) => a.displayOrder - b.displayOrder)
        break
    }
    return out
  }, [statusSet, zone, minBeds, priceMax, sort])

  // ── Copy dictionary ────────────────────────────────────────────────────────
  const t = {
    hero: {
      eyebrow:  lang === 'es' ? 'Nueva Construcción' : 'New Construction',
      title:    lang === 'es' ? 'Desarrollos' : 'New Developments',
      subtitle: lang === 'es'
        ? 'Construcción nueva y preventas seleccionadas en el Valle Central.'
        : 'Curated new construction and pre-sales across the Central Valley.',
    },
    filters: {
      status:    lang === 'es' ? 'Estado' : 'Status',
      zone:      lang === 'es' ? 'Zona' : 'Zone',
      all:       lang === 'es' ? 'Todas' : 'All',
      beds:      lang === 'es' ? 'Habitaciones' : 'Bedrooms',
      price:     lang === 'es' ? 'Precio máx.' : 'Max price',
      sort:      lang === 'es' ? 'Ordenar' : 'Sort',
      clear:     lang === 'es' ? 'Limpiar' : 'Clear',
    },
    sort: {
      newest:     lang === 'es' ? 'Más recientes' : 'Newest',
      priceAsc:   lang === 'es' ? 'Precio ↑' : 'Price ↑',
      priceDesc:  lang === 'es' ? 'Precio ↓' : 'Price ↓',
      delivery:   lang === 'es' ? 'Entrega' : 'Delivery',
    },
    empty: lang === 'es'
      ? 'Ningún proyecto coincide con estos filtros.'
      : 'No projects match these filters.',
    whyPresale: {
      eyebrow: lang === 'es' ? 'Por qué preventa' : 'Why Pre-Sale',
      title:   lang === 'es' ? 'Las ventajas de entrar temprano.' : 'The advantages of arriving early.',
      items: [
        {
          icon: Lock,
          title: lang === 'es' ? 'Precio Fijado' : 'Price Lock',
          body:  lang === 'es'
            ? 'Asegure el precio de hoy para una entrega entre 18 y 36 meses.'
            : "Secure today's price for delivery in 18–36 months.",
        },
        {
          icon: Palette,
          title: lang === 'es' ? 'Personalización' : 'Customization',
          body:  lang === 'es'
            ? 'Los compradores tempranos influyen en acabados y, en algunos casos, distribución.'
            : 'Early buyers influence finishes and, in some cases, floor plans.',
        },
        {
          icon: Crown,
          title: lang === 'es' ? 'Primera Selección' : 'Early Selection',
          body:  lang === 'es'
            ? 'Los mejores lotes, orientaciones y vistas se reservan primero.'
            : 'The best lots, orientations, and views are reserved first.',
        },
      ],
    },
    closing: {
      eyebrow: lang === 'es' ? 'Asesoría' : 'Advisory',
      title:   lang === 'es'
        ? 'Trabaje con nuestro equipo de nueva construcción.'
        : 'Work with our new-construction team.',
      body: lang === 'es'
        ? 'Accedemos a precios y unidades antes del lanzamiento público, y acompañamos el proceso de reserva, fideicomiso y entrega.'
        : 'We access pricing and units ahead of public release, and guide the reservation, escrow, and delivery process.',
      ctaLabel: lang === 'es' ? 'Hablar con un asesor' : 'Speak with an advisor',
      whatsappMsg: lang === 'es'
        ? 'Hola DR Housing, me gustaría recibir información sobre los desarrollos en preventa.'
        : 'Hi DR Housing, I would like information on the current new-construction offerings.',
    },
  }

  const heroImage = developments[0]?.heroImage

  return (
    <>
      <CatalogHero
        imageUrl={heroImage ?? ''}
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        subtitle={t.hero.subtitle}
        lang={lang}
      />

      {/* ── FLOATING FILTER SHELF — shared with /properties ───────────────── */}
      <CatalogFilterBar>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Status chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-sans text-[11px] tracking-widest uppercase text-[#6B6158] mr-1">
                {t.filters.status}
              </span>
              {STATUS_KEYS.map((key) => {
                const active = statusSet.has(key)
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setStatusSet((prev) => {
                        const next = new Set(prev)
                        if (next.has(key)) next.delete(key)
                        else next.add(key)
                        return next
                      })
                    }}
                    className={`
                      px-3 py-1.5 rounded-full text-[11px] tracking-widest uppercase font-sans transition-colors
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]
                      ${active
                        ? 'bg-[#1A1A1A] text-white'
                        : 'border border-[#E8E3DC] text-[#6B6158] hover:border-[#1A1A1A] hover:text-[#1A1A1A]'}
                    `}
                  >
                    {STATUS_LABEL[key][lang]}
                  </button>
                )
              })}
            </div>

            {/* Zone + beds + price + sort */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Zone */}
              <label className="flex items-center gap-2">
                <span className="sr-only">{t.filters.zone}</span>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="bg-transparent border border-[#E8E3DC] rounded-full px-3 py-1.5 text-[12px] font-sans text-[#1A1A1A] focus:outline-none focus:border-[#C9A96E]"
                >
                  <option value="all">{t.filters.zone}: {t.filters.all}</option>
                  {ZONE_KEYS.map((z) => (
                    <option key={z} value={z}>{t.filters.zone}: {z}</option>
                  ))}
                </select>
              </label>

              {/* Beds */}
              <div className="flex items-center gap-1">
                <span className="font-sans text-[11px] tracking-widest uppercase text-[#6B6158] mr-1">
                  {t.filters.beds}
                </span>
                {BED_OPTIONS.map((b) => {
                  const active = minBeds === b
                  return (
                    <button
                      key={b}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setMinBeds(active ? null : b)}
                      className={`
                        min-w-[36px] px-2.5 py-1.5 rounded-full text-[11px] font-sans transition-colors
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]
                        ${active
                          ? 'bg-[#1A1A1A] text-white'
                          : 'border border-[#E8E3DC] text-[#6B6158] hover:border-[#1A1A1A] hover:text-[#1A1A1A]'}
                      `}
                    >
                      {b}+
                    </button>
                  )
                })}
              </div>

              {/* Price slider */}
              <label className="flex items-center gap-2">
                <span className="font-sans text-[11px] tracking-widest uppercase text-[#6B6158]">
                  {t.filters.price}
                </span>
                <input
                  type="range"
                  min={500_000}
                  max={PRICE_MAX_CAP}
                  step={100_000}
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-28 accent-[#C9A96E]"
                  aria-label={t.filters.price}
                />
                <span className="font-sans text-[12px] text-[#1A1A1A] min-w-[48px] text-right">
                  {priceMax >= 1_000_000
                    ? `$${(priceMax / 1_000_000).toFixed(priceMax % 1_000_000 === 0 ? 0 : 1)}M`
                    : `$${Math.round(priceMax / 1000)}K`}
                </span>
              </label>

              {/* Sort */}
              <label className="flex items-center gap-2">
                <span className="sr-only">{t.filters.sort}</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="bg-transparent border border-[#E8E3DC] rounded-full px-3 py-1.5 text-[12px] font-sans text-[#1A1A1A] focus:outline-none focus:border-[#C9A96E]"
                >
                  <option value="newest">{t.filters.sort}: {t.sort.newest}</option>
                  <option value="price-asc">{t.filters.sort}: {t.sort.priceAsc}</option>
                  <option value="price-desc">{t.filters.sort}: {t.sort.priceDesc}</option>
                  <option value="delivery">{t.filters.sort}: {t.sort.delivery}</option>
                </select>
              </label>

              {/* Clear */}
              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex items-center gap-1 text-[11px] tracking-widest uppercase font-sans text-[#6B6158] hover:text-[#1A1A1A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] rounded"
                >
                  <X className="w-3.5 h-3.5" /> {t.filters.clear}
                </button>
              )}
            </div>
        </div>
      </CatalogFilterBar>

      {/* ── RESULTS GRID — pt-8 md:pt-12 sits below the floating filter shelf */}
      <section className="pt-8 md:pt-12 pb-16 md:pb-20 bg-[#F5F2EE]">
        <div className="container-wide">
          {filtered.length === 0 ? (
            <p className="text-center italic font-serif text-lg text-[#6B6158] py-24">
              {t.empty}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((dev: Development) => (
                <DevelopmentCard
                  key={dev.id}
                  dev={dev}
                  lang={lang}
                  isFavorite={favorites.has(dev.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── WHY PRE-SALE ──────────────────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-[#2C2C2C] text-white">
        <div className="container-wide">
          <div className="max-w-2xl mb-14">
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-[#C9A96E] mb-4">
              {t.whyPresale.eyebrow}
            </p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light leading-tight">
              {t.whyPresale.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10 rounded-xl overflow-hidden">
            {t.whyPresale.items.map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="bg-[#2C2C2C] p-8 md:p-10 min-h-[220px]">
                  <div className="w-12 h-12 rounded-full bg-[#C9A96E]/15 flex items-center justify-center mb-6">
                    <Icon className="w-5 h-5 text-[#C9A96E]" />
                  </div>
                  <h3 className="font-serif text-xl md:text-2xl font-medium mb-3">
                    {item.title}
                  </h3>
                  <p className="font-sans text-sm text-white/75 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ───────────────────────────────────────────────────── */}
      <section className="py-24 md:py-28 bg-[#1A3A2A] text-white">
        <div className="container-wide max-w-3xl text-center">
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-[#C9A96E] mb-6">
            {t.closing.eyebrow}
          </p>
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-light leading-[1.1] mb-6">
            {t.closing.title}
          </h2>
          <p className="font-sans text-base md:text-lg text-white/80 leading-relaxed mb-10 max-w-2xl mx-auto">
            {t.closing.body}
          </p>
          <div className="flex justify-center">
            <WhatsAppCTA
              message={t.closing.whatsappMsg}
              label={t.closing.ctaLabel}
              variant="footer"
            />
          </div>
        </div>
      </section>
    </>
  )
}
