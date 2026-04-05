'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import PropertyCard from '@/components/PropertyCard'
import type { PropertyRow } from '@/lib/supabase/queries'

const STORAGE_KEY = 'drh_favorites'

function getStoredIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}

export default function FavoritosPage() {
  const [properties, setProperties] = useState<PropertyRow[]>([])
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Initial load
  useEffect(() => {
    const ids = getStoredIds()
    setFavoriteIds(ids)
    if (ids.length === 0) { setLoading(false); return }

    supabase
      .from('properties')
      .select('*')
      .in('id', ids)
      .eq('hidden', false)
      .then(({ data }) => {
        setProperties(data ?? [])
        setLoading(false)
      })
  }, [])

  // Re-render immediately when a FavoriteButton fires
  useEffect(() => {
    const handler = (e: Event) => {
      const updated: string[] = (e as CustomEvent<{ updated: string[] }>).detail.updated
      setFavoriteIds(updated)
      setProperties((prev) => prev.filter((p) => updated.includes(p.id)))
    }
    window.addEventListener('drh-favorites-changed', handler)
    return () => window.removeEventListener('drh-favorites-changed', handler)
  }, [])

  if (loading) {
    return (
      <div className="section-padding container-wide">
        <div className="animate-pulse text-muted-foreground text-sm">Cargando...</div>
      </div>
    )
  }

  return (
    <section className="section-padding bg-background">
      <div className="container-wide">
        <h1 className="font-serif text-3xl font-semibold text-foreground mb-2">
          Mis Propiedades Guardadas
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          {favoriteIds.length} propiedad{favoriteIds.length !== 1 ? 'es' : ''} guardada{favoriteIds.length !== 1 ? 's' : ''}
        </p>

        {properties.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground mb-4">No tiene propiedades guardadas.</p>
            <Link href="/propiedades" className="text-sm text-primary hover:underline">
              Explorar propiedades
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
