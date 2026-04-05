import { Suspense } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Metadata } from 'next'
import PropertyCard from '@/components/PropertyCard'
import FilterBar from '@/components/FilterBar'
import ActiveFilterTags from '@/components/ActiveFilterTags'
import type { PropertyRow } from '@/lib/supabase/queries'

export const metadata: Metadata = {
  title: 'Propiedades',
  description: 'Casas, apartamentos y terrenos en venta y alquiler en Costa Rica',
}

export const dynamic = 'force-dynamic'

// Zone values match the `zone` TEXT column in Supabase (populated by migration SQL)
const ZONA_LABELS: Record<string, string> = {
  'Escazú':                 'Escazú',
  'Santa Ana':              'Santa Ana',
  'La Guácima':             'La Guácima',
  'Ciudad Colón':           'Ciudad Colón',
  'Rohrmoser':              'Rohrmoser',
  'La Sabana':              'La Sabana',
  'Pavas':                  'Pavas',
  'San Rafael de Alajuela': 'San Rafael',
  'Guanacaste':             'Guanacaste',
  'Pacífico Sur':           'Pacífico Sur',
  'Otras zonas':            'Otras zonas',
}

interface PageProps {
  searchParams: {
    status?:    string
    tipo?:      string
    min?:       string
    max?:       string
    camas?:     string
    zona?:      string
    comunidad?: string
  }
}

export default async function PropiedadesPage({ searchParams }: PageProps) {
  // Total public count (unfiltered) for "X de N" display
  const { count: totalCount } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('hidden', false)
    .eq('visibility', 'public')

  // Build filtered query
  let query = supabase
    .from('properties')
    .select('*')
    .eq('hidden', false)
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })

  if (searchParams.status)   query = query.eq('status', searchParams.status)
  if (searchParams.tipo)     query = query.eq('property_type', searchParams.tipo)
  if (searchParams.min)      query = query.gte('price_sale', Number(searchParams.min))
  if (searchParams.max)      query = query.lte('price_sale', Number(searchParams.max))
  if (searchParams.camas)    query = query.gte('bedrooms', Number(searchParams.camas))
  if (searchParams.zona)     query = query.eq('zone', searchParams.zona)

  // gated_community is stored in the features[] array (confirmed: 8 properties)
  if (searchParams.comunidad === 'gated') {
    query = query.contains('features', ['gated_community'])
  }
  if (searchParams.comunidad === 'independent') {
    query = query.not('features', 'cs', '{"gated_community"}')
  }

  const { data } = await query
  const properties: PropertyRow[] = data ?? []

  const isFiltered = !!(
    searchParams.status || searchParams.tipo || searchParams.min ||
    searchParams.max || searchParams.camas || searchParams.zona || searchParams.comunidad
  )

  // Build active filter tags for the removable chips
  const activeTags: { key: string; label: string }[] = []
  if (searchParams.status === 'for_sale')    activeTags.push({ key: 'status',    label: 'En Venta' })
  if (searchParams.status === 'for_rent')    activeTags.push({ key: 'status',    label: 'En Alquiler' })
  if (searchParams.tipo === 'house')         activeTags.push({ key: 'tipo',      label: 'Casa' })
  if (searchParams.tipo === 'condo')         activeTags.push({ key: 'tipo',      label: 'Apartamento' })
  if (searchParams.tipo === 'land')          activeTags.push({ key: 'tipo',      label: 'Lote' })
  if (searchParams.tipo === 'commercial')    activeTags.push({ key: 'tipo',      label: 'Comercial' })
  if (searchParams.camas)                    activeTags.push({ key: 'camas',     label: `${searchParams.camas}+ hab` })
  if (searchParams.zona)                     activeTags.push({ key: 'zona',      label: ZONA_LABELS[searchParams.zona] ?? searchParams.zona })
  if (searchParams.comunidad === 'gated')    activeTags.push({ key: 'comunidad', label: 'Condominio' })
  if (searchParams.comunidad === 'independent') activeTags.push({ key: 'comunidad', label: 'Independiente' })
  if (searchParams.min)                      activeTags.push({ key: 'min',       label: `Mín $${Number(searchParams.min).toLocaleString()}` })
  if (searchParams.max)                      activeTags.push({ key: 'max',       label: `Máx $${Number(searchParams.max).toLocaleString()}` })

  return (
    <>
      <Suspense>
        <FilterBar />
      </Suspense>

      <section className="pt-6 pb-16 bg-background">
        <div className="container-wide">

          {/* Header + active tags */}
          <div className="mb-6 space-y-3">
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
              <h1 className="font-serif text-2xl font-semibold text-foreground">
                Propiedades
              </h1>
              <span className="text-sm text-muted-foreground">
                {properties.length} propiedad{properties.length !== 1 ? 'es' : ''}
                {isFiltered && totalCount != null ? ` de ${totalCount} en total` : ''}
              </span>
            </div>

            <Suspense>
              <ActiveFilterTags filters={activeTags} />
            </Suspense>
          </div>

          {properties.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-muted-foreground mb-4">
                No encontramos propiedades con estos filtros.
              </p>
              <a href="/propiedades"
                className="inline-flex items-center px-5 py-2.5 rounded border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                Ver todas las propiedades
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

        </div>
      </section>
    </>
  )
}
