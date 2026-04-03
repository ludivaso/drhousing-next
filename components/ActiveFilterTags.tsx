'use client'
import { useRouter, useSearchParams } from 'next/navigation'

interface Tag { key: string; label: string }
interface Props { filters: Tag[] }

export default function ActiveFilterTags({ filters }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(key)
    const qs = params.toString()
    router.push(qs ? `/propiedades?${qs}` : '/propiedades', { scroll: false })
  }

  if (filters.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-xs text-muted-foreground">Mostrando:</span>
      {filters.map(f => (
        <span key={f.key}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary rounded-full text-xs font-medium text-foreground">
          {f.label}
          <button onClick={() => removeFilter(f.key)}
            className="ml-0.5 text-muted-foreground hover:text-destructive transition-colors leading-none">
            ×
          </button>
        </span>
      ))}
      <a href="/propiedades"
        className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
        Limpiar todos
      </a>
    </div>
  )
}
