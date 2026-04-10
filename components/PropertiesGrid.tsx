'use client'
import { useState } from 'react'
import PropertyCard from '@/components/PropertyCard'
import type { PropertyRow } from '@/lib/supabase/queries'

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
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = searchQuery.trim()
    ? properties.filter((p) => {
        const title =
          lang === 'es'
            ? (p.title_es || p.ai_generated_title_es || p.title_en || p.title || '')
            : (p.title_en || p.ai_generated_title_en || p.title_es || p.title || '')
        return title.toLowerCase().includes(searchQuery.toLowerCase())
      })
    : properties

  return (
    <>
      <div className="mb-4">
        <input
          type="text"
          placeholder={lang === 'es' ? 'Buscar propiedades...' : 'Search properties...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-sans text-sm"
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
