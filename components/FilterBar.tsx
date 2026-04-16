'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState, useRef, useEffect } from 'react'
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'
import SearchAutocomplete from '@/components/properties/SearchAutocomplete'
import { ZoneDropdown } from '@/components/properties/ZoneDropdown'
import { usePropertiesFilter } from '@/components/properties/PropertiesFilterContext'
import type { PropertyRow } from '@/lib/supabase/queries'

// ── Reusable single-select dropdown ──────────────────────────────────────────

interface DropdownOption { value: string; label: string }

function FilterDropdown({
  label,
  options,
  value,
  onChange,
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
    <div ref={ref} className="relative">
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

// ── Main FilterBar ───────────────────────────────────────────────────────────

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
  const [filtersOpen, setFiltersOpen] = useState(false)

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
  const activeFilterCount = [status, tipo, min, max, camas, zonaParam, comunidad].filter(Boolean).length

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
    router.push(`/${lang}/property/${slug}`)
  }, [router, lang])

  const clearAll = () => {
    setSearchQuery('')
    router.push(`/${lang}/properties`, { scroll: false })
  }

  return (
    <div className="sticky top-20 md:top-[124px] z-40 bg-background border-b border-[#E8E3DC]">
      <div className="container-wide py-3 md:py-4 space-y-3">

        {/* Row 0: Search — always visible */}
        <SearchAutocomplete
          properties={properties}
          value={searchQuery}
          onChange={setSearchQuery}
          onSelectZone={handleSelectZone}
          onSelectProperty={handleSelectProperty}
          lang={lang}
        />

        {/* Mobile-only toggle: "Filters" button + Clear */}
        <div className="flex items-center justify-between md:hidden">
          <button
            onClick={() => setFiltersOpen(v => !v)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              filtersOpen || activeFilterCount > 0
                ? 'bg-foreground text-background border-foreground'
                : 'bg-secondary text-foreground border-transparent hover:bg-secondary/70'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
            {lang === 'es' ? 'Filtros' : 'Filters'}
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#C9A96E] text-white text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {hasFilters && (
            <button onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
              {t('propertyGrid.filters.clearFilters')}
            </button>
          )}
        </div>

        {/* Filter dropdowns — single row on desktop, hidden on mobile until toggled */}
        <div className={`${filtersOpen ? 'block' : 'hidden'} md:block`}>
          <div className="flex flex-wrap items-center gap-2">

            {/* Status */}
            <FilterDropdown
              label={t('propertyGrid.filters.statusLabel')}
              options={STATUS_OPTIONS}
              value={status}
              onChange={(v) => setParam('status', v || null)}
            />

            {/* Type */}
            <FilterDropdown
              label={t('propertyGrid.filters.propertyType')}
              options={TYPE_OPTIONS}
              value={tipo}
              onChange={(v) => setParam('tipo', v || null)}
            />

            {/* Bedrooms */}
            <FilterDropdown
              label={t('propertyGrid.filters.bedrooms')}
              options={BED_OPTIONS}
              value={camas}
              onChange={(v) => setParam('camas', v || null)}
            />

            {/* Zone — multi-select, uses existing ZoneDropdown */}
            <ZoneDropdown
              selected={selectedZones}
              onChange={handleZonesChange}
              lang={lang}
            />

            {/* Community */}
            <FilterDropdown
              label={t('propertyGrid.filters.communityType')}
              options={COMUNIDAD_OPTIONS}
              value={comunidad}
              onChange={(v) => setParam('comunidad', v || null)}
            />

            {/* Thin divider */}
            <div className="hidden md:block w-px h-6 bg-[#E8E3DC]" />

            {/* Price range */}
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                placeholder={`$ ${t('propertyGrid.filters.min')}`}
                value={min}
                onChange={(e) => setParam('min', e.target.value || null)}
                className="w-[100px] px-3 py-2 border border-[#E8E3DC] rounded-full text-sm bg-white
                           focus:outline-none focus:border-[#C9A96E] placeholder:text-[#999]"
              />
              <span className="text-muted-foreground text-xs">–</span>
              <input
                type="number"
                placeholder={`$ ${t('propertyGrid.filters.max')}`}
                value={max}
                onChange={(e) => setParam('max', e.target.value || null)}
                className="w-[100px] px-3 py-2 border border-[#E8E3DC] rounded-full text-sm bg-white
                           focus:outline-none focus:border-[#C9A96E] placeholder:text-[#999]"
              />
            </div>

            {/* Clear all */}
            {hasFilters && (
              <button
                onClick={clearAll}
                className="hidden md:flex items-center gap-1 px-3 py-2 rounded-full text-xs text-muted-foreground
                           hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                {t('propertyGrid.filters.clearFilters')}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
