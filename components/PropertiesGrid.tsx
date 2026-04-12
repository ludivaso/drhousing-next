'use client'
import PropertyCard from '@/components/PropertyCard'
import type { PropertyRow } from '@/lib/supabase/queries'
import { sortProperties } from '@/lib/utils/sortProperties'
import { normalizeText } from '@/lib/utils/normalize'
import { usePropertiesFilter } from '@/components/properties/PropertiesFilterContext'

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
  const { searchQuery } = usePropertiesFilter()

  // Sort first (featured → featured_order → newest), then apply client-side text search
  const sorted   = sortProperties(properties)
  const filtered = sorted.filter(p => matchesSearch(p, searchQuery))

  return (
    <>
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
