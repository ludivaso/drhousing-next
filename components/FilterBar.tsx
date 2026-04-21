'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState, useRef, useEffect } from 'react'
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'
import SearchAutocomplete from '@/components/properties/SearchAutocomplete'
import { ZoneDropdown } from '@/components/properties/ZoneDropdown'
import { usePropertiesFilter } from '@/components/properties/PropertiesFilterContext'
import CatalogFilterBar from '@/components/catalog/CatalogFilterBar'
import type { PropertyRow } from '@/lib/supabase/queries'

// ── Reusable single-select dropdown ──────────────────────────────────────────

interface DropdownOption { value: string; label: string }

function FilterDropdown({
  label, options, value, onChange,
}: {
  label: string
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  const selected = options.find((o) => o.value === value)
  const isActive = value !== ''

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className={`
          inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium
          border whitespace-nowrap transition-all duration-150 cursor-pointer
          ${isActive
            ? 'bg-[#1A3A2A] text-white border-[#1A3A2A]'
            : 'bg-white text-[#1A1A1A] border-[#E8E3DC] hover:border-[#C9A96E]'
          }
        `}
      >
        {isActive ? (
          <>
            <span>{label}: {selected?.label}</span>
            <X
              className="h-3.5 w-3.5 shrink-0"
              onClick={(e) => { e.stopPropagation(); onChange(''); setOpen(false) }}
            />
          </>
        ) : (
          <>
            <span>{label}</span>
            <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 min-w-[180px] max-h-[280px] overflow-y-auto
                        bg-white border border-[#E8E3DC] rounded-xl shadow-lg z-50 py-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`
                w-full text-left px-4 py-2.5 text-sm transition-colors
                ${opt.value === value
                  ? 'bg-[#F5F2EE] text-[#1A3A2A] font-medium'
                  : 'text-[#1A1A1A] hover:bg-[#F5F2EE]'
                }
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Thin vertical divider ─────────────────────────────────────────────────────

function Divider() {
  return <div className="shrink-0 w-px h-5 bg-[#E8E3DC] mx-1" />
}

// ── Main FilterBar ────────────────────────────────────────────────────────────

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
  const [filtersOpen, setFiltersOpen]   = useState(false)

  const STATUS_OPTIONS: DropdownOption[] = [
    { value: '',         label: t('propertyGrid.filters.all') },
    { value: 'for_sale', label: t('propertyGrid.filters.forSale') },
    { value: 'for_rent', label: t('propertyGrid.filters.forRent') },
  ]
  const TYPE_OPTIONS: DropdownOption[] = [
    { value: '',           label: t('propertyGrid.filters.all') },
    { value: 'house',      label: t('propertyGrid.filters.house') },
    { value: 'condo',      label: t('propertyGrid.filters.apartment') },
    { value: 'land',       label: t('propertyGrid.filters.lot') },
    { value: 'commercial', label: t('propertyGrid.filters.commercial') },
  ]
  const BED_OPTIONS: DropdownOption[] = [
    { value: '',  label: t('propertyGrid.filters.all') },
    { value: '1', label: '1+' },
    { value: '2', label: '2+' },
    { value: '3', label: '3+' },
    { value: '4', label: '4+' },
  ]
  const COMUNIDAD_OPTIONS: DropdownOption[] = [
    { value: '',            label: t('propertyGrid.filters.allF') },
    { value: 'gated',       label: t('propertyGrid.filters.gated') },
    { value: 'independent', label: t('propertyGrid.filters.independent') },
  ]

  const setParam = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === '') params.delete(key)
    else params.set(key, value)
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

  const handleStatusChange = useCallback((v: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (v === '') params.delete('status')
    else params.set('status', v)
    if (v !== status) { params.delete('min'); params.delete('max') }
    const qs = params.toString()
    router.push(qs ? `/${lang}/properties?${qs}` : `/${lang}/properties`, { scroll: false })
  }, [router, searchParams, status, lang])

  const pricePresentation = (() => {
    if (status === 'for_rent') return {
      minPlaceholder: '$1,500', maxPlaceholder: '$5,000',
      minLabel: lang === 'en' ? 'Rent min' : 'Renta mín',
      maxLabel: lang === 'en' ? 'Rent max' : 'Renta máx',
      suffix: lang === 'en' ? '/mo' : '/mes',
    }
    if (status === 'for_sale') return {
      minPlaceholder: '$250k', maxPlaceholder: '$2M',
      minLabel: lang === 'en' ? 'Sale min' : 'Venta mín',
      maxLabel: lang === 'en' ? 'Sale max' : 'Venta máx',
      suffix: '',
    }
    return {
      minPlaceholder: `$ ${t('propertyGrid.filters.min')}`,
      maxPlaceholder: `$ ${t('propertyGrid.filters.max')}`,
      minLabel: `$ ${t('propertyGrid.filters.min')}`,
      maxLabel: `$ ${t('propertyGrid.filters.max')}`,
      suffix: '',
    }
  })()

  const selectedZones  = zonaParam ? zonaParam.split(',').filter(Boolean) : []
  const hasFilters     = !!(status || tipo || min || max || camas || zonaParam || comunidad)
  const activeCount    = [status, tipo, min, max, camas, zonaParam, comunidad].filter(Boolean).length

  const handleZonesChange      = useCallback((z: string[]) => setParam('zona', z.length > 0 ? z.join(',') : null), [setParam])
  const handleSelectZone       = useCallback((z: string) => { setSearchQuery(''); setParam('zona', z) }, [setSearchQuery, setParam])
  const handleSelectSearchTerm = useCallback((t: string) => setSearchQuery(t), [setSearchQuery])
  const handleSelectProperty   = useCallback((slug: string) => router.push(`/${lang}/property/${slug}`), [router, lang])
  const clearAll               = () => { setSearchQuery(''); router.push(`/${lang}/properties`, { scroll: false }) }

  // Shared filter pills (rendered in both desktop row and mobile panel)
  const filterPills = (
    <>
      <FilterDropdown label={t('propertyGrid.filters.statusLabel')}  options={STATUS_OPTIONS}    value={status}    onChange={handleStatusChange} />
      <FilterDropdown label={t('propertyGrid.filters.propertyType')} options={TYPE_OPTIONS}       value={tipo}      onChange={(v) => setParam('tipo', v || null)} />
      <FilterDropdown label={t('propertyGrid.filters.bedrooms')}     options={BED_OPTIONS}        value={camas}     onChange={(v) => setParam('camas', v || null)} />
      <ZoneDropdown   selected={selectedZones} onChange={handleZonesChange} lang={lang} />
      <FilterDropdown label={t('propertyGrid.filters.communityType')} options={COMUNIDAD_OPTIONS} value={comunidad} onChange={(v) => setParam('comunidad', v || null)} />
    </>
  )

  const priceInputs = (
    <div className="flex items-center gap-1.5 shrink-0">
      <div className="relative">
        <input
          type="number"
          aria-label={pricePresentation.minLabel}
          placeholder={pricePresentation.minPlaceholder}
          value={min}
          onChange={(e) => setParam('min', e.target.value || null)}
          className="w-[90px] px-3 py-2 border border-[#E8E3DC] rounded-full text-sm bg-white
                     focus:outline-none focus:border-[#C9A96E] placeholder:text-[#999]"
        />
        {pricePresentation.suffix && min && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
            {pricePresentation.suffix}
          </span>
        )}
      </div>
      <span className="text-muted-foreground text-xs shrink-0">–</span>
      <div className="relative">
        <input
          type="number"
          aria-label={pricePresentation.maxLabel}
          placeholder={pricePresentation.maxPlaceholder}
          value={max}
          onChange={(e) => setParam('max', e.target.value || null)}
          className="w-[90px] px-3 py-2 border border-[#E8E3DC] rounded-full text-sm bg-white
                     focus:outline-none focus:border-[#C9A96E] placeholder:text-[#999]"
        />
        {pricePresentation.suffix && max && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
            {pricePresentation.suffix}
          </span>
        )}
      </div>
    </div>
  )

  return (
    <CatalogFilterBar>

      {/* ── Desktop: single scrollable row ── */}
      <div className="hidden md:flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

        {/* Search — grows to fill available space */}
        <div className="flex-1 min-w-[160px]">
          <SearchAutocomplete
            properties={properties}
            value={searchQuery}
            onChange={setSearchQuery}
            onSelectZone={handleSelectZone}
            onSelectSearchTerm={handleSelectSearchTerm}
            onSelectProperty={handleSelectProperty}
            lang={lang}
          />
        </div>

        <Divider />

        {filterPills}

        <Divider />

        {priceInputs}

        {hasFilters && (
          <button
            onClick={clearAll}
            className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-full text-xs text-muted-foreground
                       hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            {t('propertyGrid.filters.clearFilters')}
          </button>
        )}

        {status === 'for_rent' && (
          <span className="shrink-0 text-xs text-muted-foreground">
            {lang === 'en' ? 'monthly rent' : 'renta mensual'}
          </span>
        )}
      </div>

      {/* ── Mobile: toggle button → expandable panel ── */}
      <div className="md:hidden space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setFiltersOpen(v => !v)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              filtersOpen || activeCount > 0
                ? 'bg-foreground text-background border-foreground'
                : 'bg-secondary text-foreground border-transparent hover:bg-secondary/70'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
            {lang === 'es' ? 'Filtros' : 'Filters'}
            {activeCount > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#C9A96E] text-white text-[10px] font-bold">
                {activeCount}
              </span>
            )}
          </button>
          {hasFilters && (
            <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
              {t('propertyGrid.filters.clearFilters')}
            </button>
          )}
        </div>

        {filtersOpen && (
          <div className="space-y-3 pt-1">
            <SearchAutocomplete
              properties={properties}
              value={searchQuery}
              onChange={setSearchQuery}
              onSelectZone={handleSelectZone}
              onSelectSearchTerm={handleSelectSearchTerm}
              onSelectProperty={handleSelectProperty}
              lang={lang}
            />
            <div className="flex flex-wrap gap-2">
              {filterPills}
            </div>
            {priceInputs}
          </div>
        )}
      </div>

    </CatalogFilterBar>
  )
}
