'use client'
import { useRef, useEffect, useState, useCallback, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import type { PropertyRow } from '@/lib/supabase/queries'
import { normalizeText } from '@/lib/utils/normalize'

interface Props {
  properties: PropertyRow[]
  value: string
  onChange: (value: string) => void
  onSelectZone: (zone: string) => void
  onSelectProperty: (slug: string) => void
  lang: string
}

type SuggestionKind = 'zone' | 'location' | 'building' | 'property'

interface Suggestion {
  kind: SuggestionKind
  label: string    // raw display text (e.g. "Escazú" or "Villas del Parque")
  value: string    // zone value or slug
  count?: number   // how many properties match
  badgeLabel?: string
}

function buildSuggestions(properties: PropertyRow[], query: string, lang: string): Suggestion[] {
  if (!query || query.length < 2) return []
  const q = normalizeText(query)

  const suggestions: Suggestion[] = []

  // --- Zones ---
  const zoneCounts = new Map<string, number>()
  properties.forEach(p => {
    if (p.zone && normalizeText(p.zone).includes(q)) {
      zoneCounts.set(p.zone, (zoneCounts.get(p.zone) ?? 0) + 1)
    }
  })
  zoneCounts.forEach((count, zone) => {
    suggestions.push({ kind: 'zone', label: zone, value: zone, count, badgeLabel: lang === 'es' ? 'Zona' : 'Zone' })
  })

  // --- Locations ---
  const locCounts = new Map<string, number>()
  properties.forEach(p => {
    if (p.location_name && normalizeText(p.location_name).includes(q)) {
      locCounts.set(p.location_name, (locCounts.get(p.location_name) ?? 0) + 1)
    }
  })
  locCounts.forEach((count, loc) => {
    // Skip if already covered by a zone suggestion with same name
    if (!zoneCounts.has(loc)) {
      suggestions.push({ kind: 'location', label: loc, value: loc, count, badgeLabel: lang === 'es' ? 'Ubicación' : 'Location' })
    }
  })

  // --- Buildings ---
  const bldCounts = new Map<string, number>()
  properties.forEach(p => {
    if (p.building_name && normalizeText(p.building_name).includes(q)) {
      bldCounts.set(p.building_name, (bldCounts.get(p.building_name) ?? 0) + 1)
    }
  })
  bldCounts.forEach((count, bld) => {
    suggestions.push({ kind: 'building', label: bld, value: bld, count, badgeLabel: lang === 'es' ? 'Comunidad' : 'Community' })
  })

  // --- Individual properties (max 5) ---
  let propCount = 0
  const words = q.split(/\s+/).filter(Boolean)
  for (const p of properties) {
    if (propCount >= 5) break
    const title =
      lang === 'es'
        ? (p.title_es ?? p.title_en ?? p.title)
        : (p.title_en ?? p.title_es ?? p.title)
    const haystack = normalizeText(title)
    if (words.every(w => haystack.includes(w)) && p.slug) {
      suggestions.push({ kind: 'property', label: title, value: p.slug })
      propCount++
    }
  }

  return suggestions
}

/** Highlight the first occurrence of `query` inside `text` in bold */
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>
  const normText = normalizeText(text)
  const normQuery = normalizeText(query)
  const idx = normText.indexOf(normQuery)
  if (idx < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <strong className="font-semibold">{text.slice(idx, idx + normQuery.length)}</strong>
      {text.slice(idx + normQuery.length)}
    </>
  )
}

export default function SearchAutocomplete({
  properties,
  value,
  onChange,
  onSelectZone,
  onSelectProperty,
  lang,
}: Props) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const suggestions = buildSuggestions(properties, value, lang)
  const showDropdown = open && value.length >= 2

  // Close on outside click
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  // Reset active index when suggestions change
  useEffect(() => {
    setActiveIndex(-1)
  }, [suggestions.length, value])

  const selectSuggestion = useCallback(
    (s: Suggestion) => {
      setOpen(false)
      if (s.kind === 'property') {
        onSelectProperty(s.value)
        router.push(`/${lang}/properties/${s.value}`)
      } else {
        onSelectZone(s.value)
      }
    },
    [onSelectZone, onSelectProperty, router, lang]
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!showDropdown) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex(i => Math.min(i + 1, suggestions.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex(i => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          e.preventDefault()
          selectSuggestion(suggestions[activeIndex])
        }
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    },
    [showDropdown, suggestions, activeIndex, selectSuggestion]
  )

  const placeholder =
    lang === 'es'
      ? 'Buscar por nombre, ubicación o comunidad...'
      : 'Search by name, location, or community...'

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={e => {
            onChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => value.length >= 2 && setOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-4 py-3 text-base rounded-xl bg-[#F5F2EE] border border-[#E8E3DC] placeholder:text-[#9A9A8A] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#C9A96E] focus:border-[#C9A96E] transition-all duration-150 font-[Poppins]"
        />
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-[#E8E3DC] rounded-lg shadow-lg max-h-72 overflow-y-auto">
          {suggestions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              {lang === 'es'
                ? `Sin resultados para "${normalizeText(value)}"`
                : `No results for "${normalizeText(value)}"`}
            </p>
          ) : (
            <ul role="listbox">
              {suggestions.map((s, i) => (
                <li
                  key={`${s.kind}-${s.value}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  onMouseDown={e => {
                    e.preventDefault()
                    selectSuggestion(s)
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex items-center justify-between gap-2 px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                    i === activeIndex ? 'bg-[#F5F0E8]' : 'hover:bg-[#F5F0E8]'
                  }`}
                >
                  <span className="truncate">
                    <HighlightMatch text={s.label} query={value} />
                    {s.count != null && (
                      <span className="ml-1.5 text-muted-foreground text-xs">
                        — {s.count} {lang === 'es' ? (s.count === 1 ? 'propiedad' : 'propiedades') : (s.count === 1 ? 'property' : 'properties')}
                      </span>
                    )}
                  </span>
                  {s.badgeLabel && (
                    <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#E8E3DC] text-foreground">
                      {s.badgeLabel}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
