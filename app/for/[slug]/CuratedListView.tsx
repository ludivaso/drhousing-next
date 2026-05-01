'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PropertyRow, CuratedListRow } from '@/src/integrations/supabase/types'
import { getHeroImage } from '@/lib/supabase/queries'
import CarouselCard from './PropertyCard'
import PropertyDetailPanel from './PropertyDetailPanel'
import ShortlistPill from './ShortlistPill'

// ── Types ─────────────────────────────────────────────────────────────────────
type EventType =
  | 'open'
  | 'property_click'
  | 'heart'
  | 'unheart'
  | 'share'
  | 'pdf_download'
  | 'whatsapp_click'

// ── Component ─────────────────────────────────────────────────────────────────
interface CuratedListViewProps {
  list: CuratedListRow
  initialProperties: PropertyRow[]
  propertyNotes: Record<string, string>
}

export default function CuratedListView({
  list,
  initialProperties,
  propertyNotes,
}: CuratedListViewProps) {
  const lang     = list.language === 'es' ? 'es' : 'en'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any

  // ── Anonymous identity ────────────────────────────────────────────────────
  const [anonId, setAnonId] = useState<string | null>(null)
  const openEventFired = useRef(false)

  useEffect(() => {
    const KEY = 'drh_curated_anon_id'
    let id = localStorage.getItem(KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(KEY, id)
    }
    setAnonId(id)
  }, [])

  // ── Analytics ─────────────────────────────────────────────────────────────
  const fireEvent = useCallback(
    (eventType: EventType, propertyId?: string, metadata?: Record<string, unknown>) => {
      if (!anonId) return
      fetch('/api/curated-list/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          curated_list_id: list.id,
          anonymous_id: anonId,
          event_type: eventType,
          property_id: propertyId ?? null,
          metadata: metadata ?? null,
        }),
      }).catch(() => {})
    },
    [anonId, list.id],
  )

  useEffect(() => {
    if (!anonId || openEventFired.current) return
    openEventFired.current = true
    fireEvent('open')
  }, [anonId, fireEvent])

  // ── Hearts ────────────────────────────────────────────────────────────────
  const [heartedMap, setHeartedMap] = useState<Record<string, boolean>>({})

  // Hydrate hearts from server via direct Supabase client
  // (cast to any bypasses PostgREST v12 type validation on manually-added table)
  useEffect(() => {
    if (!anonId) return
    supabase
      .from('curated_list_actions')
      .select('property_id, hearted')
      .eq('curated_list_id', list.id)
      .eq('anonymous_id', anonId)
      .then(({ data }: { data: Array<{ property_id: string; hearted: boolean }> | null }) => {
        if (!data) return
        const hearts: Record<string, boolean> = {}
        for (const row of data) {
          hearts[row.property_id] = row.hearted
        }
        setHeartedMap(hearts)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anonId])

  const toggleHeart = useCallback(
    (propertyId: string) => {
      if (!anonId) return
      const newHearted = !heartedMap[propertyId]
      setHeartedMap(prev => ({ ...prev, [propertyId]: newHearted }))
      fetch('/api/curated-list/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          curated_list_id: list.id,
          anonymous_id: anonId,
          property_id: propertyId,
          hearted: newHearted,
        }),
      }).catch(() => {})
      fireEvent(newHearted ? 'heart' : 'unheart', propertyId)
    },
    [anonId, heartedMap, list.id, fireEvent],
  )

  // ── WhatsApp ──────────────────────────────────────────────────────────────
  const whatsAppForProperty = useCallback(
    (p: PropertyRow) => {
      fireEvent('whatsapp_click', p.id)
      const refId = p.reference_id ?? p.id.slice(0, 8).toUpperCase()
      const message =
        lang === 'es'
          ? `Hola Diego, me interesa la propiedad #${refId} de la lista que preparaste para ${list.client_name ?? 'mi selección'}. ¿Podemos hablar?`
          : `Hi Diego, I'm interested in property #${refId} from the list you prepared for ${list.client_name ?? 'me'}. Can we chat?`
      window.open(
        `https://wa.me/50686540888?text=${encodeURIComponent(message)}`,
        '_blank',
        'noopener,noreferrer',
      )
    },
    [lang, list.client_name, fireEvent],
  )

  // ── Selected property + detail panel ─────────────────────────────────────
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(initialProperties[0]?.id ?? null)
  const detailRef = useRef<HTMLDivElement>(null)

  const selectProperty = useCallback(
    (id: string) => {
      setSelectedPropertyId(id)
      fireEvent('property_click', id)
      setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    },
    [fireEvent],
  )

  const selectedProperty = useMemo(
    () => initialProperties.find(p => p.id === selectedPropertyId) ?? null,
    [initialProperties, selectedPropertyId],
  )

  // ── Shortlist pill ────────────────────────────────────────────────────────
  const heartedCount = Object.values(heartedMap).filter(Boolean).length

  const scrollToFirstHearted = useCallback(() => {
    const firstHearted = initialProperties.find(p => heartedMap[p.id])
    if (!firstHearted) return
    selectProperty(firstHearted.id)
  }, [initialProperties, heartedMap, selectProperty])

  // ── Carousel drag-to-scroll (desktop) ────────────────────────────────────
  const carouselRef = useRef<HTMLDivElement>(null)
  const isDragging  = useRef(false)
  const startX      = useRef(0)
  const scrollLeft  = useRef(0)

  function handleMouseDown(e: React.MouseEvent) {
    isDragging.current = true
    startX.current     = e.pageX - (carouselRef.current?.offsetLeft ?? 0)
    scrollLeft.current = carouselRef.current?.scrollLeft ?? 0
  }
  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging.current) return
    e.preventDefault()
    const x    = e.pageX - (carouselRef.current?.offsetLeft ?? 0)
    const walk = (x - startX.current) * 1.5
    if (carouselRef.current) carouselRef.current.scrollLeft = scrollLeft.current - walk
  }
  function handleMouseUp() { isDragging.current = false }

  // ── Hero image ────────────────────────────────────────────────────────────
  const heroImage = initialProperties.length > 0
    ? getHeroImage(initialProperties[0])
    : null

  // ── Empty state ───────────────────────────────────────────────────────────
  if (initialProperties.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6 bg-[#F5F2EE]">
        <div className="text-center max-w-sm">
          <div className="w-12 h-px bg-[#C9A96E] mx-auto mb-6" />
          <p className="font-serif text-xl text-[#1A1A1A] mb-3">
            {lang === 'es'
              ? 'Esta lista no tiene propiedades aún'
              : 'This list has no properties yet'}
          </p>
          <p className="text-[#6B6B6B] text-sm leading-relaxed">
            {lang === 'es'
              ? 'Diego está preparando tu selección personalizada. Te contactará pronto.'
              : 'Diego is still curating your selection. He will reach out shortly.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <ShortlistPill count={heartedCount} lang={lang} onScrollToFirst={scrollToFirstHearted} />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        className="relative w-full overflow-hidden"
        style={{ height: 'clamp(280px, 55vh, 520px)' }}
      >
        {heroImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-[#1A1A1A]/55" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
          {/* Logo — use png with brightness filter; fail silently */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="DR Housing"
            className="h-8 mb-6 opacity-90"
            style={{ filter: 'brightness(0) invert(1)' }}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
          <h1 className="font-serif text-white text-3xl md:text-4xl lg:text-5xl
                         font-semibold leading-tight mb-3 max-w-2xl">
            {lang === 'es'
              ? `Propiedades Seleccionadas para ${list.client_name ?? ''}`
              : `Properties Selected for ${list.client_name ?? ''}`}
          </h1>
          <div className="w-10 h-px bg-[#C9A96E] mb-3" />
          <p className="text-white/70 text-sm font-light tracking-widest uppercase">
            {initialProperties.length}{' '}
            {lang === 'es' ? 'propiedades' : 'properties'}
          </p>
          {list.message && (
            <p className="mt-4 text-white/80 text-sm max-w-lg leading-relaxed italic">
              {list.message}
            </p>
          )}
        </div>
      </section>

      {/* ── Carousel ──────────────────────────────────────────────────────── */}
      <section className="py-8 bg-[#F5F2EE]">
        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory
                     px-6 pb-4 cursor-grab active:cursor-grabbing select-none"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {initialProperties.map((property) => (
            <CarouselCard
              key={property.id}
              property={property}
              isSelected={selectedPropertyId === property.id}
              hearted={!!heartedMap[property.id]}
              onSelect={() => selectProperty(property.id)}
              onHeart={() => toggleHeart(property.id)}
              onWhatsApp={() => whatsAppForProperty(property)}
              language={list.language ?? 'en'}
            />
          ))}
        </div>

        {/* Tap-hint on first render */}
        {!selectedPropertyId && (
          <p className="text-center text-[#9B9B9B] text-xs mt-2 pointer-events-none">
            {lang === 'es'
              ? 'Toca una propiedad para ver los detalles ↑'
              : 'Tap a property to see details ↑'}
          </p>
        )}
      </section>

      {/* ── Detail panel ──────────────────────────────────────────────────── */}
      <div
        ref={detailRef}
        className="bg-white"
        style={{ scrollMarginTop: '80px' }}
      >
        {selectedProperty ? (
          <PropertyDetailPanel
            property={selectedProperty}
            note={propertyNotes[selectedProperty.id] ?? null}
            language={list.language ?? 'en'}
            clientName={list.client_name ?? null}
            onWhatsApp={() => whatsAppForProperty(selectedProperty)}
            onClose={() => {
              setSelectedPropertyId(null)
              carouselRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
            }}
          />
        ) : (
          <div className="py-16 text-center text-[#9B9B9B] bg-[#F5F2EE]">
            <p className="text-sm">
              {lang === 'es'
                ? '← Toca una propiedad para ver los detalles'
                : '← Tap a property to see details'}
            </p>
          </div>
        )}
      </div>
    </>
  )
}
