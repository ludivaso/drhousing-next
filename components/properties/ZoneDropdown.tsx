'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, X } from 'lucide-react'

// Values must exactly match the `zone` TEXT column in Supabase.
// Labels are the short display names shown in the dropdown.
const ZONES = [
  { value: 'Escazú',                 label: 'Escazú' },
  { value: 'Santa Ana',              label: 'Santa Ana' },
  { value: 'La Guácima',             label: 'La Guácima' },
  { value: 'Ciudad Colón',           label: 'Ciudad Colón' },
  { value: 'Rohrmoser',              label: 'Rohrmoser' },
  { value: 'La Sabana',              label: 'La Sabana' },
  { value: 'Pavas',                  label: 'Pavas' },
  { value: 'San Rafael de Alajuela', label: 'San Rafael' },
  { value: 'Guanacaste',             label: 'Guanacaste' },
  { value: 'Pacífico Sur',           label: 'Pacífico Sur' },
  { value: 'Otras zonas',            label: 'Otras zonas' },
]

interface ZoneDropdownProps {
  selected: string[]                    // DB zone values currently selected
  onChange: (zones: string[]) => void
  lang: string
}

export function ZoneDropdown({ selected, onChange, lang }: ZoneDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const dropdownLabel = lang === 'es' ? 'Zona' : 'Zone'
  const allLabel      = lang === 'es' ? 'Todas las zonas' : 'All zones'
  const hasSelection  = selected.length > 0

  // Close on outside click
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter(z => z !== value)
        : [...selected, value]
    )
  }

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange([])
  }

  // Build trigger label
  const selectedLabels = ZONES.filter(z => selected.includes(z.value)).map(z => z.label)
  const triggerText = hasSelection
    ? selected.length === 1
      ? `${dropdownLabel}: ${selectedLabels[0]}`
      : `${dropdownLabel}: ${selected.length} ${lang === 'es' ? 'seleccionadas' : 'selected'}`
    : dropdownLabel

  return (
    <div ref={ref} className="relative inline-block">
      {/* Trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 whitespace-nowrap ${
          hasSelection
            ? 'bg-[#1A3A2A] text-white border-[#1A3A2A]'
            : 'bg-white text-[#1A1A1A] border-[#E8E3DC] hover:border-[#C9A96E]'
        }`}
      >
        <span>{triggerText}</span>
        {hasSelection
          ? <X className="h-3.5 w-3.5 shrink-0" onClick={clearAll} />
          : <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        }
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white border border-[#E8E3DC] rounded-xl shadow-lg min-w-[200px] py-1 max-h-72 overflow-y-auto">
          {hasSelection && (
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => { onChange([]); setOpen(false) }}
              className="w-full flex items-center px-4 py-2.5 text-sm text-[#C9A96E] hover:bg-[#F5F2EE] transition-colors"
            >
              {allLabel}
            </button>
          )}
          {ZONES.map(zone => (
            <button
              key={zone.value}
              onMouseDown={e => e.preventDefault()}
              onClick={() => toggle(zone.value)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-[#1A1A1A] hover:bg-[#F5F2EE] transition-colors"
            >
              <span>{zone.label}</span>
              {selected.includes(zone.value) && (
                <Check className="h-4 w-4 text-[#1A3A2A] shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
