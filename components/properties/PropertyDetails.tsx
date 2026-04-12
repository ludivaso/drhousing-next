'use client'

import { useState } from 'react'
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

// ── Category labels (bilingual) ────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, { en: string; es: string }> = {
  Security:       { en: 'Security',       es: 'Seguridad' },
  Wellness:       { en: 'Wellness',       es: 'Bienestar' },
  Sports:         { en: 'Sports',         es: 'Deportes' },
  Outdoor:        { en: 'Outdoor',        es: 'Exterior' },
  Views:          { en: 'Views',          es: 'Vistas' },
  Climate:        { en: 'Climate',        es: 'Climatización' },
  Technology:     { en: 'Technology',     es: 'Tecnología' },
  Kitchen:        { en: 'Kitchen',        es: 'Cocina' },
  Interior:       { en: 'Interior',       es: 'Interior' },
  Entertainment:  { en: 'Entertainment',  es: 'Entretenimiento' },
  Services:       { en: 'Services',       es: 'Servicios' },
  Kids:           { en: 'Kids',           es: 'Área Infantil' },
  Parking:        { en: 'Parking',        es: 'Estacionamiento' },
  Rooms:          { en: 'Rooms',          es: 'Ambientes' },
  Infrastructure: { en: 'Infrastructure', es: 'Infraestructura' },
  Location:       { en: 'Location',       es: 'Ubicación' },
  General:        { en: 'Features',       es: 'Características' },
  Amenities:      { en: 'Amenities',      es: 'Amenidades' },
}

