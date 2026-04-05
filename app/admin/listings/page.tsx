'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Plus, Search, Loader2, Pencil, ExternalLink,
  Link2, FileText, Star, GripVertical, Trash2, X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type Property = {
  id: string
  title: string
  title_es: string | null
  location_name: string
  price_sale: number | null
  price_rent_monthly: number | null
  status: string
  property_type: string
  tier: string | null
  featured: boolean
  featured_order: number | null
  hidden: boolean
  visibility: string | null
  facebook_published: string | null
  encuentra24_published: string | null
  images: string[] | null
  featured_images: string[] | null
  created_at: string
  slug: string | null
  reference_id: string | null
  zone: string | null
  bedrooms: number | null
  bathrooms: number | null
  construction_size_sqm: number | null
  description: string | null
}

type Tab = 'featured' | 'public' | 'private' | 'meta' | 'e24'

type EditForm = {
  title: string
  status: string
  zone: string
  price_sale: string
  hidden: boolean
  featured: boolean
}

const PAGE_SIZE = 100

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  for_sale:       { label: 'En Venta',    color: 'bg-emerald-100 text-emerald-800' },
  for_rent:       { label: 'En Alquiler', color: 'bg-blue-100 text-blue-800' },
  both:           { label: 'Venta & Alq', color: 'bg-amber-100 text-amber-800' },
  presale:        { label: 'Preventa',    color: 'bg-purple-100 text-purple-800' },
  under_contract: { label: 'Contrato',    color: 'bg-yellow-100 text-yellow-800' },
  sold:           { label: 'Vendido',     color: 'bg-gray-100 text-gray-500' },
  rented:         { label: 'Alquilado',   color: 'bg-gray-100 text-gray-500' },
}

const TYPE_OPTIONS = ['apartment','house','condo','land','commercial','office','farm','penthouse']
const STATUS_OPTIONS = Object.keys(STATUS_LABELS)
const ZONE_OPTIONS = [
  'Escazú','Santa Ana','La Guácima','Ciudad Colón','Rohrmoser',
  'La Sabana','Pavas','San Rafael de Alajuela','Guanacaste','Pacífico Sur',
]

function formatPrice(n: number | null) {
  return n ? `$${n.toLocaleString()}` : '—'
}

