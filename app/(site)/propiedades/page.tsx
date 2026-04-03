'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/src/integrations/supabase/types'
import PropertyCard from '@/components/PropertyCard'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

type PropertyRow = Database['public']['Tables']['properties']['Row']

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
)

const LOCATIONS = [
  'Escazú', 'Santa Ana', 'Ciudad Colón', 'La Guácima',
  'Hacienda Los Reyes', 'Lindora', 'Pozos', 'Rohrmoser',
  'Alajuela', 'Heredia', 'Guanacaste',
]

function PropiedadesPageInner() {
  const { t, lang } = useI18n()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [properties, setProperties] = useState<PropertyRow[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [location, setLocation] = useState(searchParams.get('location') ?? '')
  const [type, setType] = useState(searchParams.get('type') ?? '')
  const [listingType, setListingType] = useState<'all' | 'sale' | 'rent'>(
    (searchParams.get('listing') as 'all' | 'sale' | 'rent') ?? 'all'
  )
  const [minBeds, setMinBeds] = useState(Number(searchParams.get('beds') ?? 0))
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '')
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

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (location) params.set('location', location)
    if (type) params.set('type', type)
    if (listingType !== 'all') params.set('listing', listingType)
    if (minBeds > 0) params.set('beds', String(minBeds))
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    const qs = params.toString()
    router.replace(qs ? `/propiedades?${qs}` : '/propiedades', { scroll: false })
  }, [search, location, type, listingType, minBeds, minPrice, maxPrice, router])

  const PROPERTY_TYPES = useMemo(() => ({
    house:      lang === 'en' ? 'House'            : 'Casa',
    condo:      lang === 'en' ? 'Apartment'        : 'Apartamento',
    land:       lang === 'en' ? 'Land'             : 'Terreno',
    commercial: lang === 'en' ? 'Commercial'       : 'Local Comercial',
    office:     lang === 'en' ? 'Office'           : 'Oficina',
  }), [lang])

  const featured = useMemo(() => properties.filter((p) => p.featured), [properties])

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (search) {
        const q = search.toLowerCase()
        const titleToSearch = (lang === 'en' && (p as any).title_en) ? (p as any).title_en : p.title
        if (!(titleToSearch ?? '').toLowerCase().includes(q) && !(p.location_name ?? '').toLowerCase().includes(q))
          return false
      }
      if (location && !(p.location_name ?? '').toLowerCase().includes(location.toLowerCase())) return false
      if (type && p.property_type !== type) return false
      if (listingType === 'sale' && !p.price_sale) return false
      if (listingType === 'rent' && !p.price_rent_monthly) return false
      if (minBeds > 0 && (p.bedrooms ?? 0) < minBeds) return false
      if (minPrice) { const price = p.price_sale ?? p.price_rent_monthly ?? 0; if (price < Number(minPrice)) return false }
      if (maxPrice) { const price = p.price_sale ?? p.price_rent_monthly ?? 0; if (price > Number(maxPrice)) return false }
      return true
    })
  }, [properties, search, location, type, listingType, minBeds, minPrice, maxPrice, lang])

  const filteredFeatured = useMemo(() => filtered.filter((p) => p.featured), [filtered])
  const filteredRegular  = useMemo(() => filtered.filter((p) => !p.featured), [filtered])
  const hasFilters = search || location || type || listingType !== 'all' || minBeds > 0 || minPrice || maxPrice

  function clearFilters() {
    setSearch('')
    setLocation('')
    setType('')
    setListingType('all')
    setMinBeds(0)
    setMinPrice('')
    setMaxPrice('')
  }

  const toggleLabels = {
    all:  lang === 'en' ? 'All'      : 'Todos',
    sale: lang === 'en' ? 'For Sale' : 'Venta',
    rent: lang === 'en' ? 'Rent'     : 'Alquiler',
  }

  return (
    <main className="min-h-screen bg-background pb-16">
      {/* Header */}
      <section className="bg-forest-dark text-primary-foreground py-16">
        <div className="container-wide">
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold mb-4">
            {lang === 'en' ? 'Property Portfolio' : 'Propiedades'}
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">
            {lang === 'en'
              ? 'Explore our curated selection of luxury properties in Costa Rica\'s West Corridor.'
              : 'Explore nuestra selección de propiedades de lujo en el Corredor Oeste de Costa Rica.'}
          </p>
        </div>
      </section>

      {/* Search + Filters bar */}
      <section className="bg-card border-b border-border sticky top-16 md:top-24 z-30">
        <div className="container-wide py-3 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('properties.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition-colors ${
              showFilters || hasFilters
                ? 'border-gold text-gold bg-gold/5'
                : 'border-border text-muted-foreground hover:border-gold hover:text-gold'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {lang === 'en' ? 'Filters' : 'Filtros'}
            {hasFilters && <span className="w-2 h-2 rounded-full bg-gold" />}
          </button>

          <div className="flex rounded-lg border border-border overflow-hidden text-sm">
            {(['all', 'sale', 'rent'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setListingType(v)}
                className={`px-3 py-2 transition-colors ${
                  listingType === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {toggleLabels[v]}
              </button>
            ))}
          </div>

          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <X className="w-3 h-3" /> {lang === 'en' ? 'Clear' : 'Limpiar'}
            </button>
          )}
        </div>

        {showFilters && (
          <div className="container-wide pb-4 flex flex-wrap gap-3">
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="text-sm border border-input rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">{lang === 'en' ? 'All Locations' : 'Todas las ubicaciones'}</option>
              {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="text-sm border border-input rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">{lang === 'en' ? 'All Types' : 'Todos los tipos'}</option>
              {Object.entries(PROPERTY_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>

            <select
              value={minBeds}
              onChange={(e) => setMinBeds(Number(e.target.value))}
              className="text-sm border border-input rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value={0}>{lang === 'en' ? 'Any bedrooms' : 'Cualquier número de hab.'}</option>
              <option value={1}>{lang === 'en' ? '1+ bedrooms' : '1+ habitaciones'}</option>
              <option value={2}>{lang === 'en' ? '2+ bedrooms' : '2+ habitaciones'}</option>
              <option value={3}>{lang === 'en' ? '3+ bedrooms' : '3+ habitaciones'}</option>
              <option value={4}>{lang === 'en' ? '4+ bedrooms' : '4+ habitaciones'}</option>
            </select>

            <input
              type="number"
              placeholder={lang === 'en' ? 'Min price $' : 'Precio mínimo $'}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="text-sm border border-input rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring w-36"
            />
            <input
              type="number"
              placeholder={lang === 'en' ? 'Max price $' : 'Precio máximo $'}
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
            <p className="font-serif text-foreground text-xl mb-2">
              {t('propertyGrid.noneTitle')}
            </p>
            <p className="text-muted-foreground text-sm mb-6">
              {t('propertyGrid.noMatches')}
            </p>
            <button onClick={clearFilters} className="text-sm text-primary hover:underline">
              {t('propertyGrid.clearFilters')}
            </button>
          </div>
        ) : (
          <>
            {!hasFilters && featured.length > 0 && (
              <div className="mb-12">
                <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
                  {t('propertyGrid.featuredTitle')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredFeatured.map((p) => <PropertyCard key={p.id} property={p} />)}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-semibold text-foreground">
                  {hasFilters || featured.length === 0
                    ? (lang === 'en' ? 'Results' : 'Resultados')
                    : t('propertyGrid.allTitle')}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {filtered.length} {lang === 'en' ? `propert${filtered.length !== 1 ? 'ies' : 'y'}` : `propiedad${filtered.length !== 1 ? 'es' : ''}`}
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

export default function PropiedadesPage() {
  return (
    <Suspense fallback={<div className="section-padding container-wide text-muted-foreground">Cargando...</div>}>
      <PropiedadesPageInner />
    </Suspense>
  )
}
