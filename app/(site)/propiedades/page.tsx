import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase/client'
import type { Metadata } from 'next'
import PropertyCard from '@/components/PropertyCard'
import FilterBar from '@/components/FilterBar'
import ActiveFilterTags from '@/components/ActiveFilterTags'
import type { PropertyRow } from '@/lib/supabase/queries'
import en from '@/messages/en.json'
import es from '@/messages/es.json'

function getLang(): 'es' | 'en' {
  const cookieStore = cookies()
  const val = cookieStore.get('lang')?.value
  return val === 'en' ? 'en' : 'es'
}

function t(lang: 'es' | 'en', key: string, vars?: Record<string, string | number>): string {
  const msgs: Record<string, unknown> = lang === 'en' ? en as unknown as Record<string, unknown> : es as unknown as Record<string, unknown>
  const parts = key.split('.')
  let cur: unknown = msgs
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return key
    cur = (cur as Record<string, unknown>)[part]
  }
  let str = typeof cur === 'string' ? cur : key
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v))
    })
  }
  return str
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = getLang()
  return {
    title: lang === 'en' ? 'Properties | DR Housing' : 'Propiedades | DR Housing',
    description: lang === 'en'
      ? 'Houses, apartments and land for sale and rent in Costa Rica'
      : 'Casas, apartamentos y terrenos en venta y alquiler en Costa Rica',
  }
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
  const lang = getLang()

  // Total public count (unfiltered) for "X de N" display
  // Use hidden=false only; visibility may be null for older records (treat null as public)
  const { count: totalCount } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('hidden', false)
    .or('visibility.eq.public,visibility.is.null')

  // Build filtered query
  let query = supabase
    .from('properties')
    .select('*')
    .eq('hidden', false)
    .or('visibility.eq.public,visibility.is.null')
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
  if (searchParams.status === 'for_sale')    activeTags.push({ key: 'status',    label: t(lang, 'propertyGrid.filters.forSale') })
  if (searchParams.status === 'for_rent')    activeTags.push({ key: 'status',    label: t(lang, 'propertyGrid.filters.forRent') })
  if (searchParams.tipo === 'house')         activeTags.push({ key: 'tipo',      label: t(lang, 'propertyGrid.filters.house') })
  if (searchParams.tipo === 'condo')         activeTags.push({ key: 'tipo',      label: t(lang, 'propertyGrid.filters.apartment') })
  if (searchParams.tipo === 'land')          activeTags.push({ key: 'tipo',      label: t(lang, 'propertyGrid.filters.lot') })
  if (searchParams.tipo === 'commercial')    activeTags.push({ key: 'tipo',      label: t(lang, 'propertyGrid.filters.commercial') })
  if (searchParams.camas)                    activeTags.push({ key: 'camas',     label: t(lang, 'propertyGrid.filters.bedTag', { count: searchParams.camas }) })
  if (searchParams.zona)                     activeTags.push({ key: 'zona',      label: ZONA_LABELS[searchParams.zona] ?? searchParams.zona })
  if (searchParams.comunidad === 'gated')    activeTags.push({ key: 'comunidad', label: t(lang, 'propertyGrid.filters.gated') })
  if (searchParams.comunidad === 'independent') activeTags.push({ key: 'comunidad', label: t(lang, 'propertyGrid.filters.independent') })
  if (searchParams.min)                      activeTags.push({ key: 'min',       label: t(lang, 'propertyGrid.filters.minPrice', { amount: Number(searchParams.min).toLocaleString() }) })
  if (searchParams.max)                      activeTags.push({ key: 'max',       label: t(lang, 'propertyGrid.filters.maxPrice', { amount: Number(searchParams.max).toLocaleString() }) })

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
                {t(lang, 'propertyGrid.title')}
              </h1>
              <span className="text-sm text-muted-foreground">
                {t(lang, properties.length !== 1 ? 'propertyGrid.count_other' : 'propertyGrid.count', { count: properties.length })}
                {isFiltered && totalCount != null ? ` ${t(lang, 'propertyGrid.countOfTotal', { total: totalCount })}` : ''}
              </span>
            </div>

            <Suspense>
              <ActiveFilterTags filters={activeTags} />
            </Suspense>
          </div>

          {properties.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-muted-foreground mb-4">
                {t(lang, 'propertyGrid.noMatches')}
              </p>
              <a href="/propiedades"
                className="inline-flex items-center px-5 py-2.5 rounded border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                {t(lang, 'propertyGrid.clearFiltersLink')}
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} lang={lang} />
              ))}
            </div>
          )}

        </div>
      </section>
    </>
  )
}