// ─── RowActions ────────────────────────────────────────────────────────────────
function RowActions({
  prop,
  onCopyLink,
  onDelete,
  onEdit,
}: {
  prop: Property
  onCopyLink: (url: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string) => void
}) {
  const publicUrl = `https://drhousing.net/property/${prop.slug || prop.id}`
  return (
    <div className="flex items-center gap-1 justify-end">
      <Link href={`/api/pdf/brochure?id=${prop.id}`} target="_blank"
        className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-secondary transition-colors" title="PDF">
        <FileText className="w-3.5 h-3.5" />
      </Link>
      <button onClick={() => onCopyLink(publicUrl)}
        className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-secondary transition-colors" title="Copy link">
        <Link2 className="w-3.5 h-3.5" />
      </button>
      <Link href={`/property/${prop.slug || prop.id}`} target="_blank"
        className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-secondary transition-colors" title="View">
        <ExternalLink className="w-3.5 h-3.5" />
      </Link>
      <button onClick={() => onEdit(prop.id)}
        className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-secondary transition-colors" title="Quick Edit">
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <Link href={`/admin/listings/${prop.id}`}
        className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-secondary transition-colors" title="Full Edit">
        <ExternalLink className="w-3.5 h-3.5" />
      </Link>
      <button
        onClick={async () => {
          if (window.confirm('¿Eliminar esta propiedad?')) {
            await supabase.from('properties').delete().eq('id', prop.id)
            onDelete(prop.id)
          }
        }}
        className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        title="Eliminar"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ─── Inline Edit Row ───────────────────────────────────────────────────────────
function InlineEditRow({
  prop,
  colSpan,
  editForm,
  setEditForm,
  onSave,
  onCancel,
}: {
  prop: Property
  colSpan: number
  editForm: EditForm
  setEditForm: React.Dispatch<React.SetStateAction<EditForm>>
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <tr className="bg-amber-50/60 border-b border-amber-200">
      <td colSpan={colSpan} className="px-3 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={editForm.title}
            onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Título"
            className="border border-input rounded px-2 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[180px] flex-1"
          />
          <select
            value={editForm.status}
            onChange={(e) => setEditForm(f => ({ ...f, status: e.target.value }))}
            className="border border-input rounded px-2 py-1 text-sm bg-background focus:outline-none"
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]?.label ?? s}</option>
            ))}
          </select>
          <select
            value={editForm.zone}
            onChange={(e) => setEditForm(f => ({ ...f, zone: e.target.value }))}
            className="border border-input rounded px-2 py-1 text-sm bg-background focus:outline-none"
          >
            <option value="">Sin zona</option>
            {ZONE_OPTIONS.map(z => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
          <input
            type="number"
            value={editForm.price_sale}
            onChange={(e) => setEditForm(f => ({ ...f, price_sale: e.target.value }))}
            placeholder="Precio venta"
            className="border border-input rounded px-2 py-1 text-sm bg-background focus:outline-none w-32"
          />
          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={editForm.hidden}
              onChange={(e) => setEditForm(f => ({ ...f, hidden: e.target.checked }))}
            />
            Oculto
          </label>
          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={editForm.featured}
              onChange={(e) => setEditForm(f => ({ ...f, featured: e.target.checked }))}
            />
            Destacado
          </label>
          <button
            onClick={onSave}
            className="px-3 py-1 rounded bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            Guardar
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1 rounded border border-border text-xs hover:bg-secondary transition-colors"
          >
            Cancelar
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── SortableRow ───────────────────────────────────────────────────────────────
function SortableRow({
  prop,
  onCopyLink,
  onDelete,
  onEdit,
  selected,
  onToggle,
  onHoverEnter,
  onHoverLeave,
}: {
  prop: Property
  onCopyLink: (url: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string) => void
  selected: string[]
  onToggle: (id: string) => void
  onHoverEnter: (prop: Property, top: number) => void
  onHoverLeave: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: prop.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  const thumb = prop.featured_images?.[0] ?? prop.images?.[0]
  const displayTitle = prop.title_es || prop.title
  const isSelected = selected.includes(prop.id)

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-border last:border-b-0 hover:bg-secondary/20 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}
      onMouseEnter={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        onHoverEnter(prop, rect.top + rect.height / 2)
      }}
      onMouseLeave={onHoverLeave}
    >
      <td className="px-3 py-2 w-8">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(prop.id)}
          className="rounded"
        />
      </td>
      <td className="px-3 py-2 w-8">
        <button {...attributes} {...listeners}
          className="cursor-grab text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing">
          <GripVertical className="w-4 h-4" />
        </button>
      </td>
      <td className="px-3 py-2 w-28">
        {thumb
          ? <div className="relative w-24 h-24 rounded overflow-hidden"><Image src={thumb} alt="" fill className="object-cover" unoptimized /></div>
          : <div className="w-24 h-24 rounded bg-secondary" />}
      </td>
      <td className="px-3 py-2">
        <p className="font-medium text-sm line-clamp-1">
          {displayTitle}
          {prop.featured && <Star className="w-3 h-3 text-amber-500 fill-amber-500 inline ml-1" />}
        </p>
        <p className="text-xs text-muted-foreground">{prop.location_name}</p>
      </td>
      <td className="px-3 py-2 hidden md:table-cell text-xs text-muted-foreground">{prop.zone ?? '—'}</td>
      <td className="px-3 py-2 hidden sm:table-cell">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_LABELS[prop.status]?.color ?? 'bg-gray-100 text-gray-600'}`}>
          {STATUS_LABELS[prop.status]?.label ?? prop.status}
        </span>
      </td>
      <td className="px-3 py-2 hidden md:table-cell text-sm text-muted-foreground capitalize">{prop.property_type}</td>
      <td className="px-3 py-2 hidden lg:table-cell text-xs text-center">
        {prop.featured
          ? <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 inline" />
          : <span className="text-muted-foreground">—</span>}
      </td>
      <td className="px-3 py-2">
        <RowActions prop={prop} onCopyLink={onCopyLink} onDelete={onDelete} onEdit={onEdit} />
      </td>
    </tr>
  )
}

// ─── StandardRow ──────────────────────────────────────────────────────────────
function StandardRow({
  prop,
  onCopyLink,
  onDelete,
  onEdit,
  selected,
  onToggle,
  onHoverEnter,
  onHoverLeave,
}: {
  prop: Property
  onCopyLink: (url: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string) => void
  selected: string[]
  onToggle: (id: string) => void
  onHoverEnter: (prop: Property, top: number) => void
  onHoverLeave: () => void
}) {
  const thumb = prop.featured_images?.[0] ?? prop.images?.[0]
  const displayTitle = prop.title_es || prop.title
  const isMeta = prop.facebook_published === 'true'
  const isE24  = prop.encuentra24_published === 'true'
  const isSelected = selected.includes(prop.id)

  return (
    <tr
      className={`border-b border-border last:border-b-0 hover:bg-secondary/20 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}
      onMouseEnter={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        onHoverEnter(prop, rect.top + rect.height / 2)
      }}
      onMouseLeave={onHoverLeave}
    >
      <td className="px-3 py-2 w-8">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(prop.id)}
          className="rounded"
        />
      </td>
      <td className="px-3 py-2 w-28">
        {thumb
          ? <div className="relative w-24 h-24 rounded overflow-hidden"><Image src={thumb} alt="" fill className="object-cover" unoptimized /></div>
          : <div className="w-24 h-24 rounded bg-secondary" />}
      </td>
      <td className="px-3 py-2">
        <div className="flex items-start gap-1.5 flex-wrap">
          {isMeta && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">META</span>}
          {isE24  && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">E24</span>}
        </div>
        <p className="font-medium text-sm line-clamp-1">
          {displayTitle}
          {prop.featured && <Star className="w-3 h-3 text-amber-500 fill-amber-500 inline ml-1" />}
        </p>
        <p className="text-xs text-muted-foreground">{prop.location_name}</p>
      </td>
      <td className="px-3 py-2 hidden md:table-cell text-xs text-muted-foreground">{prop.zone ?? '—'}</td>
      <td className="px-3 py-2 hidden sm:table-cell">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_LABELS[prop.status]?.color ?? 'bg-gray-100 text-gray-600'}`}>
          {STATUS_LABELS[prop.status]?.label ?? prop.status}
        </span>
      </td>
      <td className="px-3 py-2 hidden md:table-cell text-sm text-muted-foreground capitalize">{prop.property_type}</td>
      <td className="px-3 py-2 hidden lg:table-cell text-xs text-center">
        {prop.featured
          ? <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 inline" />
          : <span className="text-muted-foreground">—</span>}
      </td>
      <td className="px-3 py-2">
        <RowActions prop={prop} onCopyLink={onCopyLink} onDelete={onDelete} onEdit={onEdit} />
      </td>
    </tr>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminListings() {
  const [properties, setProperties]       = useState<Property[]>([])
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState('')
  const [activeTab, setActiveTab]         = useState<Tab>('public')
  const [filterStatus, setFilterStatus]   = useState('')
  const [filterType, setFilterType]       = useState('')
  const [filterZone, setFilterZone]       = useState('')
  const [filterTitle, setFilterTitle]     = useState('')
  const [filterFeatured, setFilterFeatured] = useState('')
  const [copiedUrl, setCopiedUrl]         = useState(false)
  const [savingOrder, setSavingOrder]     = useState(false)
  const [page, setPage]                   = useState(0)
  const [selected, setSelected]           = useState<string[]>([])
  const [editingId, setEditingId]         = useState<string | null>(null)
  const [editForm, setEditForm]           = useState<EditForm>({
    title: '', status: '', zone: '', price_sale: '', hidden: false, featured: false,
  })
  const [hovered, setHovered]             = useState<{ prop: Property; top: number } | null>(null)
  const hoverTimer                        = useRef<NodeJS.Timeout | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => { loadProperties() }, [])

  // Reset page and selection when tab, search, or column filters change
  useEffect(() => {
    setPage(0)
    setSelected([])
  }, [activeTab, search, filterStatus, filterType, filterZone, filterTitle, filterFeatured])

  async function loadProperties() {
    setLoading(true)
    const { data } = await supabase
      .from('properties')
      .select('id,title,title_es,location_name,price_sale,price_rent_monthly,status,property_type,tier,featured,featured_order,hidden,visibility,facebook_published,encuentra24_published,images,featured_images,created_at,slug,reference_id,zone,bedrooms,bathrooms,construction_size_sqm,description')
      .order('featured_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
    setProperties(data ?? [])
    setLoading(false)
  }

  const handleCopyLink = useCallback((url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2000)
    })
  }, [])

  const handleDelete = useCallback((id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id))
    setSelected(prev => prev.filter(s => s !== id))
  }, [])

  const handleEdit = useCallback((id: string) => {
    setEditingId(prev => {
      if (prev === id) return null
      return id
    })
    setProperties(prev => {
      const prop = prev.find(p => p.id === id)
      if (prop) {
        setEditForm({
          title: prop.title_es || prop.title,
          status: prop.status,
          zone: prop.zone ?? '',
          price_sale: prop.price_sale?.toString() ?? '',
          hidden: prop.hidden,
          featured: prop.featured,
        })
      }
      return prev
    })
  }, [])

  async function handleSaveEdit() {
    if (!editingId) return
    const updates = {
      title_es: editForm.title,
      status: editForm.status,
      zone: editForm.zone || null,
      price_sale: editForm.price_sale ? parseFloat(editForm.price_sale) : null,
      hidden: editForm.hidden,
      featured: editForm.featured,
    }
    await supabase.from('properties').update(updates).eq('id', editingId)
    setProperties(prev => prev.map(p =>
      p.id === editingId ? { ...p, ...updates } : p
    ))
    setEditingId(null)
  }

  // ─── Hover handlers ──────────────────────────────────────────────────────────
  const handleHoverEnter = useCallback((prop: Property, top: number) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => {
      setHovered({ prop, top })
    }, 600)
  }, [])

  const handleHoverLeave = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    setHovered(null)
  }, [])

  // ─── Bulk actions ─────────────────────────────────────────────────────────────
  async function bulkUpdate(updates: Partial<{ hidden: boolean; featured: boolean; visibility: string }>) {
    await Promise.all(
      selected.map(id => supabase.from('properties').update(updates).eq('id', id))
    )
    await loadProperties()
    setSelected([])
  }

  async function bulkDelete() {
    if (!window.confirm(`¿Eliminar ${selected.length} propiedades?`)) return
    await Promise.all(
      selected.map(id => supabase.from('properties').delete().eq('id', id))
    )
    await loadProperties()
    setSelected([])
  }

  // ─── Tab counts ───────────────────────────────────────────────────────────────
  const counts = {
    featured: properties.filter((p) => p.featured && !p.hidden).length,
    public:   properties.filter((p) => !p.hidden && p.visibility !== 'private').length,
    private:  properties.filter((p) => p.visibility === 'private').length,
    meta:     properties.filter((p) => p.facebook_published === 'true').length,
    e24:      properties.filter((p) => p.encuentra24_published === 'true').length,
  }

  // ─── Filtering ────────────────────────────────────────────────────────────────
  const tabFiltered = properties.filter((p) => {
    if (activeTab === 'featured') return p.featured && !p.hidden
    if (activeTab === 'public')   return !p.hidden && p.visibility !== 'private'
    if (activeTab === 'private')  return p.visibility === 'private'
    if (activeTab === 'meta')     return p.facebook_published === 'true'
    if (activeTab === 'e24')      return p.encuentra24_published === 'true'
    return true
  })

  const displayed = tabFiltered.filter((p) => {
    if (filterStatus && p.status !== filterStatus) return false
    if (filterType   && p.property_type !== filterType) return false
    if (filterZone   && p.zone !== filterZone) return false
    if (filterTitle) {
      const q = filterTitle.toLowerCase()
      if (
        !p.title.toLowerCase().includes(q) &&
        !(p.title_es ?? '').toLowerCase().includes(q)
      ) return false
    }
    if (filterFeatured === 'yes' && !p.featured) return false
    if (filterFeatured === 'no'  &&  p.featured) return false
    if (search) {
      const q = search.toLowerCase()
      return p.title.toLowerCase().includes(q)
        || (p.title_es ?? '').toLowerCase().includes(q)
        || p.location_name.toLowerCase().includes(q)
        || (p.reference_id ?? '').toLowerCase().includes(q)
    }
    return true
  })

  const sortedDisplayed = activeTab === 'featured'
    ? [...displayed].sort((a, b) => (a.featured_order ?? 999) - (b.featured_order ?? 999))
    : displayed

  const paginated = activeTab === 'featured'
    ? sortedDisplayed
    : sortedDisplayed.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const showPagination = activeTab !== 'featured' && sortedDisplayed.length > PAGE_SIZE

  // ─── Select all (paginated rows) ──────────────────────────────────────────────
  const allPaginatedIds = paginated.map(p => p.id)
  const allSelected = allPaginatedIds.length > 0 && allPaginatedIds.every(id => selected.includes(id))

  function toggleSelectAll() {
    if (allSelected) {
      setSelected(prev => prev.filter(id => !allPaginatedIds.includes(id)))
    } else {
      setSelected(prev => Array.from(new Set([...prev, ...allPaginatedIds])))
    }
  }

  function toggleOne(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  function clearColumnFilters() {
    setFilterTitle('')
    setFilterZone('')
    setFilterStatus('')
    setFilterType('')
    setFilterFeatured('')
  }

  // ─── DnD ──────────────────────────────────────────────────────────────────────
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = sortedDisplayed.findIndex((p) => p.id === active.id)
    const newIdx = sortedDisplayed.findIndex((p) => p.id === over.id)
    const reordered = arrayMove(sortedDisplayed, oldIdx, newIdx)
    const updated = properties.map((p) => {
      const idx = reordered.findIndex((r) => r.id === p.id)
      return idx === -1 ? p : { ...p, featured_order: idx + 1 }
    })
    setProperties(updated)
    setSavingOrder(true)
    await Promise.all(
      reordered.map((p, idx) =>
        supabase.from('properties').update({ featured_order: idx + 1 }).eq('id', p.id)
      )
    )
    setSavingOrder(false)
  }

  const TABS: { key: Tab; label: string; icon?: React.ReactNode }[] = [
    { key: 'featured', label: `Featured (${counts.featured})`, icon: <Star className="w-3.5 h-3.5" /> },
    { key: 'public',   label: `Public (${counts.public})` },
    { key: 'private',  label: `Private (${counts.private})` },
    { key: 'meta',     label: `Meta (${counts.meta})` },
    { key: 'e24',      label: `E24 (${counts.e24})` },
  ]

  // Number of columns for colspan (checkbox + drag/thumb + title + zona + status + type + featured + actions)
  const colSpanFeatured = 9
  const colSpanStandard = 8

  // ─── Hover card safe top ──────────────────────────────────────────────────────
  // Avoid window.innerHeight directly in JSX; compute only when hovered state is set
  const hoverCardTop = hovered
    ? Math.max(80, Math.min(hovered.top - 200, 500))
    : 80

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Listings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {properties.length} propiedades totales
            {savingOrder && <span className="ml-2 text-primary animate-pulse"> · Saving order…</span>}
          </p>
        </div>
        <Link href="/admin/listings/new"
          className="flex items-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors w-fit">
          <Plus className="w-4 h-4" /> Nueva Propiedad
        </Link>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 border-b border-border mb-4 overflow-x-auto">
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* ── Main search bar ── */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search listings…"
            className="w-full pl-10 pr-4 py-2.5 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
      </div>

      {/* ── Bulk action bar ── */}
      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-4 px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg">
          <span className="text-sm font-medium text-primary">{selected.length} seleccionados</span>
          <button
            onClick={() => bulkUpdate({ hidden: false, visibility: 'public' })}
            className="px-3 py-1.5 rounded bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors"
          >
            Publicar
          </button>
          <button
            onClick={() => bulkUpdate({ hidden: true })}
            className="px-3 py-1.5 rounded bg-gray-500 text-white text-xs font-medium hover:bg-gray-600 transition-colors"
          >
            Ocultar
          </button>
          <button
            onClick={() => bulkUpdate({ featured: true })}
            className="px-3 py-1.5 rounded bg-amber-500 text-white text-xs font-medium hover:bg-amber-600 transition-colors"
          >
            Destacar
          </button>
          <button
            onClick={() => bulkUpdate({ featured: false })}
            className="px-3 py-1.5 rounded bg-amber-200 text-amber-800 text-xs font-medium hover:bg-amber-300 transition-colors"
          >
            Quitar
          </button>
          <button
            onClick={bulkDelete}
            className="px-3 py-1.5 rounded bg-destructive text-destructive-foreground text-xs font-medium hover:bg-destructive/90 transition-colors"
          >
            Eliminar
          </button>
          <button
            onClick={() => setSelected([])}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Copied URL toast ── */}
      {copiedUrl && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-sm px-4 py-2 rounded-full shadow-lg z-50 pointer-events-none">
          Link copied
        </div>
      )}

      {/* ── Hover preview card ── */}
      {hovered !== null && (
        <div
          style={{ position: 'fixed', right: 16, top: hoverCardTop, zIndex: 9999 }}
          className="w-80 bg-card border border-border rounded-lg shadow-2xl overflow-hidden pointer-events-none"
        >
          {/* Hero image */}
          <div className="relative w-full h-48 bg-secondary">
            {(hovered.prop.featured_images?.[0] ?? hovered.prop.images?.[0]) ? (
              <Image
                src={(hovered.prop.featured_images?.[0] ?? hovered.prop.images?.[0]) as string}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-secondary" />
            )}
            {/* Status badge */}
            <span className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_LABELS[hovered.prop.status]?.color ?? 'bg-gray-100 text-gray-600'}`}>
              {STATUS_LABELS[hovered.prop.status]?.label ?? hovered.prop.status}
            </span>
          </div>
          {/* Info */}
          <div className="p-3">
            <p className="font-semibold text-sm line-clamp-1">
              {hovered.prop.title_es || hovered.prop.title}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{hovered.prop.zone ?? hovered.prop.location_name}</p>
            <p className="text-sm font-semibold mt-1" style={{ color: '#C9A96E' }}>
              {formatPrice(hovered.prop.price_sale)}
            </p>
            {(hovered.prop.bedrooms != null || hovered.prop.bathrooms != null || hovered.prop.construction_size_sqm != null) && (
              <p className="text-xs text-muted-foreground mt-1">
                {[
                  hovered.prop.bedrooms != null ? `${hovered.prop.bedrooms} hab` : null,
                  hovered.prop.bathrooms != null ? `${hovered.prop.bathrooms} baños` : null,
                  hovered.prop.construction_size_sqm != null ? `${hovered.prop.construction_size_sqm} m²` : null,
                ].filter(Boolean).join(' · ')}
              </p>
            )}
            {hovered.prop.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {hovered.prop.description.slice(0, 100)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Table ── */}
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : sortedDisplayed.length === 0 ? (
        <div className="text-center py-12 card-elevated"><p className="text-muted-foreground text-sm">No properties found</p></div>
      ) : (
        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                {/* ── Column header row ── */}
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-3 py-3 w-8" />
                  {activeTab === 'featured' && <th className="px-3 py-3 w-8" />}
                  <th className="px-3 py-3 w-28 text-left font-medium text-muted-foreground">Foto</th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground">Propiedad</th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Zona</th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Status</th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Tipo</th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Destacado</th>
                  <th className="px-3 py-3 text-right font-medium text-muted-foreground">Acciones</th>
                </tr>
                {/* ── Inline column filter row ── */}
                <tr className="border-b border-border bg-secondary/10">
                  {/* Checkbox: select all */}
                  <th className="px-3 py-1.5 w-8">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="rounded"
                      title="Seleccionar todos"
                    />
                  </th>
                  {/* Drag handle placeholder */}
                  {activeTab === 'featured' && <th className="px-3 py-1.5 w-8" />}
                  {/* Foto: empty */}
                  <th className="px-3 py-1.5 w-28" />
                  {/* Title filter */}
                  <th className="px-3 py-1.5">
                    <div className="relative">
                      <input
                        type="text"
                        value={filterTitle}
                        onChange={(e) => setFilterTitle(e.target.value)}
                        placeholder="Título…"
                        className="w-full border border-input rounded px-2 py-1 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary/30 pr-6"
                      />
                      {filterTitle && (
                        <button
                          onClick={() => setFilterTitle('')}
                          className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </th>
                  {/* Zone filter */}
                  <th className="px-3 py-1.5 hidden md:table-cell">
                    <select
                      value={filterZone}
                      onChange={(e) => setFilterZone(e.target.value)}
                      className="w-full border border-input rounded px-1 py-1 text-xs bg-background focus:outline-none"
                    >
                      <option value="">Todas</option>
                      {ZONE_OPTIONS.map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                  </th>
                  {/* Status filter */}
                  <th className="px-3 py-1.5 hidden sm:table-cell">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full border border-input rounded px-1 py-1 text-xs bg-background focus:outline-none"
                    >
                      <option value="">Todos</option>
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{STATUS_LABELS[s]?.label ?? s}</option>
                      ))}
                    </select>
                  </th>
                  {/* Type filter */}
                  <th className="px-3 py-1.5 hidden md:table-cell">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full border border-input rounded px-1 py-1 text-xs bg-background focus:outline-none"
                    >
                      <option value="">Todos</option>
                      {TYPE_OPTIONS.map(t => (
                        <option key={t} value={t} className="capitalize">{t}</option>
                      ))}
                    </select>
                  </th>
                  {/* Featured filter */}
                  <th className="px-3 py-1.5 hidden lg:table-cell">
                    <select
                      value={filterFeatured}
                      onChange={(e) => setFilterFeatured(e.target.value)}
                      className="w-full border border-input rounded px-1 py-1 text-xs bg-background focus:outline-none"
                    >
                      <option value="">Todos</option>
                      <option value="yes">Sí</option>
                      <option value="no">No</option>
                    </select>
                  </th>
                  {/* Clear button */}
                  <th className="px-3 py-1.5 text-right">
                    <button
                      onClick={clearColumnFilters}
                      className="text-xs text-muted-foreground hover:text-foreground border border-input rounded px-2 py-0.5 hover:bg-secondary transition-colors"
                    >
                      Limpiar
                    </button>
                  </th>
                </tr>
              </thead>
              {activeTab === 'featured' ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={sortedDisplayed.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                    <tbody>
                      {paginated.map((prop) => (
                        <>
                          <SortableRow
                            key={prop.id}
                            prop={prop}
                            onCopyLink={handleCopyLink}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                            selected={selected}
                            onToggle={toggleOne}
                            onHoverEnter={handleHoverEnter}
                            onHoverLeave={handleHoverLeave}
                          />
                          {editingId === prop.id && (
                            <InlineEditRow
                              key={`edit-${prop.id}`}
                              prop={prop}
                              colSpan={colSpanFeatured}
                              editForm={editForm}
                              setEditForm={setEditForm}
                              onSave={handleSaveEdit}
                              onCancel={() => setEditingId(null)}
                            />
                          )}
                        </>
                      ))}
                    </tbody>
                  </SortableContext>
                </DndContext>
              ) : (
                <tbody>
                  {paginated.map((prop) => (
                    <>
                      <StandardRow
                        key={prop.id}
                        prop={prop}
                        onCopyLink={handleCopyLink}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                        selected={selected}
                        onToggle={toggleOne}
                        onHoverEnter={handleHoverEnter}
                        onHoverLeave={handleHoverLeave}
                      />
                      {editingId === prop.id && (
                        <InlineEditRow
                          key={`edit-${prop.id}`}
                          prop={prop}
                          colSpan={colSpanStandard}
                          editForm={editForm}
                          setEditForm={setEditForm}
                          onSave={handleSaveEdit}
                          onCancel={() => setEditingId(null)}
                        />
                      )}
                    </>
                  ))}
                </tbody>
              )}
            </table>
          </div>
          {showPagination && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm">
              <span className="text-muted-foreground">
                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sortedDisplayed.length)} de {sortedDisplayed.length}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 rounded border border-border disabled:opacity-40 hover:bg-secondary transition-colors"
                >
                  ← Anterior
                </button>
                <button
                  disabled={(page + 1) * PAGE_SIZE >= sortedDisplayed.length}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 rounded border border-border disabled:opacity-40 hover:bg-secondary transition-colors"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
