'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import PropertyCard from '@/components/PropertyCard'
import SearchAutocomplete from '@/components/properties/SearchAutocomplete'
import type { PropertyRow } from '@/lib/supabase/queries'
import { sortProperties } from '@/lib/utils/sortProperties'
import { normalizeText } from '@/lib/utils/normalize'

function matchesSearch(property: PropertyRow, query: string): boolean {
  if (!query || query.length < 2) return true
  const q = normalizeText(query)
  const words = q.split(/\s+/).filter(Boolean)
  const haystack = normalizeText(
    [
      property.title,
      property.title_en,
      property.title_es,
      property.location_name,
      property.building_name,
      property.description,
      property.zone ?? '',
    ]
      .filter(Boolean)
      .join(' ')
  )
  return words.every(word => haystack.includes(word))
}

interface Props {
  properties: PropertyRow[]
  lang: 'es' | 'en'
  noMatchesText: string
  clearFiltersHref: string
  clearFiltersText: string
}

export default function PropertiesGrid({
  properties,
  lang,
  noMatchesText,
  clearFiltersHref,
  clearFiltersText,
}: Props) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  // Sort first (featured → featured_order → newest), then apply client-side search
  const sorted = sortProperties(properties)
  const filtered = sorted.filter(p => matchesSearch(p, searchQuery))

  const handleSelectZone = useCallback(
    (zone: string) => {
      setSearchQuery('')
      router.push(`/${lang}/properties?zona=${encodeURIComponent(zone)}`, { scroll: false })
    },
    [router, lang]
  )

  const handleSelectProperty = useCallback(
    (slug: string) => {
      router.push(`/${lang}/properties/${slug}`)
    },
    [router, lang]
  )

  return (
    <>
      <div className="mb-4">
        <SearchAutocomplete
          properties={properties}
          value={searchQuery}
          onChange={setSearchQuery}
          onSelectZone={handleSelectZone}
          onSelectProperty={handleSelectProperty}
          lang={lang}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground mb-4">{noMatchesText}</p>
          <a
            href={clearFiltersHref}
            className="inline-flex items-center px-5 py-2.5 rounded border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            {clearFiltersText}
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <PropertyCard key={p.id} property={p} lang={lang} />
          ))}
        </div>
      )}
    </>
  )
}