function getCategoryLabel(cat: string, lang: 'en' | 'es'): string {
  return CATEGORY_LABELS[cat]?.[lang] ?? cat
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
  [['camera', 'cctv'], Camera],
  [['wifi', 'internet', 'fiber', 'broadband', 'network'], Wifi],
  [['smart', 'automation', 'system', 'control', 'tech', 'cpu', 'electric', 'technology'], Cpu],
  [['zap', 'ev_charger', 'generator', 'backup', 'power', 'panel', 'infrastructure'], Zap],
  [['kitchen', 'chef', 'culinary', 'gourmet', 'cook'], ChefHat],
  [['applianc', 'dishwasher', 'washer', 'refrigerator', 'utensil', 'microwave'], Utensils],
  [['elevator', 'lift', 'ascensor'], ArrowUp],
  [['concierge', 'lobby', 'reception', 'bell', 'service', 'services', 'staff'], Bell],
  [['parking', 'garage', 'car', 'valet', 'vehicle'], Car],
  [['clubhouse', 'common', 'social', 'lounge', 'cowork', 'meeting', 'community', 'users'], Users],
  [['theater', 'cinema', 'movie', 'screening', 'entertainment'], Film],
  [['music', 'audio', 'sound', 'dj'], Music],
  [['ac', 'air_condition', 'climate', 'hvac', 'heat', 'cool', 'wind', 'fan', 'ventilat'], Wind],
  [['storage', 'bodega', 'warehouse', 'package'], Package],
  [['building', 'office', 'commercial'], Building2],
  [['location', 'map', 'distance', 'school', 'shop', 'restaurant', 'near'], MapPin],
  [['kids', 'children', 'playground', 'daycare', 'nursery'], Star],
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
    <div className="mb-6">
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

// ── Feature item (shared by both sections) ────────────────────────────────────

function FeatureItem({ item }: { item: PropertyFeatureItem }) {
  const Icon = resolveIcon(item.icon, item.category)
  return (
    <div className="group flex items-center gap-3 py-2.5 px-2.5 -mx-2.5 rounded-xl hover:bg-[#F5F2EE] transition-colors cursor-default">
      <Icon className="w-[15px] h-[15px] text-[#9A9A8A] group-hover:text-[#C9A96E] transition-colors shrink-0" />
      <span className="font-sans text-sm text-[#3D3D3D] leading-snug">{item.label}</span>
    </div>
  )
}

// ── Expandable card (used for both Highlights categories and Amenities) ────────

function ExpandableCard({
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
      {/* Header — accordion trigger on mobile, decorative on desktop */}
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
        {/* Chevron visible only on mobile */}
        <ChevronDown
          className={`w-4 h-4 text-[#9A9A8A] transition-transform duration-200 md:hidden shrink-0
            ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Body — hidden on mobile until expanded; always visible on md+ */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:block`}>
        <div className="px-5 sm:px-6 py-5 space-y-5">
          {grouped.map(([cat, catItems]) => (
            <div key={cat}>
              {/* Only show sub-category label when there are multiple groups */}
              {grouped.length > 1 && (
                <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9A9A8A] mb-0.5">
                  {cat}
                </p>
              )}
              <div>
                {catItems.map((item, i) => (
                  <FeatureItem key={`${item.label}-${i}`} item={item} />
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
  // Accordion state: a Set of card keys that are open on mobile
  const [openCards, setOpenCards] = useState<Set<string>>(new Set())

  const toggle = (key: string) =>
    setOpenCards(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })

  const hasHighlights = residenceHighlights.length > 0
  const hasShared     = sharedAmenities.length > 0
  const hasExclusive  = exclusiveAmenities.length > 0
  const hasAmenities  = hasShared || hasExclusive

  if (!hasHighlights && !hasAmenities) return null

  // Group highlights by category → one card per category
  const highlightGroups = groupByCategory(residenceHighlights)

  const L = {
    highlightsEyebrow: lang === 'es' ? 'Destacados de la Residencia' : 'Residence Highlights',
    highlightsTitle:   lang === 'es' ? 'Lo Que Hace Única Esta Propiedad' : 'What Sets This Home Apart',
    amenitiesEyebrow:  lang === 'es' ? 'Amenidades de Estilo de Vida'    : 'Lifestyle Amenities',
    amenitiesTitle:    lang === 'es' ? 'Diseñadas para Vivir en Excelencia' : 'Curated for Exceptional Living',
    featureCount: (n: number) =>
      lang === 'es'
        ? `${n} característica${n !== 1 ? 's' : ''}`
        : `${n} feature${n !== 1 ? 's' : ''}`,
    shared:     lang === 'es' ? 'Amenidades Comunitarias' : 'Community Amenities',
    exclusive:  lang === 'es' ? 'Amenidades Privadas'     : 'Private Amenities',
  }

  return (
    <div className="space-y-14">

      {/* ── Section 1: Residence Highlights ─────────────────────────────────── */}
      {hasHighlights && (
        <section>
          <SectionHeader eyebrow={L.highlightsEyebrow} title={L.highlightsTitle} />

          {/*
            Mobile:  1 column — cards stack vertically, each collapsible
            Tablet+: 2 columns — cards sit side by side, always expanded
          */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highlightGroups.map(([cat, items]) => {
              const cardKey = `hl-${cat}`
              return (
                <ExpandableCard
                  key={cardKey}
                  title={getCategoryLabel(cat, lang)}
                  subtitle={L.featureCount(items.length)}
                  HeaderIcon={resolveIcon('', cat)}
                  items={items}
                  isOpen={openCards.has(cardKey)}
                  onToggle={() => toggle(cardKey)}
                />
              )
            })}
          </div>
        </section>
      )}

      {/* ── Section 2: Lifestyle Amenities ──────────────────────────────────── */}
      {hasAmenities && (
        <section>
          <SectionHeader eyebrow={L.amenitiesEyebrow} title={L.amenitiesTitle} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hasShared && (
              <ExpandableCard
                title={L.shared}
                subtitle={L.featureCount(sharedAmenities.length)}
                HeaderIcon={Users}
                items={sharedAmenities}
                isOpen={openCards.has('amenities-shared')}
                onToggle={() => toggle('amenities-shared')}
              />
            )}
            {hasExclusive && (
              <ExpandableCard
                title={L.exclusive}
                subtitle={L.featureCount(exclusiveAmenities.length)}
                HeaderIcon={Star}
                items={exclusiveAmenities}
                isOpen={openCards.has('amenities-exclusive')}
                onToggle={() => toggle('amenities-exclusive')}
              />
            )}
          </div>
        </section>
      )}

    </div>
  )
}
