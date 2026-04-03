'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export default function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/propiedades?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  const clearAll = () => router.push('/propiedades', { scroll: false })

  const status = searchParams.get('status') ?? ''
  const tipo = searchParams.get('tipo') ?? ''
  const min = searchParams.get('min') ?? ''
  const max = searchParams.get('max') ?? ''
  const camas = searchParams.get('camas') ?? ''

  const hasFilters = status || tipo || min || max || camas

  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'for_sale', label: 'En Venta' },
    { value: 'for_rent', label: 'En Alquiler' },
  ]
  const typeOptions = [
    { value: '', label: 'Todos' },
    { value: 'house', label: 'Casa' },
    { value: 'condo', label: 'Apartamento' },
    { value: 'land', label: 'Lote' },
    { value: 'commercial', label: 'Comercial' },
  ]
  const bedOptions = [
    { value: '', label: 'Todos' },
    { value: '1', label: '1+' },
    { value: '2', label: '2+' },
    { value: '3', label: '3+' },
    { value: '4', label: '4+' },
  ]

  return (
    <div className="bg-background border-b border-border py-4">
      <div className="container-wide">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Status */}
          <div>
            <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">Tipo</p>
            <div className="flex gap-1">
              {statusOptions.map(opt => (
                <button key={opt.value}
                  onClick={() => updateParam('status', opt.value)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    status === opt.value
                      ? 'bg-foreground text-background'
                      : 'bg-secondary text-foreground hover:bg-secondary/70'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Property type */}
          <div>
            <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">Propiedad</p>
            <div className="flex gap-1 flex-wrap">
              {typeOptions.map(opt => (
                <button key={opt.value}
                  onClick={() => updateParam('tipo', opt.value)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    tipo === opt.value
                      ? 'bg-foreground text-background'
                      : 'bg-secondary text-foreground hover:bg-secondary/70'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">Habitaciones</p>
            <div className="flex gap-1">
              {bedOptions.map(opt => (
                <button key={opt.value}
                  onClick={() => updateParam('camas', opt.value)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    camas === opt.value
                      ? 'bg-foreground text-background'
                      : 'bg-secondary text-foreground hover:bg-secondary/70'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div>
            <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">Precio (USD)</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Mín"
                value={min}
                onChange={e => updateParam('min', e.target.value)}
                className="w-24 px-2 py-1.5 border border-input rounded text-xs bg-background focus:outline-none"
              />
              <span className="text-muted-foreground text-xs">–</span>
              <input
                type="number"
                placeholder="Máx"
                value={max}
                onChange={e => updateParam('max', e.target.value)}
                className="w-24 px-2 py-1.5 border border-input rounded text-xs bg-background focus:outline-none"
              />
            </div>
          </div>

          {/* Clear */}
          {hasFilters ? (
            <button
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
            >
              Limpiar filtros
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
