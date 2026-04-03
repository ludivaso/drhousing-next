'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

// Zone values must exactly match the `zone` TEXT column in Supabase
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

const STATUS_OPTIONS = [
  { value: '',         label: 'Todos' },
  { value: 'for_sale', label: 'En Venta' },
  { value: 'for_rent', label: 'En Alquiler' },
]

const TYPE_OPTIONS = [
  { value: '',           label: 'Todos' },
  { value: 'house',      label: 'Casa' },
  { value: 'condo',      label: 'Apartamento' },
  { value: 'land',       label: 'Lote' },
  { value: 'commercial', label: 'Comercial' },
]

const BED_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
]

const COMUNIDAD_OPTIONS = [
  { value: '',            label: 'Todas' },
  { value: 'gated',       label: '🔒 Condominio / Cerrado' },
  { value: 'independent', label: '🏠 Independiente' },
]

export default function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const setParam = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    const qs = params.toString()
    router.push(qs ? `/propiedades?${qs}` : '/propiedades', { scroll: false })
  }, [router, searchParams])

  const status    = searchParams.get('status')    ?? ''
  const tipo      = searchParams.get('tipo')      ?? ''
  const min       = searchParams.get('min')       ?? ''
  const max       = searchParams.get('max')       ?? ''
  const camas     = searchParams.get('camas')     ?? ''
  const zona      = searchParams.get('zona')      ?? ''
  const comunidad = searchParams.get('comunidad') ?? ''

  const hasFilters = !!(status || tipo || min || max || camas || zona || comunidad)

  const pill = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
      active
        ? 'bg-foreground text-background'
        : 'bg-secondary text-foreground hover:bg-secondary/70'
    }`

  return (
    <div className="bg-background border-b border-[#E8E3DC]">
      <div className="container-wide py-4 space-y-3">

        {/* Row 1: Status + Type + Beds + Price */}
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">Tipo</p>
            <div className="flex gap-1 flex-wrap">
              {STATUS_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setParam('status', opt.value || null)}
                  className={pill(status === opt.value)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">Propiedad</p>
            <div className="flex gap-1 flex-wrap">
              {TYPE_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setParam('tipo', opt.value || null)}
                  className={pill(tipo === opt.value)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">Habitaciones</p>
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
            <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">Precio USD</p>
            <div className="flex items-center gap-2">
              <input type="number" placeholder="Mín" value={min}
                onChange={e => setParam('min', e.target.value || null)}
                className="w-24 px-2 py-1.5 border border-input rounded text-xs bg-background focus:outline-none" />
              <span className="text-muted-foreground text-xs">–</span>
              <input type="number" placeholder="Máx" value={max}
                onChange={e => setParam('max', e.target.value || null)}
                className="w-24 px-2 py-1.5 border border-input rounded text-xs bg-background focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Row 2: Zona */}
        <div>
          <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">Zona</p>
          <div className="flex gap-1 flex-wrap overflow-x-auto pb-0.5">
            <button onClick={() => setParam('zona', null)} className={pill(zona === '')}>
              Todas
            </button>
            {ZONES.map(z => (
              <button key={z.value} onClick={() => setParam('zona', z.value)}
                className={pill(zona === z.value)}>
                {z.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 3: Comunidad + Clear */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">Tipo de comunidad</p>
            <div className="flex gap-1 flex-wrap">
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
              onClick={() => router.push('/propiedades', { scroll: false })}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors self-end pb-1.5">
              Limpiar filtros
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
