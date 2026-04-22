'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2, Eye, EyeOff, X, Loader2 } from 'lucide-react'
import type { InteriorProjectRow, CatalogItemRow, BeforeAfterPair } from './actions'
import {
  saveInteriorProject, deleteInteriorProject, toggleProjectPublished,
  saveCatalogItem, deleteCatalogItem, toggleCatalogPublished,
} from './actions'

type Tab = 'projects' | 'catalog'

const CATALOG_CATEGORIES = ['furniture', 'finishes', 'lighting', 'other']

// ── Shared helpers ───────────────────────────────────────────────────────────

function TogglePublished({ published, onToggle }: { published: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground" title={published ? 'Unpublish' : 'Publish'}>
      {published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
    </button>
  )
}

// ── Project Form Modal ────────────────────────────────────────────────────────

function ProjectModal({
  row,
  onClose,
  onSaved,
}: {
  row: InteriorProjectRow | null
  onClose: () => void
  onSaved: (updated: InteriorProjectRow) => void
}) {
  const [title, setTitle]               = useState(row?.title ?? '')
  const [description, setDescription]   = useState(row?.description ?? '')
  const [cover, setCover]               = useState(row?.cover ?? '')
  const [category, setCategory]         = useState(row?.category ?? '')
  const [displayOrder, setDisplayOrder] = useState(row?.display_order?.toString() ?? '')
  const [published, setPublished]       = useState(row?.published ?? true)
  const [gallery, setGallery]           = useState((row?.gallery ?? []).join('\n'))
  const [pairs, setPairs]               = useState<BeforeAfterPair[]>(
    row?.before_after_pairs ?? []
  )
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const addPair = () => setPairs(p => [...p, { before_url: '', after_url: '', caption: '' }])
  const removePair = (i: number) => setPairs(p => p.filter((_, idx) => idx !== i))
  const updatePair = (i: number, k: keyof BeforeAfterPair, v: string) =>
    setPairs(p => p.map((pair, idx) => idx === i ? { ...pair, [k]: v } : pair))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await saveInteriorProject(row?.id ?? null, {
        title, description, cover,
        before_after_pairs: pairs.filter(p => p.before_url && p.after_url),
        gallery: gallery.split('\n').map(u => u.trim()).filter(Boolean),
        category, display_order: displayOrder, published,
      })
      onSaved({
        id: row?.id ?? '',
        title, description, cover,
        before_after_pairs: pairs,
        gallery: gallery.split('\n').map(u => u.trim()).filter(Boolean),
        category, display_order: displayOrder ? parseInt(displayOrder) : null,
        published, created_at: row?.created_at ?? new Date().toISOString(),
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.')
      setSaving(false)
    }
  }

  const inputCls = "w-full px-3 py-2 rounded border border-border bg-background text-sm focus:outline-none focus:border-[#C9A96E]"

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-serif text-lg">{row ? 'Edit Project' : 'New Project'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-5">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Title *</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className={`${inputCls} resize-y`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Cover Image URL</label>
              <input value={cover} onChange={e => setCover(e.target.value)} placeholder="https://…" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
              <input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Residential" className={inputCls} />
            </div>
          </div>

          {/* Before / After pairs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-muted-foreground">Before / After Pairs</label>
              <button type="button" onClick={addPair} className="text-xs text-[#C9A96E] hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add pair</button>
            </div>
            {pairs.length === 0 && <p className="text-xs text-muted-foreground">No pairs yet.</p>}
            {pairs.map((pair, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 mb-2 items-start">
                <input value={pair.before_url} onChange={e => updatePair(i, 'before_url', e.target.value)} placeholder="Before URL" className={inputCls} />
                <input value={pair.after_url}  onChange={e => updatePair(i, 'after_url',  e.target.value)} placeholder="After URL"  className={inputCls} />
                <input value={pair.caption}    onChange={e => updatePair(i, 'caption',    e.target.value)} placeholder="Caption"    className={inputCls} />
                <button type="button" onClick={() => removePair(i)} className="mt-2 text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>
              </div>
            ))}
          </div>

          {/* Gallery */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Gallery URLs (one per line)</label>
            <textarea value={gallery} onChange={e => setGallery(e.target.value)} rows={4} placeholder={"https://…\nhttps://…"} className={`${inputCls} resize-y font-mono text-xs`} />
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Display Order</label>
              <input type="number" value={displayOrder} onChange={e => setDisplayOrder(e.target.value)} className={inputCls} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-sm mt-4">
              <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} className="w-4 h-4 rounded" />
              Published
            </label>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#1A1A1A] text-white text-sm font-medium hover:bg-[#2C2C2C] disabled:opacity-60 transition-colors"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Catalog Item Form Modal ───────────────────────────────────────────────────

function CatalogModal({
  row,
  onClose,
  onSaved,
}: {
  row: CatalogItemRow | null
  onClose: () => void
  onSaved: (updated: CatalogItemRow) => void
}) {
  const [name, setName]               = useState(row?.name ?? '')
  const [description, setDescription] = useState(row?.description ?? '')
  const [image, setImage]             = useState(row?.image ?? '')
  const [category, setCategory]       = useState(row?.category ?? '')
  const [price, setPrice]             = useState(row?.price?.toString() ?? '')
  const [displayOrder, setDisplayOrder] = useState(row?.display_order?.toString() ?? '')
  const [published, setPublished]     = useState(row?.published ?? true)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await saveCatalogItem(row?.id ?? null, { name, description, image, category, price, display_order: displayOrder, published })
      onSaved({
        id: row?.id ?? '',
        name, description, image,
        category: category as CatalogItemRow['category'],
        price: price ? parseFloat(price) : null,
        display_order: displayOrder ? parseInt(displayOrder) : null,
        published, created_at: row?.created_at ?? new Date().toISOString(),
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.')
      setSaving(false)
    }
  }

  const inputCls = "w-full px-3 py-2 rounded border border-border bg-background text-sm focus:outline-none focus:border-[#C9A96E]"

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-serif text-lg">{row ? 'Edit Item' : 'New Item'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Name *</label>
            <input required value={name} onChange={e => setName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className={`${inputCls} resize-y`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
                <option value="">— none —</option>
                {CATALOG_CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Price (USD)</label>
              <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Image URL</label>
            <input value={image} onChange={e => setImage(e.target.value)} placeholder="https://…" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Display Order</label>
              <input type="number" value={displayOrder} onChange={e => setDisplayOrder(e.target.value)} className={inputCls} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-sm mt-4">
              <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} className="w-4 h-4 rounded" />
              Published
            </label>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded bg-[#1A1A1A] text-white text-sm font-medium hover:bg-[#2C2C2C] disabled:opacity-60 transition-colors">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function InteriorDesignAdmin({
  projects: initialProjects,
  catalog: initialCatalog,
}: {
  projects: InteriorProjectRow[]
  catalog: CatalogItemRow[]
}) {
  const [tab, setTab]                   = useState<Tab>('projects')
  const [projects, setProjects]         = useState(initialProjects)
  const [catalog, setCatalog]           = useState(initialCatalog)
  const [projectModal, setProjectModal] = useState<InteriorProjectRow | null | 'new'>(undefined as any)
  const [catalogModal, setCatalogModal] = useState<CatalogItemRow | null | 'new'>(undefined as any)
  const [, startTransition]             = useTransition()

  const openProjectModal  = (r: InteriorProjectRow | null) => setProjectModal(r)
  const closeProjectModal = () => setProjectModal(undefined as any)
  const openCatalogModal  = (r: CatalogItemRow | null) => setCatalogModal(r)
  const closeCatalogModal = () => setCatalogModal(undefined as any)

  const handleProjectSaved = (updated: InteriorProjectRow) => {
    setProjects(prev => {
      const idx = prev.findIndex(p => p.id === updated.id)
      if (idx >= 0) return prev.map((p, i) => i === idx ? updated : p)
      return [...prev, updated]
    })
  }

  const handleCatalogSaved = (updated: CatalogItemRow) => {
    setCatalog(prev => {
      const idx = prev.findIndex(p => p.id === updated.id)
      if (idx >= 0) return prev.map((p, i) => i === idx ? updated : p)
      return [...prev, updated]
    })
  }

  const handleDeleteProject = (id: string) => {
    if (!confirm('Delete this project?')) return
    setProjects(prev => prev.filter(p => p.id !== id))
    startTransition(() => deleteInteriorProject(id))
  }

  const handleDeleteCatalog = (id: string) => {
    if (!confirm('Delete this item?')) return
    setCatalog(prev => prev.filter(p => p.id !== id))
    startTransition(() => deleteCatalogItem(id))
  }

  const handleToggleProject = (id: string, val: boolean) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, published: val } : p))
    startTransition(() => toggleProjectPublished(id, val))
  }

  const handleToggleCatalog = (id: string, val: boolean) => {
    setCatalog(prev => prev.map(p => p.id === id ? { ...p, published: val } : p))
    startTransition(() => toggleCatalogPublished(id, val))
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border mb-6">
        {(['projects', 'catalog'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 capitalize transition-colors ${
              tab === t ? 'border-[#1A1A1A] text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t} ({t === 'projects' ? projects.length : catalog.length})
          </button>
        ))}
      </div>

      {/* Projects tab */}
      {tab === 'projects' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => openProjectModal(null)}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#1A1A1A] text-white text-sm font-medium hover:bg-[#2C2C2C] transition-colors"
            >
              <Plus className="w-4 h-4" /> New Project
            </button>
          </div>

          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground bg-card border border-border rounded-lg p-8 text-center">
              No projects yet.
            </p>
          ) : (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="px-4 py-3 w-16 font-medium text-muted-foreground text-left">Cover</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-left">Title</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-left hidden md:table-cell">Category</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-left hidden sm:table-cell">Pairs</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map(p => (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3">
                        {p.cover
                          ? <div className="relative w-12 h-12 rounded overflow-hidden"><Image src={p.cover} alt="" fill className="object-cover" unoptimized /></div>
                          : <div className="w-12 h-12 rounded bg-secondary" />
                        }
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{p.title}</p>
                        {!p.published && <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Draft</span>}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{p.category ?? '—'}</td>
                      <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{p.before_after_pairs?.length ?? 0} pairs · {p.gallery?.length ?? 0} imgs</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <TogglePublished published={p.published} onToggle={() => handleToggleProject(p.id, !p.published)} />
                          <button onClick={() => openProjectModal(p)} className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeleteProject(p.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Catalog tab */}
      {tab === 'catalog' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => openCatalogModal(null)}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#1A1A1A] text-white text-sm font-medium hover:bg-[#2C2C2C] transition-colors"
            >
              <Plus className="w-4 h-4" /> New Item
            </button>
          </div>

          {catalog.length === 0 ? (
            <p className="text-sm text-muted-foreground bg-card border border-border rounded-lg p-8 text-center">
              No catalog items yet.
            </p>
          ) : (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="px-4 py-3 w-16 font-medium text-muted-foreground text-left">Image</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-left">Name</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-left hidden sm:table-cell">Category</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-left hidden md:table-cell">Price</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {catalog.map(item => (
                    <tr key={item.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3">
                        {item.image
                          ? <div className="relative w-12 h-12 rounded overflow-hidden"><Image src={item.image} alt="" fill className="object-cover" unoptimized /></div>
                          : <div className="w-12 h-12 rounded bg-secondary" />
                        }
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{item.name}</p>
                        {!item.published && <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Draft</span>}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground capitalize">{item.category ?? '—'}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                        {item.price ? `$${item.price.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <TogglePublished published={item.published} onToggle={() => handleToggleCatalog(item.id, !item.published)} />
                          <button onClick={() => openCatalogModal(item)} className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeleteCatalog(item.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {projectModal !== undefined && (
        <ProjectModal
          row={projectModal === null ? null : (projectModal as InteriorProjectRow)}
          onClose={closeProjectModal}
          onSaved={handleProjectSaved}
        />
      )}
      {catalogModal !== undefined && (
        <CatalogModal
          row={catalogModal === null ? null : (catalogModal as CatalogItemRow)}
          onClose={closeCatalogModal}
          onSaved={handleCatalogSaved}
        />
      )}
    </div>
  )
}
