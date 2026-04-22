'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import type { DevFormData, DevRow, DevStatus } from './actions'
import { createDevelopment, updateDevelopment } from './actions'
import AIImportPanel from './AIImportPanel'
import ImageUploader from './ImageUploader'

const STATUS_OPTIONS: { value: DevStatus; label: string }[] = [
  { value: 'pre_sale',        label: 'Pre-Sale' },
  { value: 'in_construction', label: 'In Construction' },
  { value: 'delivered',       label: 'Delivered' },
  { value: 'sold_out',        label: 'Sold Out' },
]

const ZONE_OPTIONS = ['Escazú','Santa Ana','La Guácima','Ciudad Colón','Rohrmoser','Alajuela','Guanacaste','Pacífico Sur']

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

export default function DevForm({ row }: { row?: DevRow }) {
  const router = useRouter()
  const isEdit = Boolean(row)

  const [form, setForm] = useState<DevFormData>({
    slug:           row?.slug ?? '',
    name_en:        row?.name_en ?? '',
    name_es:        row?.name_es ?? '',
    subtitle_en:    row?.subtitle_en ?? '',
    subtitle_es:    row?.subtitle_es ?? '',
    description_en: row?.description_en ?? '',
    description_es: row?.description_es ?? '',
    location:       row?.location ?? '',
    zone:           row?.zone ?? '',
    status:         row?.status ?? 'pre_sale',
    delivery_date:  row?.delivery_date ?? '',
    price_from:     row?.price_from?.toString() ?? '',
    price_to:       row?.price_to?.toString() ?? '',
    unit_count:     row?.unit_count?.toString() ?? '',
    amenities:      (row?.amenities ?? []).join('\n'),
    hero_image:     row?.hero_image ?? '',
    gallery:        (row?.gallery ?? []).join('\n'),
    developer_name: row?.developer_name ?? '',
    brochure_url:   row?.brochure_url ?? '',
    video_url:      row?.video_url ?? '',
    featured:       row?.featured ?? false,
    published:      row?.published ?? true,
    display_order:  row?.display_order?.toString() ?? '',
  })

  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  const set = (k: keyof DevFormData, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }))

  const applyExtracted = (partial: Partial<DevFormData>) => {
    setForm(f => ({ ...f, ...partial }))
  }

  const handleNameEn = (v: string) => {
    set('name_en', v)
    if (!isEdit && !form.slug) set('slug', slugify(v))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (isEdit) {
        await updateDevelopment(row!.id, form)
      } else {
        await createDevelopment(form)
      }
      router.push('/admin/developments')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.')
      setSaving(false)
    }
  }

  const field = (
    label: string,
    key: keyof DevFormData,
    opts?: { type?: string; placeholder?: string; textarea?: boolean; rows?: number }
  ) => (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      {opts?.textarea ? (
        <textarea
          value={form[key] as string}
          onChange={e => set(key, e.target.value)}
          placeholder={opts.placeholder}
          rows={opts.rows ?? 3}
          className="w-full px-3 py-2 rounded border border-border bg-background text-sm focus:outline-none focus:border-[#C9A96E] resize-y"
        />
      ) : (
        <input
          type={opts?.type ?? 'text'}
          value={form[key] as string}
          onChange={e => set(key, e.target.value)}
          placeholder={opts?.placeholder}
          className="w-full px-3 py-2 rounded border border-border bg-background text-sm focus:outline-none focus:border-[#C9A96E]"
        />
      )}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">

      {/* ── AI Import ──────────────────────────────────────────────── */}
      <AIImportPanel onApply={applyExtracted} />

      {/* ── Identity ───────────────────────────────────────────────── */}
      <section className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="font-serif text-base text-foreground">Identity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Name (EN) *</label>
            <input
              required
              type="text"
              value={form.name_en}
              onChange={e => handleNameEn(e.target.value)}
              className="w-full px-3 py-2 rounded border border-border bg-background text-sm focus:outline-none focus:border-[#C9A96E]"
            />
          </div>
          {field('Name (ES)', 'name_es')}
          {field('Subtitle (EN)', 'subtitle_en')}
          {field('Subtitle (ES)', 'subtitle_es')}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Slug *</label>
            <input
              required
              type="text"
              value={form.slug}
              onChange={e => set('slug', e.target.value)}
              className="w-full px-3 py-2 rounded border border-border bg-background text-sm font-mono focus:outline-none focus:border-[#C9A96E]"
            />
          </div>
          {field('Developer Name', 'developer_name')}
        </div>
      </section>

      {/* ── Description ─────────────────────────────────────────────── */}
      <section className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="font-serif text-base text-foreground">Description</h2>
        {field('Description (EN)', 'description_en', { textarea: true, rows: 6, placeholder: 'Two or three paragraphs separated by blank lines.' })}
        {field('Description (ES)', 'description_es', { textarea: true, rows: 6 })}
      </section>

      {/* ── Location & Status ───────────────────────────────────────── */}
      <section className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="font-serif text-base text-foreground">Location & Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field('Location Name', 'location', { placeholder: 'e.g. Trejos Montealegre' })}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Zone</label>
            <select
              value={form.zone}
              onChange={e => set('zone', e.target.value)}
              className="w-full px-3 py-2 rounded border border-border bg-background text-sm focus:outline-none focus:border-[#C9A96E]"
            >
              <option value="">— none —</option>
              {ZONE_OPTIONS.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Status *</label>
            <select
              required
              value={form.status}
              onChange={e => set('status', e.target.value as DevStatus)}
              className="w-full px-3 py-2 rounded border border-border bg-background text-sm focus:outline-none focus:border-[#C9A96E]"
            >
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          {field('Delivery Date', 'delivery_date', { type: 'date' })}
        </div>
      </section>

      {/* ── Pricing & Units ─────────────────────────────────────────── */}
      <section className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="font-serif text-base text-foreground">Pricing & Units</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {field('Price From (USD)', 'price_from', { type: 'number', placeholder: '500000' })}
          {field('Price To (USD)', 'price_to', { type: 'number', placeholder: '2000000' })}
          {field('Unit Count', 'unit_count', { type: 'number', placeholder: '12' })}
        </div>
      </section>

      {/* ── Amenities ───────────────────────────────────────────────── */}
      <section className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="font-serif text-base text-foreground">Amenities</h2>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">One amenity per line</label>
          <textarea
            value={form.amenities}
            onChange={e => set('amenities', e.target.value)}
            rows={6}
            placeholder={"Pool\n24/7 Security\nClubhouse\nGym"}
            className="w-full px-3 py-2 rounded border border-border bg-background text-sm focus:outline-none focus:border-[#C9A96E] font-mono resize-y"
          />
        </div>
      </section>

      {/* ── Media ───────────────────────────────────────────────────── */}
      <section className="bg-card border border-border rounded-lg p-6 space-y-5">
        <h2 className="font-serif text-base text-foreground">Media</h2>
        <ImageUploader
          label="Hero Image"
          single
          value={form.hero_image}
          onChange={v => set('hero_image', v)}
        />
        <ImageUploader
          label="Gallery"
          value={form.gallery}
          onChange={v => set('gallery', v)}
        />
        {field('Brochure URL', 'brochure_url', { placeholder: 'https://…' })}
        {field('Video URL (YouTube embed)', 'video_url', { placeholder: 'https://youtube.com/embed/…' })}
      </section>

      {/* ── Settings ────────────────────────────────────────────────── */}
      <section className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="font-serif text-base text-foreground">Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {field('Display Order', 'display_order', { type: 'number', placeholder: '1' })}
          <div className="flex items-center gap-6 mt-5">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={e => set('featured', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              Featured on homepage
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={form.published}
                onChange={e => set('published', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              Published
            </label>
          </div>
        </div>
      </section>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded bg-[#1A1A1A] text-white text-sm font-medium hover:bg-[#2C2C2C] disabled:opacity-60 transition-colors"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? 'Save Changes' : 'Create Development'}
        </button>
        <a href="/admin/developments" className="px-5 py-2.5 rounded border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          Cancel
        </a>
      </div>
    </form>
  )
}
