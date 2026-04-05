'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, X, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  'for_sale',
  'for_rent',
  'both',
  'presale',
  'under_contract',
  'sold',
  'rented',
]

const TYPE_OPTIONS = [
  'house',
  'condo',
  'apartment',
  'land',
  'commercial',
  'office',
  'farm',
  'penthouse',
]

const ZONES = [
  'Escazú',
  'Santa Ana',
  'La Guácima',
  'Ciudad Colón',
  'Rohrmoser',
  'La Sabana',
  'Pavas',
  'San Rafael de Alajuela',
  'Guanacaste',
  'Pacífico Sur',
  'Sin zona',
]

const TIER_OPTIONS = ['luxury', 'high', 'mid', 'entry']

const VISIBILITY_OPTIONS = ['public', 'private', 'curated']

// ─── Types ────────────────────────────────────────────────────────────────────

interface AiResult {
  title?: string
  title_en?: string
  status?: string
  price_sale?: string | number
  price_rent_monthly?: string | number
  location_name?: string
  zone?: string
  property_type?: string
  bedrooms?: string | number
  bathrooms?: string | number
  construction_size_sqm?: string | number
  lot_size_sqm?: string | number
  description?: string
  description_en?: string
  currency?: string
  tier?: string
  images?: string[]
  reference_id?: string
}

// ─── Section Divider ─────────────────────────────────────────────────────────

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mt-8 mb-4">
      <span className="font-serif text-lg font-semibold text-foreground">{title}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

// ─── Input helpers ────────────────────────────────────────────────────────────

const inputCls = (hasError?: boolean) =>
  `w-full px-3 py-2.5 border rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
    hasError ? 'border-destructive ring-1 ring-destructive/40' : 'border-input'
  }`

