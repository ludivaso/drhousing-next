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
  'Alajuela', 'Heredia', 'Guanacaste',
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
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
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

  const featured = useMemo(() => properties.filter((p) => p.featured), [properties])

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (search) {
        const q = search.toLowerCase()
        if (
          !(p.title ?? '').toLowerCase().includes(q) &&
          !(p.location_name ?? '').toLowerCase().includes(q)
        )
          return false
      }
      if (location && !(p.location_name ?? '').toLowerCase().includes(location.toLowerCase()))
        return false
      if (type && p.property_type !== type) return false
      if (listingType === 'sale' && !p.price_sale) return false
      if (listingType === 'rent' && !p.price_rent_monthly) return false
      if (minBeds > 0 && (p.bedrooms ?? 0) < minBeds) return false
      if (minPrice) {
        const price = p.price_sale ?? p.price_rent_monthly ?? 0
        if (price < Number(minPrice)) return false
      }
      if (maxPrice) {
        const price = p.price_sale ?? p.price_rent_monthly ?? 0
        if (price > Number(maxPrice)) return false
      }
      return true
    })
  }, [properties, search, location, type, listingType, minBeds, minPrice, maxPrice])

  const filteredFeatured = useMemo(
    () => filtered.filter((p) => p.featured),
    [filtered]
  )
  const filteredRegular = useMemo(
    () => filtered.filter((p) => !p.featured),
    [filtered]
  )

  const hasFilters =
    search || location || type || listingType !== 'all' || minBeds > 0 || minPrice || maxPrice

  function clearFilters() {
    setSearch('')
    setLocation('')
    setType('')
    setListingType('all')
    setMinBeds(0)
    setMinPrice('')
    setMaxPrice('')
  }

  return (
    <main className="min-h-screen bg-background pb-16">
      {/* Header */}
      <section className="bg-forest-dark text-primary-foreground py-16">
        <div className="container-wide">
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold mb-4">
            Propiedades
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">
            Explore nuestra selección de propiedades de lujo en el Corredor Oeste de Costa Rica.
          </p>
        </div>
      </section>

      {/* Search + Filters bar */}
      <section className="bg-card border-b border-border sticky top-16 md:top-24 z-30">
        <div className="container-wide py-3 flex flex-wrap items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nombre o ubicación..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
            />
          </div>

          {/* Toggle filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition-colors ${
              showFilters || hasFilters
                ? 'border-gold text-gold bg-gold/5'
                : 'border-border text-muted-foreground hover:border-gold hover:text-gold'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {hasFilters && <span className="w-2 h-2 rounded-full bg-gold" />}
          </button>

          {/* Sale / Rent toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden text-sm">
            {(['all', 'sale', 'rent'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setListingType(v)}
                className={`px-3 py-2 transition-colors ${
                  listingType === v
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {v === 'all' ? 'Todos' : v === 'sale' ? 'Venta' : 'Alquiler'}
              </button>
            ))}
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
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
              className="text-sm border border-input rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Todas las ubicaciones</option>
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="text-sm border border-input rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Todos los tipos</option>
              {Object.entries(PROPERTY_TYPES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>

            <select
              value={minBeds}
              onChange={(e) => setMinBeds(Number(e.target.value))}
              className="text-sm border border-input rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value={0}>Cualquier número de hab.</option>
              <option value={1}>1+ habitaciones</option>
              <option value={2}>2+ habitaciones</option>
              <option value={3}>3+ habitaciones</option>
              <option value={4}>4+ habitaciones</option>
            </select>

            <input
              type="number"
              placeholder="Precio mínimo $"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="text-sm border border-input rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring w-36"
            />

            <input
              type="number"
              placeholder="Precio máximo $"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="text-sm border border-input rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring w-36"
            />
          </div>
        )}
      </section>

      {/* Results */}
      <div className="container-wide py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-serif text-foreground text-xl mb-2">Sin resultados</p>
            <p className="text-muted-foreground text-sm mb-6">
              No se encontraron propiedades con los filtros seleccionados.
            </p>
            <button
              onClick={clearFilters}
              className="text-sm text-primary hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            {/* Featured section */}
            {!hasFilters && featured.length > 0 && (
              <div className="mb-12">
                <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
                  Propiedades Destacadas
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredFeatured.map((p) => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </div>
              </div>
            )}

            {/* All / Regular properties */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-semibold text-foreground">
                  {hasFilters || featured.length === 0 ? 'Resultados' : 'Todas las Propiedades'}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {filtered.length} propiedad{filtered.length !== 1 ? 'es' : ''}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {(hasFilters ? filtered : filteredRegular).map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
