'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Eye, EyeOff, Trash2, Loader2, Pencil } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

type Property = {
  id: string
  title: string
  location_name: string
  price_sale: number | null
  price_rent_monthly: number | null
  status: string
  property_type: string
  featured: boolean
  hidden: boolean
  created_at: string
  slug: string | null
}

export default function AdminListings() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    loadProperties()
  }, [])

  async function loadProperties() {
    const { data } = await supabase
      .from('properties')
      .select('id, title, location_name, price_sale, price_rent_monthly, status, property_type, featured, hidden, created_at, slug')
      .order('created_at', { ascending: false })
    setProperties(data ?? [])
    setLoading(false)
  }

  async function toggleHidden(prop: Property) {
    await supabase.from('properties').update({ hidden: !prop.hidden }).eq('id', prop.id)
    setProperties((prev) => prev.map((p) => p.id === prop.id ? { ...p, hidden: !p.hidden } : p))
  }

  async function toggleFeatured(prop: Property) {
    await supabase.from('properties').update({ featured: !prop.featured }).eq('id', prop.id)
    setProperties((prev) => prev.map((p) => p.id === prop.id ? { ...p, featured: !p.featured } : p))
  }

  async function confirmDelete() {
    if (!deleteId) return
    await supabase.from('properties').delete().eq('id', deleteId)
    setProperties((prev) => prev.filter((p) => p.id !== deleteId))
    setDeleteId(null)
  }

  const filtered = properties.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.location_name.toLowerCase().includes(search.toLowerCase())
  )

  const formatPrice = (n: number | null) =>
    n ? `$${n.toLocaleString()}` : '—'

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Propiedades</h1>
          <p className="text-muted-foreground text-sm mt-1">{filtered.length} de {properties.length} propiedades</p>
        </div>
        <Link
          href="/admin/listings/new"
          className="flex items-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Nueva Propiedad
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por título o ubicación..."
          className="w-full pl-10 pr-4 py-2.5 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 card-elevated">
          <p className="text-muted-foreground">No se encontraron propiedades</p>
        </div>
      ) : (
        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Título</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Ubicación</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Precio</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Estado</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((prop) => (
                  <tr key={prop.id} className="border-b border-border last:border-b-0 hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium text-foreground line-clamp-1">{prop.title}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          {prop.featured && (
                            <span className="text-xs bg-gold/20 text-gold-foreground px-1.5 py-0.5 rounded font-medium">Destacado</span>
                          )}
                          {prop.hidden && (
                            <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">Oculto</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{prop.location_name}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {prop.price_sale ? (
                        <span className="font-medium">{formatPrice(prop.price_sale)}</span>
                      ) : (
                        <span className="text-muted-foreground">{formatPrice(prop.price_rent_monthly)}/mes</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        prop.status === 'active' ? 'bg-green-100 text-green-800' :
                        prop.status === 'sold' ? 'bg-gray-100 text-gray-600' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {prop.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          href={`/property/${prop.slug}`}
                          target="_blank"
                          className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                          title="Ver en sitio"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => toggleHidden(prop)}
                          className={`p-1.5 rounded hover:bg-secondary transition-colors ${prop.hidden ? 'text-destructive' : 'text-muted-foreground hover:text-foreground'}`}
                          title={prop.hidden ? 'Mostrar' : 'Ocultar'}
                        >
                          {prop.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <Link
                          href={`/admin/listings/${prop.id}`}
                          className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(prop.id)}
                          className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="font-serif text-lg font-semibold mb-2">¿Eliminar propiedad?</h3>
            <p className="text-muted-foreground text-sm mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded border border-border text-sm hover:bg-secondary transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded bg-destructive text-destructive-foreground text-sm hover:bg-destructive/90 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
