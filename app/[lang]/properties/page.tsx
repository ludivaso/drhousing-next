import { Suspense } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Metadata } from 'next'
import FilterBar from '@/components/FilterBar'
import ActiveFilterTags from '@/components/ActiveFilterTags'
import PropertiesGrid from '@/components/PropertiesGrid'
import type { PropertyRow } from '@/lib/supabase/queries'
import { sortProperties } from '@/lib/utils/sortProperties'
import en from '@/messages/en.json'
import es from '@/messages/es.json'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const lang = params.lang === 'es' ? 'es' : 'en'
  return {
    title: lang === 'en' ? 'Properties | DR Housing' : 'Propiedades | DR Housing',
    description: lang === 'en'
      ? 'Houses, apartments and land for sale and rent in Costa Rica'
      : 'Casas, apartamentos y terrenos en venta y alquiler en Costa Rica',
  }
}

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
  params: { lang: string }
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

export default async function PropiedadesPage({ params, searchParams }: PageProps) {
  const lang = params.lang === 'es' ? 'es' : 'en'

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
    .order('featured', { ascending: false })
    .order('featured_order', { ascending: true, nullsFirst: false })
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
  const properties: PropertyRow[] = sortProperties(data ?? [])

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

      <section id="filters" className="pt-24 md:pt-28 pb-16 bg-background" style={{ scrollMarginTop: '96px' }}>
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

          <PropertiesGrid
            properties={properties}
            lang={lang}
            noMatchesText={t(lang, 'propertyGrid.noMatches')}
            clearFiltersHref={`/${lang}/properties`}
            clearFiltersText={t(lang, 'propertyGrid.clearFiltersLink')}
          />

        </div>
      </section>
    </>
  )
}
