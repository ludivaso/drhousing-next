'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Plus, Search, Copy, Check, ExternalLink, Trash2,
  MessageCircle, Loader2, X, GripVertical, ChevronDown, ChevronUp, Lock
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

// ─── Types ──────────────────────────────────────────────────────────────────
type CuratedList = {
  id: string
  slug: string
  title: string
  client_name: string | null
  property_ids: string[]
  message: string | null
  language: string
  is_active: boolean
  is_private: boolean
  created_at: string
}

type PropertySnippet = {
  id: string
  slug: string | null
  title: string
  location_name: string
  price_sale: number | null
  price_rent_monthly: number | null
  images: string[] | null
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ─── WhatsApp Message Generator ─────────────────────────────────────────────
function WaMessageModal({
  list,
  properties,
  onClose,
}: {
  list: CuratedList
  properties: PropertySnippet[]
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  const BASE = 'https://drhousing.net'

  const lines = [
    `Estimado/a ${list.client_name ?? 'cliente'}, le comparto esta selección de propiedades preparada especialmente para usted:`,
    '',
    ...properties
      .filter((p) => p.slug)
      .map((p, i) => {
        const price = p.price_sale ?? p.price_rent_monthly
        return [
          `${i + 1}. ${p.title}${price ? ` — ${fmt(price)}` : ''}`,
          `   📍 ${p.location_name}`,
          `   🔗 ${BASE}/property/${p.slug}`,
        ].join('\n')
      }),
    '',
    `Ver portafolio completo:`,
    `${BASE}/for/${list.slug}`,
    '',
    '— Equipo DR Housing\n+506 6077-5000',
  ]

  const message = lines.join('\n')
  const waLink = `https://wa.me/50660775000?text=${encodeURIComponent(message)}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-serif text-lg font-semibold">Mensaje WhatsApp</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">
          <pre className="bg-secondary rounded p-4 text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-y-auto">
            {message}
          </pre>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleCopy}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded border border-border text-sm font-medium hover:bg-secondary transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded bg-[#25D366] text-white text-sm font-medium hover:bg-[#25D366]/90 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Abrir WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Create / Edit Form ──────────────────────────────────────────────────────
function ListForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<CuratedList>
  onSave: (list: CuratedList) => void
  onCancel: () => void
}) {
  const [clientName, setClientName] = useState(initial?.client_name ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [message, setMessage] = useState(initial?.message ?? '')
  const [language, setLanguage] = useState(initial?.language ?? 'es')
  const [isPrivate, setIsPrivate] = useState(initial?.is_private ?? false)
  const [search, setSearch] = useState('')
  const [allProps, setAllProps] = useState<PropertySnippet[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>(initial?.property_ids ?? [])
  const [saving, setSaving] = useState(false)
  const [loadingProps, setLoadingProps] = useState(false)

  useEffect(() => {
    const fetchProps = async () => {
      setLoadingProps(true)
      const { data } = await supabase
        .from('properties')
        .select('id, slug, title, location_name, price_sale, price_rent_monthly, images')
        .eq('hidden', false)
        .order('created_at', { ascending: false })
        .limit(200)
      setAllProps((data as PropertySnippet[]) ?? [])
      setLoadingProps(false)
    }
    fetchProps()
  }, [])

  const filteredProps = allProps.filter((p) =>
    search === '' ||
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.location_name.toLowerCase().includes(search.toLowerCase())
  )

  const toggleProp = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const autoSlug = () => {
    if (!slug) setSlug(slugify(clientName))
  }

  const handleSave = async () => {
    if (!clientName.trim() || !slug.trim()) return
    setSaving(true)
    const payload = {
      client_name: clientName,
      slug,
      title: clientName,
      message: message || null,
      language,
      property_ids: selectedIds,
      is_active: true,
      is_private: isPrivate,
    }

    let data, error
    if (initial?.id) {
      ;({ data, error } = await supabase.from('curated_lists').update(payload).eq('id', initial.id).select().single())
    } else {
      // Need created_by — get current user
      const { data: { user } } = await supabase.auth.getUser()
      ;({ data, error } = await supabase.from('curated_lists').insert({ ...payload, created_by: user?.id ?? '' }).select().single())
    }

    setSaving(false)
    if (!error && data) onSave(data as CuratedList)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto" onClick={onCancel}>
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-2xl my-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-serif text-lg font-semibold">{initial?.id ? 'Editar Lista' : 'Nueva Lista'}</h3>
          <button onClick={onCancel}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Nombre del Cliente *</label>
              <input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                onBlur={autoSlug}
                placeholder="Ej: Familia García"
                className="w-full px-3 py-2 rounded border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Slug (URL) *</label>
              <div className="flex gap-2">
                <input
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="familia-garcia"
                  className="flex-1 px-3 py-2 rounded border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                />
              </div>
              {slug && (
                <p className="text-xs text-muted-foreground mt-1">
                  drhousing.net/{isPrivate ? 'private' : 'for'}/<strong>{slug}</strong>
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Idioma</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Mensaje (opcional)</label>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nota personalizada para el cliente"
                className="w-full px-3 py-2 rounded border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="rounded"
              />
              <div>
                <span className="font-medium">Lista Privada</span>
                <p className="text-xs text-muted-foreground">Requiere PIN para acceder</p>
              </div>
            </label>
          </div>

          {/* Property selector */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Propiedades ({selectedIds.length} seleccionadas)
            </label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar propiedad..."
                className="w-full pl-9 pr-4 py-2 rounded border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="border border-border rounded-lg max-h-52 overflow-y-auto">
              {loadingProps ? (
                <div className="flex items-center justify-center h-20">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : filteredProps.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-6">Sin resultados</p>
              ) : (
                filteredProps.map((p) => (
                  <label key={p.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary cursor-pointer border-b border-border last:border-0">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(p.id)}
                      onChange={() => toggleProp(p.id)}
                      className="rounded border-input accent-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.location_name}</p>
                    </div>
                    {(p.price_sale ?? p.price_rent_monthly) && (
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {fmt(p.price_sale ?? p.price_rent_monthly ?? 0)}
                      </span>
                    )}
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onCancel} className="flex-1 py-2.5 rounded border border-border text-sm font-medium hover:bg-secondary transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !clientName.trim() || !slug.trim()}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function CuratedAdminPage() {
  const [lists, setLists] = useState<CuratedList[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingList, setEditingList] = useState<CuratedList | null>(null)
  const [waModal, setWaModal] = useState<{ list: CuratedList; props: PropertySnippet[] } | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [listProps, setListProps] = useState<Record<string, PropertySnippet[]>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fetchLists = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('curated_lists')
      .select('*')
      .order('created_at', { ascending: false })
    setLists((data as CuratedList[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchLists() }, [fetchLists])

  const fetchListProperties = async (list: CuratedList) => {
    if (listProps[list.id] || !list.property_ids?.length) return
    const { data } = await supabase
      .from('properties')
      .select('id, slug, title, location_name, price_sale, price_rent_monthly, images')
      .in('id', list.property_ids)
    const ordered = list.property_ids
      .map((id) => (data ?? []).find((p) => p.id === id))
      .filter(Boolean) as PropertySnippet[]
    setListProps((prev) => ({ ...prev, [list.id]: ordered }))
  }

  const handleToggleExpand = (list: CuratedList) => {
    if (expandedId === list.id) {
      setExpandedId(null)
    } else {
      setExpandedId(list.id)
      fetchListProperties(list)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta lista?')) return
    await supabase.from('curated_lists').delete().eq('id', id)
    setLists((prev) => prev.filter((l) => l.id !== id))
  }

  const handleOpenWa = async (list: CuratedList) => {
    await fetchListProperties(list)
    setWaModal({ list, props: listProps[list.id] ?? [] })
  }

  const handleCopyLink = (list: CuratedList) => {
    const path = list.is_private ? 'private' : 'for'
    navigator.clipboard.writeText(`https://drhousing.net/${path}/${list.slug}`)
    setCopiedId(list.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSave = (saved: CuratedList) => {
    setLists((prev) => {
      const exists = prev.find((l) => l.id === saved.id)
      return exists ? prev.map((l) => l.id === saved.id ? saved : l) : [saved, ...prev]
    })
    setShowForm(false)
    setEditingList(null)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">Listas Curadas</h1>
          <p className="text-sm text-muted-foreground mt-1">{lists.length} listas · Portafolios privados para clientes</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Nueva Lista
        </button>
      </div>

      <div className="space-y-3">
        {lists.map((list) => (
          <div key={list.id} className="card-elevated">
            {/* Row */}
            <div className="flex items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <p className="font-medium text-foreground">{list.client_name ?? list.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${list.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {list.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                  {list.is_private && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> PIN
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                  <span className="font-mono">/{list.is_private ? 'private' : 'for'}/{list.slug}</span>
                  <span>·</span>
                  <span>{list.property_ids?.length ?? 0} propiedades</span>
                  <span>·</span>
                  <span>{new Date(list.created_at).toLocaleDateString('es-CR')}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenWa(list)}
                  title="Generar mensaje WhatsApp"
                  className="p-2 rounded hover:bg-secondary text-[#25D366] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleCopyLink(list)}
                  title="Copiar enlace"
                  className="p-2 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copiedId === list.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={`/${list.is_private ? 'private' : 'for'}/${list.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Ver lista pública"
                  className="p-2 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => { setEditingList(list); setShowForm(true) }}
                  className="px-3 py-1.5 rounded text-xs border border-border hover:bg-secondary transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(list.id)}
                  className="p-2 rounded hover:bg-red-50 text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleToggleExpand(list)} className="p-2 rounded hover:bg-secondary text-muted-foreground transition-colors">
                  {expandedId === list.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Expanded property list */}
            {expandedId === list.id && (
              <div className="border-t border-border px-4 pb-4 pt-3">
                {!listProps[list.id] ? (
                  <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
                ) : listProps[list.id].length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin propiedades</p>
                ) : (
                  <div className="space-y-2">
                    {listProps[list.id].map((p, i) => (
                      <div key={p.id} className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground w-5 text-right flex-shrink-0">{i + 1}.</span>
                        <span className="flex-1 font-medium text-foreground truncate">{p.title}</span>
                        <span className="text-muted-foreground text-xs">{p.location_name}</span>
                        {p.slug && (
                          <a href={`/property/${p.slug}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {lists.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg font-medium mb-2">Sin listas curadas</p>
            <p className="text-sm">Cree una lista para compartir propiedades con un cliente.</p>
          </div>
        )}
      </div>

      {showForm && (
        <ListForm
          initial={editingList ?? undefined}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingList(null) }}
        />
      )}

      {waModal && (
        <WaMessageModal
          list={waModal.list}
          properties={waModal.props}
          onClose={() => setWaModal(null)}
        />
      )}
    </div>
  )
}
