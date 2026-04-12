'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { useI18n } from '@/lib/i18n/context'
import SearchAutocomplete from '@/components/properties/SearchAutocomplete'
import { ZoneDropdown } from '@/components/properties/ZoneDropdown'
import { usePropertiesFilter } from '@/components/properties/PropertiesFilterContext'
import type { PropertyRow } from '@/lib/supabase/queries'

interface FilterBarProps {
  properties?: PropertyRow[]
}

export default function FilterBar({ properties = [] }: FilterBarProps) {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const pathname     = usePathname()
  const lang         = pathname.startsWith('/es') ? 'es' : 'en'
  const { t }        = useI18n()
  const { searchQuery, setSearchQuery } = usePropertiesFilter()

  const STATUS_OPTIONS = [
    { value: '',         label: t('propertyGrid.filters.all') },
    { value: 'for_sale', label: t('propertyGrid.filters.forSale') },
    { value: 'for_rent', label: t('propertyGrid.filters.forRent') },
  ]

  const TYPE_OPTIONS = [
    { value: '',           label: t('propertyGrid.filters.all') },
    { value: 'house',      label: t('propertyGrid.filters.house') },
    { value: 'condo',      label: t('propertyGrid.filters.apartment') },
    { value: 'land',       label: t('propertyGrid.filters.lot') },
    { value: 'commercial', label: t('propertyGrid.filters.commercial') },
  ]

  const BED_OPTIONS = [
    { value: '', label: t('propertyGrid.filters.all') },
    { value: '1', label: '1+' },
    { value: '2', label: '2+' },
    { value: '3', label: '3+' },
    { value: '4', label: '4+' },
  ]

  const COMUNIDAD_OPTIONS = [
    { value: '',            label: t('propertyGrid.filters.allF') },
    { value: 'gated',       label: t('propertyGrid.filters.gated') },
    { value: 'independent', label: t('propertyGrid.filters.independent') },
  ]

  const setParam = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    const qs = params.toString()
    router.push(qs ? `/${lang}/properties?${qs}` : `/${lang}/properties`, { scroll: false })
  }, [router, searchParams, lang])

  const status    = searchParams.get('status')    ?? ''
  const tipo      = searchParams.get('tipo')      ?? ''
  const min       = searchParams.get('min')       ?? ''
  const max       = searchParams.get('max')       ?? ''
  const camas     = searchParams.get('camas')     ?? ''
  const zonaParam = searchParams.get('zona')      ?? ''
  const comunidad = searchParams.get('comunidad') ?? ''

  // Parse comma-separated zone values from URL param
  const selectedZones = zonaParam ? zonaParam.split(',').filter(Boolean) : []

  const hasFilters = !!(status || tipo || min || max || camas || zonaParam || comunidad)

  const handleZonesChange = useCallback((zones: string[]) => {
    setParam('zona', zones.length > 0 ? zones.join(',') : null)
  }, [setParam])

  // Called when user clicks a zone/location suggestion in the autocomplete
  const handleSelectZone = useCallback((zone: string) => {
    setSearchQuery('')
    setParam('zona', zone)
  }, [setSearchQuery, setParam])

  // Called when user clicks a property suggestion in the autocomplete
  const handleSelectProperty = useCallback((slug: string) => {
    router.push(`/${lang}/properties/${slug}`)
  }, [router, lang])

  const pill = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
      active
        ? 'bg-foreground text-background'
        : 'bg-secondary text-foreground hover:bg-secondary/70'
    }`

  return (
    <div className="sticky top-16 md:top-24 z-40 bg-background border-b border-[#E8E3DC]">
      <div className="container-wide py-4 space-y-3">

        {/* Row 0: Search — always first */}
        <SearchAutocomplete
          properties={properties}
          value={searchQuery}
          onChange={setSearchQuery}
          onSelectZone={handleSelectZone}
          onSelectProperty={handleSelectProperty}
          lang={lang}
        />

        {/* Row 1: Status + Type + Beds + Price */}
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">
              {t('propertyGrid.filters.statusLabel')}
            </p>
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
              {STATUS_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setParam('status', opt.value || null)}
                  className={pill(status === opt.value)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">
              {t('propertyGrid.filters.propertyType')}
            </p>
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
              {TYPE_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setParam('tipo', opt.value || null)}
                  className={pill(tipo === opt.value)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">
              {t('propertyGrid.filters.bedrooms')}
            </p>
            <div className="flex gap-1">
              {BED_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setParam('camas', opt.value || null)}
                  className={pill(camas === opt.value)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">
              {t('propertyGrid.filters.priceUSD')}
            </p>
            <div className="flex items-center gap-2">
              <input type="number" placeholder={t('propertyGrid.filters.min')} value={min}
                onChange={e => setParam('min', e.target.value || null)}
                className="w-24 px-2 py-1.5 border border-input rounded text-xs bg-background focus:outline-none" />
              <span className="text-muted-foreground text-xs">–</span>
              <input type="number" placeholder={t('propertyGrid.filters.max')} value={max}
                onChange={e => setParam('max', e.target.value || null)}
                className="w-24 px-2 py-1.5 border border-input rounded text-xs bg-background focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Row 2: Zone dropdown */}
        <div>
          <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">
            {t('propertyGrid.filters.zone')}
          </p>
          <ZoneDropdown
            selected={selectedZones}
            onChange={handleZonesChange}
            lang={lang}
          />
        </div>

        {/* Row 3: Comunidad + Clear */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">
              {t('propertyGrid.filters.communityType')}
            </p>
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
              {COMUNIDAD_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setParam('comunidad', opt.value || null)}
                  className={pill(comunidad === opt.value)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {hasFilters && (
            <button
              onClick={() => {
                setSearchQuery('')
                router.push(`/${lang}/properties`, { scroll: false })
              }}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors self-end pb-1.5">
              {t('propertyGrid.filters.clearFilters')}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
