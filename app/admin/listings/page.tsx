'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Plus, Search, Loader2, Pencil, ExternalLink,
  Link2, FileText, Star, GripVertical, Filter,
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
  created_at: string
  slug: string | null
  reference_id: string | null
}

type Tab = 'featured' | 'public' | 'private' | 'meta' | 'e24'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  for_sale:       { label: 'Venta',       color: 'bg-emerald-100 text-emerald-800' },
  for_rent:       { label: 'Alquiler',    color: 'bg-blue-100 text-blue-800' },
  presale:        { label: 'Preventa',    color: 'bg-purple-100 text-purple-800' },
  under_contract: { label: 'Contrato',    color: 'bg-yellow-100 text-yellow-800' },
  sold:           { label: 'Vendido',     color: 'bg-gray-100 text-gray-500' },
  rented:         { label: 'Alquilado',   color: 'bg-gray-100 text-gray-500' },
}

const TYPE_OPTIONS = ['apartment','house','condo','land','commercial','office','farm','penthouse']
const STATUS_OPTIONS = Object.keys(STATUS_LABELS)
const TIER_OPTIONS = ['luxury','high','mid','entry']

function formatPrice(n: number | null) {
  return n ? `$${n.toLocaleString()}` : '—'
}

function RowActions({ prop, onCopyLink }: { prop: Property; onCopyLink: (url: string) => void }) {
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
      <Link href={`/admin/listings/${prop.id}`}
        className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-secondary transition-colors" title="Edit">
        <Pencil className="w-3.5 h-3.5" />
      </Link>
    </div>
  )
}

function SortableRow({ prop, onCopyLink }: { prop: Property; onCopyLink: (url: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: prop.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  const thumb = prop.images?.[0]
  const displayTitle = prop.title_es || prop.title
  return (
    <tr ref={setNodeRef} style={style}
      className="border-b border-border last:border-b-0 hover:bg-secondary/20 transition-colors">
      <td className="px-3 py-2 w-8">
        <button {...attributes} {...listeners}
          className="cursor-grab text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing">
          <GripVertical className="w-4 h-4" />
        </button>
      </td>
      <td className="px-3 py-2 w-14">
        {thumb
          ? <div className="relative w-10 h-10 rounded overflow-hidden"><Image src={thumb} alt="" fill className="object-cover" unoptimized /></div>
          : <div className="w-10 h-10 rounded bg-secondary" />}
      </td>
      <td className="px-3 py-2">
        <p className="font-medium text-sm line-clamp-1">{displayTitle}</p>
        <p className="text-xs text-muted-foreground">{prop.location_name}</p>
      </td>
      <td className="px-3 py-2 hidden md:table-cell text-sm text-muted-foreground capitalize">{prop.property_type}</td>
      <td className="px-3 py-2 hidden sm:table-cell">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_LABELS[prop.status]?.color ?? 'bg-gray-100 text-gray-600'}`}>
          {STATUS_LABELS[prop.status]?.label ?? prop.status}
        </span>
      </td>
      <td className="px-3 py-2 hidden lg:table-cell text-sm">
        {prop.price_sale ? <span className="font-medium">{formatPrice(prop.price_sale)}</span>
          : <span className="text-muted-foreground">{formatPrice(prop.price_rent_monthly)}/mo</span>}
      </td>
      <td className="px-3 py-2 hidden xl:table-cell text-xs text-muted-foreground">
        {new Date(prop.created_at).toLocaleDateString('es-CR')}
      </td>
      <td className="px-3 py-2"><RowActions prop={prop} onCopyLink={onCopyLink} /></td>
    </tr>
  )
}

function StandardRow({ prop, onCopyLink }: { prop: Property; onCopyLink: (url: string) => void }) {
  const thumb = prop.images?.[0]
  const displayTitle = prop.title_es || prop.title
  const isMeta = prop.facebook_published === 'true'
  const isE24  = prop.encuentra24_published === 'true'
  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-secondary/20 transition-colors">
      <td className="px-3 py-2 w-14">
        {thumb
          ? <div className="relative w-10 h-10 rounded overflow-hidden"><Image src={thumb} alt="" fill className="object-cover" unoptimized /></div>
          : <div className="w-10 h-10 rounded bg-secondary" />}
      </td>
      <td className="px-3 py-2">
        <div className="flex items-start gap-1.5 flex-wrap">
          {isMeta && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">META</span>}
          {isE24  && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">E24</span>}
        </div>
        <p className="font-medium text-sm line-clamp-1">{displayTitle}</p>
        <p className="text-xs text-muted-foreground">{prop.location_name}</p>
      </td>
      <td className="px-3 py-2 hidden md:table-cell text-sm text-muted-foreground capitalize">{prop.property_type}</td>
      <td className="px-3 py-2 hidden sm:table-cell">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_LABELS[prop.status]?.color ?? 'bg-gray-100 text-gray-600'}`}>
          {STATUS_LABELS[prop.status]?.label ?? prop.status}
        </span>
      </td>
      <td className="px-3 py-2 hidden lg:table-cell text-sm">
        {prop.price_sale ? <span className="font-medium">{formatPrice(prop.price_sale)}</span>
          : <span className="text-muted-foreground">{formatPrice(prop.price_rent_monthly)}/mo</span>}
      </td>
      <td className="px-3 py-2 hidden xl:table-cell text-xs text-muted-foreground">
        {new Date(prop.created_at).toLocaleDateString('es-CR')}
      </td>
      <td className="px-3 py-2"><RowActions prop={prop} onCopyLink={onCopyLink} /></td>
    </tr>
  )
}

