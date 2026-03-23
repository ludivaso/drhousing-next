'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/src/integrations/supabase/types'
import PropertyCard from '@/components/PropertyCard'
import { Search, SlidersHorizontal, X } from 'lucide-react'

type PropertyRow = Database['public']['Tables']['properties']['Row']

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const LOCATIONS = [
  'Escazú', 'Santa Ana', 'Ciudad Colón', 'La Guácima',
  'Hacienda Los Reyes', 'Lindora', 'Pozos', 'Rohrmoser',
]

const PROPERTY_TYPES: Record<string, string> = {
  house: 'Casa',
  condo: 'Apartamento',
  land: 'Terreno',
  commercial: 'Local Comercial',
  office: 'Oficina',
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<PropertyRow[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [type, setType] = useState('')
  const [listingType, setListingType] = useState<'all' | 'sale' | 'rent'>('all')
  const [minBeds, setMinBeds] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    supabase
      .from('properties')
      .select('*')
      .eq('hidden', false)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setProperties(data ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (search) {
        const q = search.toLowerCase()
        if (
          !p.title.toLowerCase().includes(q) &&
          !p.location_name.toLowerCase().includes(q)
        ) return false
      }
      if (location && !p.location_name.toLowerCase().includes(location.toLowerCase())) return false
      if (type && p.property_type !== type) return false
      if (listingType === 'sale' && !p.price_sale) return false
      if (listingType === 'rent' && !p.price_rent_monthly) return false
      if (minBeds > 0 && p.bedrooms < minBeds) return false
      return true
    })
  }, [properties, search, location, type, listingType, minBeds])

  const hasFilters = search || location || type || listingType !== 'all' || minBeds > 0

  function clearFilters() {
    setSearch('')
    setLocation('')
    setType('')
    setListingType('all')
    setMinBeds(0)
  }

  return (
    <main className="min-h-screen bg-background pb-16">
      {/* Header */}
      <section className="bg-[#2C2C2C] pt-12 pb-10">
        <div className="container-wide">
          <p className="font-sans text-[#C9A96E] text-sm tracking-widest uppercase mb-2">
            Portafolio
          </p>
          <h1 className="font-serif text-white text-3xl sm:text-4xl font-semibold">
            Propiedades
          </h1>
        </div>
      </section>

      {/* Search + Filters bar */}
      <section className="bg-white border-b border-[#E8E3DC] sticky top-16 z-30">
        <div className="container-wide py-3 flex flex-wrap items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
            <input
              type="text"
              placeholder="Buscar por nombre o ubicación..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm font-sans border border-[#E8E3DC] rounded-lg focus:outline-none focus:border-[#C9A96E] bg-background"
            />
          </div>

          {/* Toggle filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 font-sans text-sm px-4 py-2 rounded-lg border transition-colors ${
              showFilters || hasFilters
                ? 'border-[#C9A96E] text-[#C9A96E] bg-[#C9A96E]/5'
                : 'border-[#E8E3DC] text-[#6B6B6B] hover:border-[#C9A96E] hover:text-[#C9A96E]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {hasFilters && (
              <span className="w-2 h-2 rounded-full bg-[#C9A96E]" />
            )}
          </button>

          {/* Sale / Rent toggle */}
          <div className="flex rounded-lg border border-[#E8E3DC] overflow-hidden text-sm font-sans">
            {(['all', 'sale', 'rent'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setListingType(v)}
                className={`px-3 py-2 transition-colors ${
                  listingType === v
                    ? 'bg-[#C9A96E] text-white'
                    : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
                }`}
              >
                {v === 'all' ? 'Todos' : v === 'sale' ? 'Venta' : 'Alquiler'}
              </button>
            ))}
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 font-sans text-xs text-[#6B6B6B] hover:text-[#1A1A1A]"
            >
              <X className="w-3 h-3" /> Limpiar
            </button>
          )}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="container-wide pb-4 flex flex-wrap gap-3">
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="font-sans text-sm border border-[#E8E3DC] rounded-lg px-3 py-2 bg-background focus:outline-none focus:border-[#C9A96E] text-[#1A1A1A]"
            >
              <option value="">Todas las ubicaciones</option>
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="font-sans text-sm border border-[#E8E3DC] rounded-lg px-3 py-2 bg-background focus:outline-none focus:border-[#C9A96E] text-[#1A1A1A]"
            >
              <option value="">Todos los tipos</option>
              {Object.entries(PROPERTY_TYPES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>

            <select
              value={minBeds}
              onChange={(e) => setMinBeds(Number(e.target.value))}
              className="font-sans text-sm border border-[#E8E3DC] rounded-lg px-3 py-2 bg-background focus:outline-none focus:border-[#C9A96E] text-[#1A1A1A]"
            >
              <option value={0}>Cualquier habitaciones</option>
              <option value={1}>1+ habitaciones</option>
              <option value={2}>2+ habitaciones</option>
              <option value={3}>3+ habitaciones</option>
              <option value={4}>4+ habitaciones</option>
            </select>
          </div>
        )}
      </section>

      {/* Results */}
      <div className="container-wide py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-[10px] overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-[#E8E3DC]" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-[#E8E3DC] rounded w-1/2" />
                  <div className="h-4 bg-[#E8E3DC] rounded w-3/4" />
                  <div className="h-3 bg-[#E8E3DC] rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-serif text-[#1A1A1A] text-xl mb-2">Sin resultados</p>
            <p className="font-sans text-[#6B6B6B] text-sm mb-6">
              No se encontraron propiedades con los filtros seleccionados.
            </p>
            <button
              onClick={clearFilters}
              className="font-sans text-sm text-[#C9A96E] hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            <p className="font-sans text-[#6B6B6B] text-sm mb-6">
              {filtered.length} propiedad{filtered.length !== 1 ? 'es' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