const selectCls =
  'w-full px-3 py-2.5 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20'

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewListingPage() {
  const router = useRouter()

  // ── Form state ────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    title: '',
    title_en: '',
    location_name: '',
    zone: '',
    property_type: 'house',
    status: 'for_sale',
    price_sale: '',
    price_rent_monthly: '',
    currency: 'USD',
    tier: '',
    bedrooms: '',
    bathrooms: '',
    construction_size_sqm: '',
    lot_size_sqm: '',
    description: '',
    description_en: '',
    featured: false,
    hidden: false,
    visibility: 'public',
    facebook_published: false,
    encuentra24_published: false,
    reference_id: '',
    imageUrls: [] as string[],
  })

  const set = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  // ── Validation state ──────────────────────────────────────────────────────
  const [submitted, setSubmitted] = useState(false)

  const missingTitle = submitted && !form.title.trim()
  const missingLocation = submitted && !form.location_name.trim()
  const showWarning = missingTitle || missingLocation

  // ── Save state ────────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // ── AI state ──────────────────────────────────────────────────────────────
  const [importUrl, setImportUrl] = useState('')
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState<AiResult | null>(null)
  const [aiSuccess, setAiSuccess] = useState(false)

  // ── Image URL input ───────────────────────────────────────────────────────
  const [newImageUrl, setNewImageUrl] = useState('')

  // ─── Slug helper ────────────────────────────────────────────────────────────
  const buildSlug = (title: string) =>
    title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

  // ─── Apply AI result to form ─────────────────────────────────────────────
  const applyAiResult = (data: AiResult) => {
    setForm((prev) => ({
      ...prev,
      title: data.title ?? prev.title,
      title_en: data.title_en ?? prev.title_en,
      status: data.status ?? prev.status,
      price_sale: data.price_sale !== undefined ? String(data.price_sale) : prev.price_sale,
      price_rent_monthly:
        data.price_rent_monthly !== undefined
          ? String(data.price_rent_monthly)
          : prev.price_rent_monthly,
      location_name: data.location_name ?? prev.location_name,
      zone: data.zone ?? prev.zone,
      property_type: data.property_type ?? prev.property_type,
      bedrooms: data.bedrooms !== undefined ? String(data.bedrooms) : prev.bedrooms,
      bathrooms: data.bathrooms !== undefined ? String(data.bathrooms) : prev.bathrooms,
      construction_size_sqm:
        data.construction_size_sqm !== undefined
          ? String(data.construction_size_sqm)
          : prev.construction_size_sqm,
      lot_size_sqm:
        data.lot_size_sqm !== undefined ? String(data.lot_size_sqm) : prev.lot_size_sqm,
      description: data.description ?? prev.description,
      description_en: data.description_en ?? prev.description_en,
      currency: data.currency ?? prev.currency,
      tier: data.tier ?? prev.tier,
      reference_id: data.reference_id ?? prev.reference_id,
      imageUrls: data.images?.length ? data.images : prev.imageUrls,
    }))
  }

  // ─── AI handlers ─────────────────────────────────────────────────────────
  const handleImportUrl = async () => {
    if (!importUrl.trim()) return
    setImportLoading(true)
    setAiError(null)
    setAiSuccess(false)
    try {
      const { data, error } = await supabase.functions.invoke('import-listing-url', {
        body: { url: importUrl.trim() },
      })
      if (error) throw new Error(error.message)
      setAiResult(data as AiResult)
      applyAiResult(data as AiResult)
      setAiSuccess(true)
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Error al importar URL')
    } finally {
      setImportLoading(false)
    }
  }

  const handleAiGenerate = async () => {
    if (!aiText.trim()) return
    setAiLoading(true)
    setAiError(null)
    setAiSuccess(false)
    try {
      const { data, error } = await supabase.functions.invoke('ai-listing-generate', {
        body: { text: aiText.trim() },
      })
      if (error) throw new Error(error.message)
      setAiResult(data as AiResult)
      applyAiResult(data as AiResult)
      setAiSuccess(true)
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Error al generar con IA')
    } finally {
      setAiLoading(false)
    }
  }

  // ─── Image helpers ────────────────────────────────────────────────────────
  const addImageUrl = () => {
    const trimmed = newImageUrl.trim()
    if (!trimmed) return
    set('imageUrls', [...form.imageUrls, trimmed])
    setNewImageUrl('')
  }

  const removeImageUrl = (index: number) => {
    set('imageUrls', form.imageUrls.filter((_, i) => i !== index))
  }

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setSaveError(null)

    // Warn but do NOT block save
    setSaving(true)

    const slug = buildSlug(form.title || `listing-${Date.now()}`)

    const { error: err } = await supabase.from('properties').insert({
      title: form.title || null,
      title_en: form.title_en || null,
      slug,
      location_name: form.location_name || null,
      zone: form.zone || null,
      property_type: form.property_type,
      status: form.status,
      price_sale: form.price_sale ? parseInt(form.price_sale) : null,
      price_rent_monthly: form.price_rent_monthly ? parseInt(form.price_rent_monthly) : null,
      currency: form.currency,
      tier: form.tier || null,
      bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
      bathrooms: form.bathrooms ? parseFloat(form.bathrooms) : null,
      construction_size_sqm: form.construction_size_sqm
        ? parseInt(form.construction_size_sqm)
        : null,
      lot_size_sqm: form.lot_size_sqm ? parseInt(form.lot_size_sqm) : null,
      description: form.description || null,
      description_en: form.description_en || null,
      featured: form.featured,
      hidden: form.hidden,
      visibility: form.visibility,
      facebook_published: form.facebook_published,
      encuentra24_published: form.encuentra24_published,
      reference_id: form.reference_id || null,
      images: form.imageUrls.length > 0 ? form.imageUrls : null,
    })

    if (err) {
      setSaveError(err.message)
      setSaving(false)
      return
    }

    router.push('/admin/listings')
  }

  const anyAiLoading = aiLoading || importLoading

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/listings"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-serif text-2xl font-semibold">Nueva Propiedad</h1>
      </div>

      {/* Validation warning banner */}
      {showWarning && (
        <div className="mb-4 px-4 py-3 rounded border border-yellow-400/60 bg-yellow-50 text-yellow-800 text-sm">
          ⚠ Complete los campos requeridos marcados en rojo (el listing se puede guardar incompleto)
        </div>
      )}

      {/* Save error banner */}
      {saveError && (
        <div className="mb-4 px-4 py-3 rounded border border-destructive/20 bg-destructive/10 text-destructive text-sm">
          {saveError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-0">

        {/* ── 1. IA ──────────────────────────────────────────────────────── */}
        <SectionDivider title="IA" />

        <div className="card-elevated p-5 space-y-4">
          <p className="text-base font-semibold">🤖 Importar con IA</p>

          {/* URL import row */}
          <div className="flex gap-2">
            <input
              type="url"
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              placeholder="https://... pega URL de listing externo"
              className={inputCls() + ' flex-1'}
            />
            <button
              type="button"
              onClick={handleImportUrl}
              disabled={anyAiLoading || !importUrl.trim()}
              className="shrink-0 px-4 py-2.5 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {importLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Importar URL
            </button>
          </div>

          {/* Text generate row */}
          <div className="space-y-2">
            <textarea
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              placeholder="Pega descripción, texto, o datos del listing..."
              rows={4}
              className={inputCls() + ' resize-none'}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAiGenerate}
                disabled={anyAiLoading || !aiText.trim()}
                className="px-4 py-2.5 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
              >
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Generar con IA
              </button>
            </div>
          </div>

          {/* Status indicators */}
          {anyAiLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Procesando...
            </div>
          )}
          {aiError && (
            <p className="text-sm text-destructive">{aiError}</p>
          )}
          {aiSuccess && !anyAiLoading && (
            <p className="text-sm text-green-600 font-medium">✓ Datos importados</p>
          )}

          {/* AI result preview card */}
          {aiResult && (
            <div className="rounded border border-border bg-secondary/30 p-3 space-y-1 text-sm">
              {aiResult.title && (
                <p>
                  <span className="font-medium">Título:</span> {aiResult.title}
                </p>
              )}
              {aiResult.status && (
                <p>
                  <span className="font-medium">Estado:</span> {aiResult.status}
                </p>
              )}
              {(aiResult.price_sale || aiResult.price_rent_monthly) && (
                <p>
                  <span className="font-medium">Precio:</span>{' '}
                  {aiResult.price_sale
                    ? `Venta: ${aiResult.price_sale}`
                    : `Alquiler: ${aiResult.price_rent_monthly}`}
                </p>
              )}
            </div>
          )}

          {/* Apply all button */}
          {aiResult && (
            <button
              type="button"
              onClick={() => applyAiResult(aiResult)}
              className="w-full py-2 rounded border border-primary text-primary text-sm font-medium hover:bg-primary/5 transition-colors"
            >
              Aplicar todo
            </button>
          )}
        </div>

        {/* ── 2. Esencial ───────────────────────────────────────────────── */}
        <SectionDivider title="Esencial" />

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">
              Título (ES) <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              className={inputCls(missingTitle)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Título (EN)</label>
            <input
              type="text"
              value={form.title_en}
              onChange={(e) => set('title_en', e.target.value)}
              className={inputCls()}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Ubicación <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={form.location_name}
              onChange={(e) => set('location_name', e.target.value)}
              className={inputCls(missingLocation)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Zona</label>
            <select
              value={form.zone}
              onChange={(e) => set('zone', e.target.value)}
              className={selectCls}
            >
              <option value="">— Sin asignar —</option>
              {ZONES.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Tipo de propiedad</label>
            <select
              value={form.property_type}
              onChange={(e) => set('property_type', e.target.value)}
              className={selectCls}
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Estado</label>
            <select
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
              className={selectCls}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── 3. Especificaciones ───────────────────────────────────────── */}
        <SectionDivider title="Especificaciones" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Habitaciones</label>
            <input
              type="number"
              min="0"
              value={form.bedrooms}
              onChange={(e) => set('bedrooms', e.target.value)}
              className={inputCls()}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Baños</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={form.bathrooms}
              onChange={(e) => set('bathrooms', e.target.value)}
              className={inputCls()}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Construcción (m²)</label>
            <input
              type="number"
              min="0"
              value={form.construction_size_sqm}
              onChange={(e) => set('construction_size_sqm', e.target.value)}
              className={inputCls()}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Terreno (m²)</label>
            <input
              type="number"
              min="0"
              value={form.lot_size_sqm}
              onChange={(e) => set('lot_size_sqm', e.target.value)}
              className={inputCls()}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Precio de venta</label>
            <input
              type="number"
              min="0"
              value={form.price_sale}
              onChange={(e) => set('price_sale', e.target.value)}
              className={inputCls()}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Alquiler mensual</label>
            <input
              type="number"
              min="0"
              value={form.price_rent_monthly}
              onChange={(e) => set('price_rent_monthly', e.target.value)}
              className={inputCls()}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Moneda</label>
            <select
              value={form.currency}
              onChange={(e) => set('currency', e.target.value)}
              className={selectCls}
            >
              <option value="USD">USD</option>
              <option value="CRC">CRC</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Tier</label>
            <select
              value={form.tier}
              onChange={(e) => set('tier', e.target.value)}
              className={selectCls}
            >
              <option value="">— Sin asignar —</option>
              {TIER_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── 4. Contenido ES|EN ─────────────────────────────────────────── */}
        <SectionDivider title="Contenido ES|EN" />

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Descripción (ES)</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={6}
              className={inputCls() + ' resize-none'}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Descripción (EN)</label>
            <textarea
              value={form.description_en}
              onChange={(e) => set('description_en', e.target.value)}
              rows={6}
              className={inputCls() + ' resize-none'}
            />
          </div>
        </div>

        {/* ── 5. Imágenes ───────────────────────────────────────────────── */}
        <SectionDivider title="Imágenes" />

        <div className="space-y-4">
          {/* Placeholder / preview */}
          <div>
            <p className="text-sm font-medium mb-2">Vista previa de imagen</p>
            {form.imageUrls.length === 0 ? (
              <img
                src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400"
                alt="placeholder"
                className="w-full max-w-sm rounded border border-border object-cover h-48"
              />
            ) : (
              <img
                src={form.imageUrls[0]}
                alt="preview"
                className="w-full max-w-sm rounded border border-border object-cover h-48"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'
                }}
              />
            )}
          </div>

          {/* URL input to add images */}
          <div className="flex gap-2">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="https://... URL de imagen"
              className={inputCls() + ' flex-1'}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addImageUrl()
                }
              }}
            />
            <button
              type="button"
              onClick={addImageUrl}
              disabled={!newImageUrl.trim()}
              className="shrink-0 px-3 py-2.5 rounded border border-border text-sm hover:bg-secondary disabled:opacity-50 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          </div>

          {/* List of added URLs */}
          {form.imageUrls.length > 0 && (
            <ul className="space-y-2">
              {form.imageUrls.map((url, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 rounded border border-border bg-secondary/30 text-sm"
                >
                  <span className="flex-1 truncate text-muted-foreground">{url}</span>
                  <button
                    type="button"
                    onClick={() => removeImageUrl(i)}
                    className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── 6. Visibilidad ────────────────────────────────────────────── */}
        <SectionDivider title="Visibilidad" />

        <div className="space-y-4">
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set('featured', e.target.checked)}
                className="rounded"
              />
              Destacado
            </label>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.hidden}
                onChange={(e) => set('hidden', e.target.checked)}
                className="rounded"
              />
              Oculto en sitio
            </label>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.facebook_published}
                onChange={(e) => set('facebook_published', e.target.checked)}
                className="rounded"
              />
              Publicado en Facebook
            </label>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.encuentra24_published}
                onChange={(e) => set('encuentra24_published', e.target.checked)}
                className="rounded"
              />
              Publicado en Encuentra24
            </label>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Visibilidad</label>
            <select
              value={form.visibility}
              onChange={(e) => set('visibility', e.target.value)}
              className={selectCls}
            >
              {VISIBILITY_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">ID de referencia</label>
            <input
              type="text"
              value={form.reference_id}
              onChange={(e) => set('reference_id', e.target.value)}
              className={inputCls()}
            />
          </div>
        </div>

        {/* ── 7. Guardar ────────────────────────────────────────────────── */}
        <SectionDivider title="Guardar" />

        <div className="flex gap-3 pb-8">
          <Link
            href="/admin/listings"
            className="flex-1 text-center py-2.5 rounded border border-border text-sm hover:bg-secondary transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2.5 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Crear Propiedad'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
