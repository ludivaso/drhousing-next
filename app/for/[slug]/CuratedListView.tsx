'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { MessageCircle } from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { createClient } from '@/lib/supabase/client'
import type { PropertyRow, CuratedListRow } from '@/src/integrations/supabase/types'
import PropertyCard, { PropertyCardPlain } from './PropertyCard'
import ShortlistPill from './ShortlistPill'

// ── Types ─────────────────────────────────────────────────────────────────────
type EventType =
  | 'open'
  | 'property_click'
  | 'heart'
  | 'unheart'
  | 'reorder'
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
  const lang = list.language === 'es' ? 'es' : 'en'
  const supabase = createClient()

  // ── Anonymous identity (Task 3) ───────────────────────────────────────────
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

  // ── Analytics helper (Task 7) ─────────────────────────────────────────────
  const fireEvent = useCallback(
    (
      eventType: EventType,
      propertyId?: string,
      metadata?: Record<string, unknown>,
    ) => {
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
      }).catch(() => {/* fire-and-forget — never break UX */})
    },
    [anonId, list.id],
  )

  // Fire 'open' event once after anonId is ready
  useEffect(() => {
    if (!anonId || openEventFired.current) return
    openEventFired.current = true
    fireEvent('open')
  }, [anonId, fireEvent])

  // ── Hearts + sort order (Tasks 4 & 5) ─────────────────────────────────────
  const [heartedMap, setHeartedMap]     = useState<Record<string, boolean>>({})
  const [sortOrderMap, setSortOrderMap] = useState<Record<string, number>>({})
  const [displayIds, setDisplayIds]     = useState<string[]>(
    initialProperties.map((p) => p.id),
  )

  // Hydrate from server after anonId is ready
  useEffect(() => {
    if (!anonId) return

    supabase
      .from('curated_list_actions')
      .select('property_id, hearted, sort_order')
      .eq('curated_list_id', list.id)
      .eq('anonymous_id', anonId)
      .then(({ data }) => {
        if (!data) return
        const hearts: Record<string, boolean>  = {}
        const orders: Record<string, number>   = {}
        for (const row of data) {
          hearts[row.property_id] = row.hearted
          if (row.sort_order !== null && row.sort_order !== undefined) {
            orders[row.property_id] = row.sort_order
          }
        }
        setHeartedMap(hearts)
        setSortOrderMap(orders)

        // Apply stored sort order to displayIds
        const sortedIds = [...initialProperties.map((p) => p.id)].sort((a, b) => {
          const aOrd = orders[a]
          const bOrd = orders[b]
          if (aOrd !== undefined && bOrd !== undefined) return aOrd - bOrd
          if (aOrd !== undefined) return -1
          if (bOrd !== undefined) return 1
          return 0
        })
        setDisplayIds(sortedIds)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anonId])

  // Property lookup map
  const propMap = useMemo(
    () => new Map(initialProperties.map((p) => [p.id, p])),
    [initialProperties],
  )

  // Ordered properties derived from displayIds
  const visibleProperties = useMemo(
    () =>
      displayIds
        .map((id) => propMap.get(id))
        .filter((p): p is PropertyRow => p !== undefined),
    [displayIds, propMap],
  )

  // ── Heart toggle ──────────────────────────────────────────────────────────
  const toggleHeart = useCallback(
    (propertyId: string) => {
      if (!anonId) return
      const newHearted = !heartedMap[propertyId]
      setHeartedMap((prev) => ({ ...prev, [propertyId]: newHearted }))

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

  // ── WhatsApp per-property (Task 8) ────────────────────────────────────────
  const handleWhatsApp = useCallback(
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

  // ── Property click ────────────────────────────────────────────────────────
  const handlePropertyClick = useCallback(
    (propertyId: string) => {
      fireEvent('property_click', propertyId)
    },
    [fireEvent],
  )

  // ── Drag-to-reorder (Task 5) ──────────────────────────────────────────────
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }, // desktop: small move to start drag
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 }, // mobile: long-press
    }),
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null)
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = displayIds.indexOf(String(active.id))
      const newIndex = displayIds.indexOf(String(over.id))
      if (oldIndex === -1 || newIndex === -1) return

      const newIds = arrayMove(displayIds, oldIndex, newIndex)
      setDisplayIds(newIds)

      // New sort_order = integer index in new array
      const newOrders: Record<string, number> = {}
      newIds.forEach((id, idx) => { newOrders[id] = idx })
      setSortOrderMap(newOrders)

      fireEvent('reorder', String(active.id), {
        from_index: oldIndex,
        to_index: newIndex,
        property_id: String(active.id),
      })

      if (!anonId) return
      fetch('/api/curated-list/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          curated_list_id: list.id,
          anonymous_id: anonId,
          actions: newIds.map((id, idx) => ({ property_id: id, sort_order: idx })),
        }),
      }).catch(() => {})
    },
    [anonId, displayIds, list.id, fireEvent],
  )

  // ── Reset order (Task 5) ──────────────────────────────────────────────────
  const hasCustomOrder = Object.keys(sortOrderMap).length > 0

  const resetOrder = useCallback(() => {
    if (!anonId) return
    const originalIds = initialProperties.map((p) => p.id)
    setDisplayIds(originalIds)
    setSortOrderMap({})

    // Persist nulled sort_orders
    fetch('/api/curated-list/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        curated_list_id: list.id,
        anonymous_id: anonId,
        actions: originalIds.map((id) => ({ property_id: id, sort_order: null })),
      }),
    }).catch(() => {})
  }, [anonId, initialProperties, list.id])

  // ── Shortlist pill scroll (Task 6) ────────────────────────────────────────
  const cardRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())

  const scrollToFirstHearted = useCallback(() => {
    const firstHearted = visibleProperties.find((p) => heartedMap[p.id])
    if (!firstHearted) return
    const el = cardRefs.current.get(firstHearted.id)
    if (!el) return
    const y = el.getBoundingClientRect().top + window.scrollY - 96 // 96px top offset
    window.scrollTo({ top: y, behavior: 'smooth' })
  }, [visibleProperties, heartedMap])

  const heartedCount = Object.values(heartedMap).filter(Boolean).length

  // ── Active drag overlay property ──────────────────────────────────────────
  const activeProperty = activeId ? propMap.get(activeId) : undefined

  // ── Header WhatsApp (general) ─────────────────────────────────────────────
  const waGeneralMessage = encodeURIComponent(
    lang === 'es'
      ? `Hola Diego, tengo preguntas sobre la selección que preparaste para ${list.client_name ?? 'mí'}.`
      : `Hello Diego, I have questions about the selection you prepared for ${list.client_name ?? 'me'}.`,
  )

  return (
    <>
      {/* ── Shortlist pill ─────────────────────────────────────────────────── */}
      <ShortlistPill
        count={heartedCount}
        lang={lang}
        onScrollToFirst={scrollToFirstHearted}
      />

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="border-b border-[#E8E3DC] bg-white">
        <div className="container-wide h-16 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] text-[#6B6B6B] uppercase tracking-widest font-medium">
              {lang === 'en' ? 'Private Property Selection' : 'Selección Privada de Propiedades'}
            </p>
            {list.client_name && (
              <p className="font-serif text-lg font-semibold text-[#1A1A1A] truncate">
                {lang === 'en' ? `For: ${list.client_name}` : `Para: ${list.client_name}`}
              </p>
            )}
          </div>
          <a
            href={`https://wa.me/50686540888?text=${waGeneralMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5
                       rounded-full bg-[#25D366] hover:bg-[#1EB854] text-white
                       text-sm font-medium transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
        </div>
      </header>

      {/* ── Optional advisor message ───────────────────────────────────────── */}
      {list.message && (
        <div className="bg-[#F5F2EE] border-b border-[#E8E3DC] py-4">
          <div className="container-wide">
            <p className="text-[#6B6B6B] text-sm italic leading-relaxed">
              {list.message}
            </p>
          </div>
        </div>
      )}

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="py-10 bg-[#F5F2EE]">
        <div className="container-wide">

          {/* Count + reset bar */}
          <div className="flex items-baseline justify-between gap-4 mb-6 flex-wrap">
            <p className="text-sm text-[#6B6B6B]">
              {visibleProperties.length}{' '}
              {lang === 'en'
                ? `propert${visibleProperties.length === 1 ? 'y' : 'ies'} selected for you`
                : `propiedad${visibleProperties.length === 1 ? '' : 'es'} seleccionadas para usted`}
            </p>
            {hasCustomOrder && (
              <button
                onClick={resetOrder}
                className="text-xs text-[#C9A96E] hover:text-[#B89656]
                           underline underline-offset-2 transition-colors"
              >
                {lang === 'es'
                  ? 'Restablecer al orden de Diego'
                  : "Reset to Diego's order"}
              </button>
            )}
          </div>

          {/* Drag-and-drop grid */}
          {visibleProperties.length === 0 ? (
            <div className="text-center py-20 text-[#6B6B6B]">
              {lang === 'en'
                ? 'No properties in this selection.'
                : 'No hay propiedades en esta selección.'}
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={displayIds}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleProperties.map((p) => (
                    <div
                      key={p.id}
                      ref={(el) => { cardRefs.current.set(p.id, el) }}
                    >
                      <PropertyCard
                        id={p.id}
                        property={p}
                        list={list}
                        note={propertyNotes[p.id]}
                        hearted={!!heartedMap[p.id]}
                        onToggleHeart={toggleHeart}
                        onWhatsApp={handleWhatsApp}
                        onPropertyClick={handlePropertyClick}
                      />
                    </div>
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeProperty && (
                  <PropertyCardPlain
                    property={activeProperty}
                    lang={lang}
                  />
                )}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="bg-[#2C2C2C] text-white/80 py-8">
        <div className="container-wide flex flex-col sm:flex-row items-center
                        justify-between gap-4 text-sm">
          <p>
            {lang === 'en'
              ? 'Questions about any property? Contact your advisor.'
              : '¿Preguntas sobre alguna propiedad? Comuníquese con su asesor.'}
          </p>
          <a
            href={`https://wa.me/50686540888?text=${waGeneralMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
                       bg-[#C9A96E] text-[#1A1A1A] font-medium
                       hover:bg-[#B89656] transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            {lang === 'en' ? 'Contact via WhatsApp' : 'Contactar por WhatsApp'}
          </a>
        </div>
      </footer>
    </>
  )
}
