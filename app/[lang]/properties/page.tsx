import { Suspense } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase/client'
import type { Metadata } from 'next'
import FilterBar from '@/components/FilterBar'
import ActiveFilterTags from '@/components/ActiveFilterTags'
import PropertiesGrid from '@/components/PropertiesGrid'
import { PropertiesFilterProvider } from '@/components/properties/PropertiesFilterContext'
import type { PropertyRow } from '@/lib/supabase/queries'
import { sortProperties } from '@/lib/utils/sortProperties'
import en from '@/messages/en.json'
import es from '@/messages/es.json'

// ── Hero copy + image ────────────────────────────────────────────────────────
// Mirrors the Desarrollos hero treatment: full-bleed architectural photo, dark
// gradient overlay, left-aligned gold eyebrow + serif headline + subtitle. If
// we want this editable later, move to site_settings (same pattern as the
// homepage hero_video_url key).
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1920&q=80'

const HERO_COPY = {
  es: {
    eyebrow:  'Portafolio',
    title:    'Propiedades seleccionadas\nen Costa Rica.',
    subtitle: 'Residencias, terrenos y oportunidades de inversión en el Valle Central y el Pacífico. Cada propiedad, curada para los criterios más exigentes.',
  },
  en: {
    eyebrow:  'Portfolio',
    title:    'A curated portfolio\nof Costa Rican homes.',
    subtitle: 'Residences, land, and investment opportunities across the Central Valley and the Pacific coast. Every property, chosen against the highest standards.',
  },
} as const

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

// Zone label map for active filter chips
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
    zona?:      string  // comma-separated zone values for multi-select
    comunidad?: string
  }
}

export default async function PropiedadesPage({ params, searchParams }: PageProps) {
  const lang = params.lang === 'es' ? 'es' : 'en'

  // Total public count (unfiltered) for "X de N" display
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

  // Support multi-select zones: comma-separated DB zone values
  if (searchParams.zona) {
    const zones = searchParams.zona.split(',').filter(Boolean)
    if (zones.length === 1) {
      query = query.eq('zone', zones[0])
    } else if (zones.length > 1) {
      query = query.in('zone', zones)
    }
  }

  // gated_community is stored in the features[] array
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

  // Build active filter tags
  const activeTags: { key: string; label: string }[] = []
  if (searchParams.status === 'for_sale')    activeTags.push({ key: 'status',    label: t(lang, 'propertyGrid.filters.forSale') })
  if (searchParams.status === 'for_rent')    activeTags.push({ key: 'status',    label: t(lang, 'propertyGrid.filters.forRent') })
  if (searchParams.tipo === 'house')         activeTags.push({ key: 'tipo',      label: t(lang, 'propertyGrid.filters.house') })
  if (searchParams.tipo === 'condo')         activeTags.push({ key: 'tipo',      label: t(lang, 'propertyGrid.filters.apartment') })
  if (searchParams.tipo === 'land')          activeTags.push({ key: 'tipo',      label: t(lang, 'propertyGrid.filters.lot') })
  if (searchParams.tipo === 'commercial')    activeTags.push({ key: 'tipo',      label: t(lang, 'propertyGrid.filters.commercial') })
  if (searchParams.camas)                    activeTags.push({ key: 'camas',     label: t(lang, 'propertyGrid.filters.bedTag', { count: searchParams.camas }) })
  if (searchParams.zona) {
    // Show all selected zones as one chip: "Escazú, Santa Ana"
    const zoneLabels = searchParams.zona
      .split(',')
      .filter(Boolean)
      .map(z => ZONA_LABELS[z] ?? z)
      .join(', ')
    activeTags.push({ key: 'zona', label: zoneLabels })
  }
  if (searchParams.comunidad === 'gated')    activeTags.push({ key: 'comunidad', label: t(lang, 'propertyGrid.filters.gated') })
  if (searchParams.comunidad === 'independent') activeTags.push({ key: 'comunidad', label: t(lang, 'propertyGrid.filters.independent') })
  if (searchParams.min)                      activeTags.push({ key: 'min',       label: t(lang, 'propertyGrid.filters.minPrice', { amount: Number(searchParams.min).toLocaleString() }) })
  if (searchParams.max)                      activeTags.push({ key: 'max',       label: t(lang, 'propertyGrid.filters.maxPrice', { amount: Number(searchParams.max).toLocaleString() }) })

  const hero = HERO_COPY[lang]

  return (
    <PropertiesFilterProvider>
      {/* ── HERO ────────────────────────────────────────────────────────────
          Full-bleed architectural image, left-aligned gold eyebrow + serif
          headline + subtitle. Matches the Desarrollos hero so the two main
          shopping surfaces feel like one product. */}
      <section className="relative min-h-[70vh] flex items-end overflow-hidden bg-[#1A1A1A]">
        <Image
          src={HERO_IMAGE}
          alt={hero.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20" />

        <div className="relative z-10 container-wide text-white py-20 md:py-24">
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-[#C9A96E] mb-6">
            {hero.eyebrow}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light leading-[1.05] max-w-3xl whitespace-pre-line">
            {hero.title}
          </h1>
          <p className="mt-6 max-w-xl font-sans text-base md:text-lg text-white/85 leading-relaxed">
            {hero.subtitle}
          </p>
        </div>
      </section>

      <Suspense>
        <FilterBar properties={properties} />
      </Suspense>

      {/* pt-6 gives a small comfortable gap below the filter bar.
          The filter bar is now sticky (top-16 md:top-24), so this padding
          also prevents the heading from being obscured on scroll. */}
      <section id="filters" className="pt-6 pb-16 bg-background" style={{ scrollMarginTop: '96px' }}>
        <div className="container-wide">

          {/* Result count + active tags — the hero above carries the page
              title, so we demote the Properties heading to a subtle h2. */}
          <div className="mb-6 space-y-3">
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
              <h2 className="font-sans text-xs tracking-[0.3em] uppercase text-[#6B6158]">
                {t(lang, 'propertyGrid.title')}
              </h2>
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
    </PropertiesFilterProvider>
  )
}
