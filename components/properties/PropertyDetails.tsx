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
  Sofa, PawPrint, Wine, Flag, Trophy, Mountain, Home,
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
  // Canonical amenity names (from AI reassignment)
  [['furnished', 'sofa', 'furniture', 'amueblado'], Sofa],
  [['pet', 'dog', 'cat', 'animal', 'paw', 'mascotas'], PawPrint],
  [['wine', 'cellar', 'bodega_vino', 'vino'], Wine],
  [['guest_house', 'casa_de_huespedes', 'huespedes'], Home],
  [['golf', 'campo_de_golf'], Flag],
  [['tennis', 'paddle', 'racket', 'cancha_de_tenis', 'cancha_de_padel', 'deporte'], Trophy],
  [['mountain', 'montaña', 'vistas_a_la_montaña', 'valley', 'valle'], Mountain],
]

function resolveIcon(iconStr: string, category: string): LucideIcon {
  const key = (iconStr || category || '').toLowerCase().replace(/[-\s]/g, '_')
  for (const [keywords, Icon] of ICON_MAP) {
    if (keywords.some(k => key.includes(k))) return Icon
  }
  return Sparkles
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function PropertyDetails({
  residenceHighlights,
  sharedAmenities,
  exclusiveAmenities,
  lang = 'en',
}: Props) {
  const [open, setOpen] = useState(false)

  // Merge all features into one flat list
  const allFeatures = [...residenceHighlights, ...sharedAmenities, ...exclusiveAmenities]

  if (allFeatures.length === 0) return null

  const subtitle = lang === 'es' ? 'Lo Que Hace Única Esta Propiedad' : 'What Sets This Home Apart'
  const countLabel = lang === 'es'
    ? `${allFeatures.length} característica${allFeatures.length !== 1 ? 's' : ''}`
    : `${allFeatures.length} feature${allFeatures.length !== 1 ? 's' : ''}`

  return (
    <div className="bg-white border border-[#EDE8E0] rounded-2xl overflow-hidden">

      {/* Header — always visible, click to toggle */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5
          hover:bg-[#FAFAF8] active:bg-[#F5F2EE] transition-colors text-left"
        aria-expanded={open}
      >
        <div>
          <p className="font-serif text-[15px] font-medium text-[#1A1A1A] leading-tight">
            {open
              ? (lang === 'es' ? 'Haz clic para colapsar' : 'Click to collapse')
              : subtitle + ' · ' + countLabel}
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-[#9A9A8A] transition-transform duration-200 shrink-0 ml-4
            ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Feature list — hidden by default, revealed on open */}
      {open && (
        <div className="border-t border-[#EDE8E0] px-5 sm:px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            {allFeatures.map((item, i) => {
              const Icon = resolveIcon(item.icon, item.category)
              return (
                <div
                  key={`${item.label}-${i}`}
                  className="group flex items-center gap-3 py-2.5 border-b border-[#F5F2EE] last:border-0
                    hover:bg-[#FAFAF8] -mx-2 px-2 rounded-lg transition-colors cursor-default"
                >
                  <Icon className="w-[15px] h-[15px] text-[#9A9A8A] group-hover:text-[#C9A96E] transition-colors shrink-0" />
                  <span className="font-sans text-sm text-[#3D3D3D] leading-snug">{item.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