export default function AdminListings() {
  const [properties, setProperties]     = useState<Property[]>([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [activeTab, setActiveTab]       = useState<Tab>('public')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType]     = useState('')
  const [filterTier, setFilterTier]     = useState('')
  const [copiedUrl, setCopiedUrl]       = useState(false)
  const [showFilters, setShowFilters]   = useState(false)
  const [savingOrder, setSavingOrder]   = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => { loadProperties() }, [])

  async function loadProperties() {
    const { data } = await supabase
      .from('properties')
      .select('id,title,title_es,location_name,price_sale,price_rent_monthly,status,property_type,tier,featured,featured_order,hidden,visibility,facebook_published,encuentra24_published,images,created_at,slug,reference_id')
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

  const counts = {
    featured: properties.filter((p) => p.featured && !p.hidden).length,
    public:   properties.filter((p) => !p.hidden && p.visibility !== 'private').length,
    private:  properties.filter((p) => p.visibility === 'private').length,
    meta:     properties.filter((p) => p.facebook_published === 'true').length,
    e24:      properties.filter((p) => p.encuentra24_published === 'true').length,
  }

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
    if (filterTier   && p.tier !== filterTier) return false
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

  const hasFilters = filterStatus || filterType || filterTier

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Listings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {displayed.length} of {properties.length} properties
            {savingOrder && <span className="ml-2 text-primary animate-pulse"> · Saving order…</span>}
          </p>
        </div>
        <Link href="/admin/listings/new"
          className="flex items-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors w-fit">
          <Plus className="w-4 h-4" /> Add Listing
        </Link>
      </div>
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
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search listings…"
            className="w-full pl-10 pr-4 py-2.5 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2.5 rounded border text-sm transition-colors ${
            hasFilters ? 'border-primary bg-primary/10 text-primary' : 'border-input text-muted-foreground hover:text-foreground'
          }`}>
          <Filter className="w-4 h-4" />
          Filters{hasFilters ? ` (${[filterStatus,filterType,filterTier].filter(Boolean).length})` : ''}
        </button>
      </div>
      {showFilters && (
        <div className="flex flex-wrap gap-3 mb-4 p-4 bg-secondary/30 rounded-lg border border-border">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm border border-input rounded px-2 py-1.5 bg-background focus:outline-none">
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]?.label ?? s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Type</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
              className="text-sm border border-input rounded px-2 py-1.5 bg-background focus:outline-none">
              <option value="">All Types</option>
              {TYPE_OPTIONS.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tier</label>
            <select value={filterTier} onChange={(e) => setFilterTier(e.target.value)}
              className="text-sm border border-input rounded px-2 py-1.5 bg-background focus:outline-none">
              <option value="">All Tiers</option>
              {TIER_OPTIONS.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
            </select>
          </div>
          {hasFilters && <button onClick={() => { setFilterStatus(''); setFilterType(''); setFilterTier('') }}
            className="text-xs text-muted-foreground hover:text-foreground underline">Clear</button>}
        </div>
      )}
      {copiedUrl && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-sm px-4 py-2 rounded-full shadow-lg z-50 pointer-events-none">
          ✓ Link copied
        </div>
      )}
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : sortedDisplayed.length === 0 ? (
        <div className="text-center py-12 card-elevated"><p className="text-muted-foreground text-sm">No properties found</p></div>
      ) : (
        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  {activeTab === 'featured' && <th className="px-3 py-3 w-8" />}
                  <th className="px-3 py-3 w-14 text-left font-medium text-muted-foreground">Photo</th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground">Property</th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Type</th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Status</th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Sale Price</th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground hidden xl:table-cell">Date</th>
                  <th className="px-3 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              {activeTab === 'featured' ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={sortedDisplayed.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                    <tbody>
                      {sortedDisplayed.map((prop) => <SortableRow key={prop.id} prop={prop} onCopyLink={handleCopyLink} />)}
                    </tbody>
                  </SortableContext>
                </DndContext>
              ) : (
                <tbody>
                  {sortedDisplayed.map((prop) => <StandardRow key={prop.id} prop={prop} onCopyLink={handleCopyLink} />)}
                </tbody>
              )}
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
