'use client'

import { useState, useEffect } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Waves, Dumbbell, Leaf, Flame, HeartPulse,
  Flower2, TreePine, Sun,
  Shield, Lock, Camera,
  Wifi, Cpu, Zap,
  ChefHat, Utensils,
  ArrowUp, Bell, Car,
  Users, Film, Music,
  Wind, Package,
  Building2, MapPin, Star, Sparkles,
  LayoutGrid, LayoutList,
  ChevronDown,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PropertyFeatureItem {
  label: string
  category: string
  icon: string
}

interface Props {
  residenceHighlights: PropertyFeatureItem[]
  sharedAmenities: PropertyFeatureItem[]
  exclusiveAmenities: PropertyFeatureItem[]
  lang?: 'en' | 'es'
}

// ── Icon resolution ────────────────────────────────────────────────────────────

const ICON_MAP: [string[], LucideIcon][] = [
  [['pool', 'swim', 'wave', 'water', 'jacuzzi', 'hot_tub', 'ocean', 'sea', 'beach', 'coast'], Waves],
  [['gym', 'fitness', 'workout', 'dumbbell', 'exercise', 'sport'], Dumbbell],
  [['spa', 'massage', 'relax', 'wellness', 'sauna', 'steam', 'leaf'], Leaf],
  [['bbq', 'grill', 'fire', 'fire_pit', 'flame'], Flame],
  [['yoga', 'pilates', 'health', 'meditation', 'heart'], HeartPulse],
  [['garden', 'flower', 'landscap', 'plant', 'botanical', 'tropical'], Flower2],
  [['tree', 'trail', 'forest', 'nature', 'hiking', 'park', 'outdoor', 'jungle'], TreePine],
  [['sun', 'terrace', 'rooftop', 'balcony', 'deck', 'patio', 'solar', 'views', 'vista'], Sun],
  [['security', 'guard', 'patrol', 'armed', 'surveillance', 'shield'], Shield],
  [['gated', 'gate', 'lock', 'entrance', 'access', 'key'], Lock],
  [['camera', 'cctv', 'cámara'], Camera],
  [['wifi', 'internet', 'fiber', 'broadband', 'network'], Wifi],
  [['smart', 'automation', 'system', 'control', 'tech', 'cpu', 'electric'], Cpu],
  [['zap', 'ev_charger', 'generator', 'backup', 'power', 'panel'], Zap],
  [['kitchen', 'chef', 'culinary', 'gourmet', 'cook'], ChefHat],
  [['applianc', 'dishwasher', 'washer', 'refrigerator', 'utensil', 'microwave'], Utensils],
  [['elevator', 'lift', 'ascensor'], ArrowUp],
  [['concierge', 'lobby', 'reception', 'bell', 'service', 'staff'], Bell],
  [['parking', 'garage', 'car', 'valet', 'vehicle'], Car],
  [['clubhouse', 'common', 'social', 'lounge', 'cowork', 'meeting', 'community', 'users'], Users],
  [['theater', 'cinema', 'movie', 'screening', 'entertainment'], Film],
  [['music', 'audio', 'sound', 'dj'], Music],
  [['ac', 'air_condition', 'climate', 'hvac', 'heat', 'cool', 'wind', 'fan', 'ventilat'], Wind],
  [['storage', 'bodega', 'warehouse', 'package'], Package],
  [['building', 'office', 'commercial'], Building2],
  [['location', 'map', 'distance', 'school', 'shop', 'restaurant', 'near'], MapPin],
  [['kids', 'children', 'playground', 'daycare', 'nursery', 'playground'], Star],
]

function resolveIcon(iconStr: string, category: string): LucideIcon {
  const key = (iconStr || category || '').toLowerCase().replace(/[-\s]/g, '_')
  for (const [keywords, Icon] of ICON_MAP) {
    if (keywords.some(k => key.includes(k))) return Icon
  }
  return Sparkles
}

// ── Group items by category ────────────────────────────────────────────────────

function groupByCategory(items: PropertyFeatureItem[]): [string, PropertyFeatureItem[]][] {
  const map = new Map<string, PropertyFeatureItem[]>()
  items.forEach(item => {
    const cat = item.category || 'General'
    if (!map.has(cat)) map.set(cat, [])
    map.get(cat)!.push(item)
  })
  return Array.from(map.entries())
}

// ── Section header ─────────────────────────────────────────────────────────────

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2.5 mb-2.5">
        <span className="block h-px w-6 bg-[#C9A96E] shrink-0" />
        <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9A9A8A]">
          {eyebrow}
        </span>
      </div>
      <h2 className="font-serif text-2xl sm:text-[1.75rem] font-light text-[#1A1A1A] leading-snug">
        {title}
      </h2>
    </div>
  )
}

// ── Highlight card (grid mode) ─────────────────────────────────────────────────

function HighlightGridCard({
  item,
  index,
  visible,
}: {
  item: PropertyFeatureItem
  index: number
  visible: boolean
}) {
  const Icon = resolveIcon(item.icon, item.category)
  return (
    <div
      className={`group bg-[#FAFAF8] border border-[#EDE8E0] rounded-2xl p-5 cursor-default
        hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:border-[#D4C4A8]
        transition-all duration-200
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
      style={{ transition: `opacity 0.4s ease ${index * 45}ms, transform 0.4s ease ${index * 45}ms, box-shadow 0.2s ease, border-color 0.2s ease` }}
    >
      <div
        className="w-9 h-9 rounded-xl bg-white border border-[#EDE8E0] flex items-center justify-center mb-3.5
          group-hover:border-[#C9A96E] transition-colors duration-200"
      >
        <Icon className="w-[17px] h-[17px] text-[#7A7A6A] group-hover:text-[#C9A96E] transition-colors duration-200" />
      </div>
      <p className="font-sans text-sm font-medium text-[#1A1A1A] leading-snug">{item.label}</p>
    </div>
  )
}

// ── Highlight row (list mode) ──────────────────────────────────────────────────

function HighlightListRow({
  item,
  index,
  visible,
  isLast,
}: {
  item: PropertyFeatureItem
  index: number
  visible: boolean
  isLast: boolean
}) {
  const Icon = resolveIcon(item.icon, item.category)
  return (
    <div
      className={`group flex items-center gap-4 px-4 py-3.5 hover:bg-[#FAFAF8] cursor-default transition-colors
        ${!isLast ? 'border-b border-[#F0EBE3]' : ''}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
      style={{ transition: `opacity 0.35s ease ${index * 35}ms, transform 0.35s ease ${index * 35}ms, background 0.15s ease` }}
    >
      <div
        className="w-8 h-8 rounded-xl bg-[#F5F2EE] border border-[#EDE8E0] flex items-center justify-center shrink-0
          group-hover:border-[#C9A96E] transition-colors"
      >
        <Icon className="w-4 h-4 text-[#7A7A6A] group-hover:text-[#C9A96E] transition-colors" />
      </div>
      <span className="font-sans text-sm text-[#1A1A1A] flex-1 leading-snug">{item.label}</span>
      <span className="font-sans text-[10px] font-medium uppercase tracking-wide text-[#9A9A8A] bg-[#F5F2EE] px-2 py-0.5 rounded shrink-0">
        {item.category}
      </span>
    </div>
  )
}

// ── Amenity item ───────────────────────────────────────────────────────────────

function AmenityItem({ item }: { item: PropertyFeatureItem }) {
  const Icon = resolveIcon(item.icon, item.category)
  return (
    <div className="group flex items-center gap-3 py-2.5 px-2.5 -mx-2.5 rounded-xl hover:bg-[#F5F2EE] transition-colors cursor-default">
      <Icon className="w-[15px] h-[15px] text-[#9A9A8A] group-hover:text-[#C9A96E] transition-colors shrink-0" />
      <span className="font-sans text-sm text-[#3D3D3D] leading-snug">{item.label}</span>
    </div>
  )
}

// ── Amenities card ─────────────────────────────────────────────────────────────

function AmenitiesCard({
  title,
  subtitle,
  HeaderIcon,
  items,
  isOpen,
  onToggle,
}: {
  title: string
  subtitle: string
  HeaderIcon: LucideIcon
  items: PropertyFeatureItem[]
  isOpen: boolean
  onToggle: () => void
}) {
  const grouped = groupByCategory(items)

  return (
    <div className="bg-white border border-[#EDE8E0] rounded-2xl overflow-hidden">
      {/* Card header — accordion trigger on mobile, decorative on desktop */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5
          border-b border-[#EDE8E0] hover:bg-[#FAFAF8] md:hover:bg-transparent
          active:bg-[#F5F2EE] transition-colors text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F5F2EE] flex items-center justify-center shrink-0">
            <HeaderIcon className="w-4 h-4 text-[#7A7A6A]" />
          </div>
          <div>
            <p className="font-serif text-[15px] font-medium text-[#1A1A1A] leading-tight">{title}</p>
            <p className="font-sans text-xs text-[#9A9A8A] mt-0.5">{subtitle}</p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-[#9A9A8A] transition-transform duration-250 md:hidden shrink-0
            ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Card body — collapses on mobile, always visible on md+ */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:block`}>
        <div className="px-5 sm:px-6 py-5 space-y-5">
          {grouped.map(([category, catItems]) => (
            <div key={category}>
              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9A9A8A] mb-0.5">
                {category}
              </p>
              <div>
                {catItems.map((item, i) => (
                  <AmenityItem key={`${item.label}-${i}`} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function PropertyDetails({
  residenceHighlights,
  sharedAmenities,
  exclusiveAmenities,
  lang = 'en',
}: Props) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sharedOpen, setSharedOpen] = useState(false)
  const [exclusiveOpen, setExclusiveOpen] = useState(false)
  const [visible, setVisible] = useState(false)

  // Stagger-in animation trigger after mount
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(timer)
  }, [])

  const hasHighlights = residenceHighlights.length > 0
  const hasShared     = sharedAmenities.length > 0
  const hasExclusive  = exclusiveAmenities.length > 0
  const hasAmenities  = hasShared || hasExclusive

  if (!hasHighlights && !hasAmenities) return null

  const L = {
    highlightsEyebrow: lang === 'es' ? 'Destacados de la Residencia' : 'Residence Highlights',
    highlightsTitle:   lang === 'es' ? 'Lo Que Hace Única Esta Propiedad' : 'What Sets This Home Apart',
    amenitiesEyebrow:  lang === 'es' ? 'Amenidades de Estilo de Vida' : 'Lifestyle Amenities',
    amenitiesTitle:    lang === 'es' ? 'Diseñadas para Vivir en Excelencia' : 'Curated for Exceptional Living',
    shared:            lang === 'es' ? 'Amenidades Comunitarias' : 'Community Amenities',
    sharedSub: lang === 'es'
      ? `Comunidad · ${sharedAmenities.length} características`
      : `Community · ${sharedAmenities.length} feature${sharedAmenities.length !== 1 ? 's' : ''}`,
    exclusive:  lang === 'es' ? 'Amenidades Privadas' : 'Private Amenities',
    exclusiveSub: lang === 'es'
      ? `Exclusivo · ${exclusiveAmenities.length} características`
      : `Exclusive · ${exclusiveAmenities.length} feature${exclusiveAmenities.length !== 1 ? 's' : ''}`,
    gridView: lang === 'es' ? 'Vista en cuadrícula' : 'Grid view',
    listView: lang === 'es' ? 'Vista en lista' : 'List view',
  }

  return (
    <div className="space-y-14">

      {/* ── Section 1: Residence Highlights ─────────────────────────────────── */}
      {hasHighlights && (
        <section>
          {/* Header row with view toggle */}
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="block h-px w-6 bg-[#C9A96E] shrink-0" />
                <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9A9A8A]">
                  {L.highlightsEyebrow}
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-[1.75rem] font-light text-[#1A1A1A] leading-snug">
                {L.highlightsTitle}
              </h2>
            </div>

            {/* Grid / List toggle */}
            <div className="flex items-center gap-0.5 p-1 rounded-lg bg-[#F5F2EE] border border-[#EDE8E0] shrink-0 self-start mt-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-label={L.gridView}
                className={`p-1.5 rounded-md transition-all duration-150 ${
                  viewMode === 'grid'
                    ? 'bg-white shadow-sm text-[#1A1A1A]'
                    : 'text-[#9A9A8A] hover:text-[#1A1A1A]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                aria-label={L.listView}
                className={`p-1.5 rounded-md transition-all duration-150 ${
                  viewMode === 'list'
                    ? 'bg-white shadow-sm text-[#1A1A1A]'
                    : 'text-[#9A9A8A] hover:text-[#1A1A1A]'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Grid view */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {residenceHighlights.map((item, i) => (
                <HighlightGridCard
                  key={`hl-${i}`}
                  item={item}
                  index={i}
                  visible={visible}
                />
              ))}
            </div>
          )}

          {/* List view */}
          {viewMode === 'list' && (
            <div className="border border-[#EDE8E0] rounded-2xl overflow-hidden bg-white">
              {residenceHighlights.map((item, i) => (
                <HighlightListRow
                  key={`hl-${i}`}
                  item={item}
                  index={i}
                  visible={visible}
                  isLast={i === residenceHighlights.length - 1}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Section 2: Lifestyle Amenities ──────────────────────────────────── */}
      {hasAmenities && (
        <section>
          <SectionHeader eyebrow={L.amenitiesEyebrow} title={L.amenitiesTitle} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hasShared && (
              <AmenitiesCard
                title={L.shared}
                subtitle={L.sharedSub}
                HeaderIcon={Users}
                items={sharedAmenities}
                isOpen={sharedOpen}
                onToggle={() => setSharedOpen(v => !v)}
              />
            )}
            {hasExclusive && (
              <AmenitiesCard
                title={L.exclusive}
                subtitle={L.exclusiveSub}
                HeaderIcon={Star}
                items={exclusiveAmenities}
                isOpen={exclusiveOpen}
                onToggle={() => setExclusiveOpen(v => !v)}
              />
            )}
          </div>
        </section>
      )}

    </div>
  )
}
