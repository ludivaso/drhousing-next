'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Loader2,
  ExternalLink,
  FileDown,
  Sparkles,
  Trash2,
  Plus,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

type Tab = 'esencial' | 'specs' | 'contenido' | 'imagenes' | 'visibilidad' | 'ubicacion' | 'ai'

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

export default function EditListingPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [slug, setSlug] = useState('')
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('esencial')

  // PDF export
  const [pdfLang, setPdfLang] = useState<'es' | 'en'>('es')
  const [exportingPdf, setExportingPdf] = useState(false)

  // AI tab
  const [aiLoading, setAiLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [importUrl, setImportUrl] = useState('')
  const [aiError, setAiError] = useState<string | null>(null)

  // Image inputs
  const [newImageUrl, setNewImageUrl] = useState('')
  const [newFeaturedUrl, setNewFeaturedUrl] = useState('')

  const [images, setImages] = useState<string[]>([])
  const [featuredImages, setFeaturedImages] = useState<string[]>([])

  const [form, setForm] = useState({
    title: '',
    title_en: '',
    title_es: '',
    subtitle: '',
    subtitle_en: '',
    description: '',
    description_en: '',
    description_es: '',
    status: 'for_sale',
    property_type: 'house',
    tier: 'high_end',
    zone: '',
    location_name: '',
    price_sale: '',
    price_rent_monthly: '',
    currency: 'USD',
    bedrooms: '',
    bathrooms: '',
    garage_spaces: '',
    construction_size_sqm: '',
    land_size_sqm: '',
    levels: '',
    year_built: '',
    furnished: '',
    features_es: '',
    features_en: '',
    amenities_es: '',
    amenities_en: '',
    plusvalia_notes: '',
    youtube_url: '',
    youtube_enabled: false,
    youtube_label_es: '',
    youtube_label_en: '',
    hidden: false,
    visibility: 'public',
    featured: false,
    featured_order: '',
    internal_notes: '',
    lat: '',
    lng: '',
  })

  // ── Load ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) {
          setSlug(data.slug ?? '')
          setUpdatedAt((data as Record<string, unknown>).updated_at as string ?? null)
          setImages(data.images ?? [])
          setFeaturedImages(data.featured_images ?? [])
          setForm({
            title: data.title ?? '',
            title_en: data.title_en ?? '',
            title_es: data.title_es ?? '',
            subtitle: data.subtitle ?? '',
            subtitle_en: data.subtitle_en ?? '',
            description: data.description ?? '',
            description_en: data.description_en ?? '',
            description_es: data.description_es ?? '',
            status: data.status ?? 'for_sale',
            property_type: data.property_type ?? 'house',
            tier: data.tier ?? 'high_end',
            zone: (data as Record<string, unknown>).zone as string ?? '',
            location_name: data.location_name ?? '',
            price_sale: data.price_sale?.toString() ?? '',
            price_rent_monthly: data.price_rent_monthly?.toString() ?? '',
            currency: data.currency ?? 'USD',
            bedrooms: data.bedrooms?.toString() ?? '',
            bathrooms: data.bathrooms?.toString() ?? '',
            garage_spaces: data.garage_spaces?.toString() ?? '',
            construction_size_sqm: data.construction_size_sqm?.toString() ?? '',
            land_size_sqm: data.land_size_sqm?.toString() ?? '',
            levels: data.levels?.toString() ?? '',
            year_built: data.year_built?.toString() ?? '',
            furnished: data.furnished ?? '',
            features_es: (data.features_es as string[] ?? []).join('\n'),
            features_en: (data.features_en as string[] ?? []).join('\n'),
            amenities_es: (data.amenities_es as string[] ?? []).join('\n'),
            amenities_en: (data.amenities_en as string[] ?? []).join('\n'),
            plusvalia_notes: data.plusvalia_notes ?? '',
            youtube_url: data.youtube_url ?? '',
            youtube_enabled: data.youtube_enabled ?? false,
            youtube_label_es: data.youtube_label_es ?? '',
            youtube_label_en: data.youtube_label_en ?? '',
            hidden: data.hidden ?? false,
            visibility: data.visibility ?? 'public',
            featured: data.featured ?? false,
            featured_order: data.featured_order?.toString() ?? '',
            internal_notes: data.internal_notes ?? '',
            lat: data.lat?.toString() ?? '',
            lng: data.lng?.toString() ?? '',
          })
        }
        setLoading(false)
      })
  }, [id])

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const inp = (field: string) => ({
    value: form[field as keyof typeof form] as string,
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => setForm((prev) => ({ ...prev, [field]: e.target.value })),
    className:
      'w-full px-3 py-2.5 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20',
  })

  const sel = (field: string) => ({
    value: form[field as keyof typeof form] as string,
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value })),
    className:
      'w-full px-3 py-2.5 border border-input rounded bg-background text-sm focus:outline-none',
  })

  const toggle = (field: 'hidden' | 'featured' | 'youtube_enabled') =>
    setForm((prev) => ({ ...prev, [field]: !prev[field] }))

  // ── PDF export ───────────────────────────────────────────────────────────────
  const handleExportPdf = async () => {
    setExportingPdf(true)
    try {
      const res = await fetch(`/api/pdf/brochure?id=${id}&lang=${pdfLang}`)
      if (!res.ok) {
        const j = await res.json() as { error?: string }
        throw new Error(j.error ?? 'Error')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `drhousing-${slug || id}-${pdfLang}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al generar PDF')
    } finally {
      setExportingPdf(false)
    }
  }

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      title: form.title,
      title_en: form.title_en || null,
      title_es: form.title_es || null,
      subtitle: form.subtitle || null,
      subtitle_en: form.subtitle_en || null,
      description: form.description || null,
      description_en: form.description_en || null,
      description_es: form.description_es || null,
      status: form.status,
      property_type: form.property_type,
      tier: form.tier,
      zone: form.zone || null,
      location_name: form.location_name,
      price_sale: form.price_sale ? parseInt(form.price_sale) : null,
      price_rent_monthly: form.price_rent_monthly ? parseInt(form.price_rent_monthly) : null,
      currency: form.currency,
      bedrooms: form.bedrooms ? parseInt(form.bedrooms) : 0,
      bathrooms: form.bathrooms ? parseFloat(form.bathrooms) : 0,
      garage_spaces: form.garage_spaces ? parseInt(form.garage_spaces) : null,
      construction_size_sqm: form.construction_size_sqm
        ? parseInt(form.construction_size_sqm)
        : null,
      land_size_sqm: form.land_size_sqm ? parseInt(form.land_size_sqm) : null,
      levels: form.levels ? parseInt(form.levels) : null,
      year_built: form.year_built ? parseInt(form.year_built) : null,
      furnished: form.furnished || null,
      features_es: form.features_es ? form.features_es.split('\n').filter(Boolean) : null,
      features_en: form.features_en ? form.features_en.split('\n').filter(Boolean) : null,
      amenities_es: form.amenities_es ? form.amenities_es.split('\n').filter(Boolean) : null,
      amenities_en: form.amenities_en ? form.amenities_en.split('\n').filter(Boolean) : null,
      plusvalia_notes: form.plusvalia_notes || null,
      youtube_url: form.youtube_url || null,
      youtube_enabled: form.youtube_enabled,
      youtube_label_es: form.youtube_label_es || null,
      youtube_label_en: form.youtube_label_en || null,
      hidden: form.hidden,
      visibility: form.visibility,
      featured: form.featured,
      featured_order: form.featured_order ? parseInt(form.featured_order) : null,
      internal_notes: form.internal_notes || null,
      lat: form.lat ? parseFloat(form.lat) : null,
      lng: form.lng ? parseFloat(form.lng) : null,
      images,
      featured_images: featuredImages,
    }

    const { error: err } = await supabase
      .from('properties')
      .update(payload as never)
      .eq('id', id)

    if (err) {
      setError(err.message)
      setSaving(false)
      return
    }

    router.push('/admin/listings')
  }

  // ── AI handlers ──────────────────────────────────────────────────────────────
  const handleAiGenerate = async () => {
    setAiLoading(true)
    setAiError(null)
    try {
      const res = await fetch(`/api/ai/generate-listing?id=${id}`)
      if (res.status === 404) throw new Error('Esta función requiere configuración de IA')
      if (!res.ok) throw new Error('Error al generar contenido')
      const json = await res.json() as {
        title?: string
        description?: string
        features_es?: string[]
        amenities_es?: string[]
      }
      setForm((prev) => ({
        ...prev,
        title: json.title ?? prev.title,
        description: json.description ?? prev.description,
        features_es: json.features_es ? json.features_es.join('\n') : prev.features_es,
        amenities_es: json.amenities_es ? json.amenities_es.join('\n') : prev.amenities_es,
      }))
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setAiLoading(false)
    }
  }

  const handleImport = async () => {
    if (!importUrl.trim()) return
    setImportLoading(true)
    setAiError(null)
    try {
      const res = await fetch(`/api/import-listing?url=${encodeURIComponent(importUrl)}`)
      if (res.status === 404) throw new Error('Esta función requiere configuración de IA')
      if (!res.ok) throw new Error('Error al importar desde URL')
      const json = await res.json() as Partial<typeof form>
      setForm((prev) => ({ ...prev, ...json }))
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setImportLoading(false)
    }
  }

  // ── Image helpers ────────────────────────────────────────────────────────────
  const addImage = () => {
    const url = newImageUrl.trim()
    if (!url) return
    setImages((prev) => [...prev, url])
    setNewImageUrl('')
  }

  const addFeatured = () => {
    const url = newFeaturedUrl.trim()
    if (!url) return
    setFeaturedImages((prev) => [...prev, url])
    setNewFeaturedUrl('')
  }

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // ── Tab definitions ──────────────────────────────────────────────────────────
  const TABS: { key: Tab; label: string }[] = [
    { key: 'esencial', label: 'Esencial' },
    { key: 'specs', label: 'Especificaciones' },
    { key: 'contenido', label: 'Contenido' },
    { key: 'imagenes', label: 'Imágenes' },
    { key: 'visibilidad', label: 'Visibilidad' },
    { key: 'ubicacion', label: 'Ubicación' },
    { key: 'ai', label: 'IA' },
  ]

  const sectionHeader = (title: string) => (
    <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-4">
      {title}
    </h3>
  )

  const label = (text: string) => (
    <label className="text-sm font-medium mb-1 block">{text}</label>
  )

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Link
          href="/admin/listings"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-serif text-2xl font-semibold">Editar Propiedad</h1>

        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {/* Last updated */}
          {updatedAt && (
            <span className="text-xs text-muted-foreground hidden sm:block">
              Actualizado:{' '}
              {new Date(updatedAt).toLocaleDateString('es-CR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          )}

          {/* PDF export */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <select
              value={pdfLang}
              onChange={(e) => setPdfLang(e.target.value as 'es' | 'en')}
              className="px-2 py-1.5 text-xs bg-background border-r border-border focus:outline-none"
            >
              <option value="es">ES</option>
              <option value="en">EN</option>
            </select>
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={exportingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-background hover:bg-secondary transition-colors disabled:opacity-60"
            >
              {exportingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              PDF
            </button>
          </div>

          {/* Ver en sitio */}
          {slug && (
            <Link
              href={`/property/${slug}`}
              target="_blank"
              className="text-sm text-primary flex items-center gap-1 hover:underline"
            >
              <ExternalLink className="w-4 h-4" /> Ver en sitio
            </Link>
          )}

          {/* Save button */}
          <button
            form="edit-form"
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Guardar cambios
          </button>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded p-3 text-sm text-destructive mb-4">
          {error}
        </div>
      )}

      {/* ── Tab bar ── */}
      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              tab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Form ── */}
      <form id="edit-form" onSubmit={handleSubmit}>
        {/* ══ ESENCIAL ══ */}
        {tab === 'esencial' && (
          <div className="space-y-4">
            {sectionHeader('Información esencial')}

            {/* Title — full width */}
            <div>
              {label('Título *')}
              <input type="text" required {...inp('title')} />
            </div>

            {/* Status — full width */}
            <div>
              {label('Estado')}
              <select {...sel('status')}>
                <option value="for_sale">En venta</option>
                <option value="for_rent">En alquiler</option>
                <option value="both">Venta y alquiler</option>
                <option value="sold">Vendido</option>
                <option value="rented">Alquilado</option>
                <option value="presale">Preventa</option>
                <option value="under_contract">Bajo contrato</option>
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Property type */}
              <div>
                {label('Tipo de propiedad')}
                <select {...sel('property_type')}>
                  <option value="house">Casa</option>
                  <option value="condo">Condominio</option>
                  <option value="apartment">Apartamento</option>
                  <option value="land">Terreno</option>
                  <option value="commercial">Comercial</option>
                  <option value="townhouse">Townhouse</option>
                </select>
              </div>

              {/* Tier */}
              <div>
                {label('Categoría')}
                <select {...sel('tier')}>
                  <option value="mid">Medio</option>
                  <option value="high_end">High End</option>
                  <option value="ultra_luxury">Ultra Lujo</option>
                </select>
              </div>

              {/* Zone */}
              <div>
                {label('Zona')}
                <select {...sel('zone')}>
                  <option value="">— Sin asignar —</option>
                  {ZONES.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>

              {/* Currency */}
              <div>
                {label('Moneda')}
                <select {...sel('currency')}>
                  <option value="USD">USD</option>
                  <option value="CRC">CRC</option>
                </select>
              </div>
            </div>

            {/* Location — full width */}
            <div>
              {label('Nombre de ubicación *')}
              <input type="text" required {...inp('location_name')} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Price sale */}
              <div>
                {label('Precio de venta')}
                <input type="number" min="0" {...inp('price_sale')} />
              </div>

              {/* Price rent */}
              <div>
                {label('Precio de alquiler mensual')}
                <input type="number" min="0" {...inp('price_rent_monthly')} />
              </div>
            </div>
          </div>
        )}

        {/* ══ ESPECIFICACIONES ══ */}
        {tab === 'specs' && (
          <div className="space-y-4">
            {sectionHeader('Especificaciones técnicas')}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                {label('Habitaciones')}
                <input type="number" min="0" {...inp('bedrooms')} />
              </div>
              <div>
                {label('Baños')}
                <input type="number" min="0" step="0.5" {...inp('bathrooms')} />
              </div>
              <div>
                {label('Espacios de garage')}
                <input type="number" min="0" {...inp('garage_spaces')} />
              </div>
              <div>
                {label('Niveles')}
                <input type="number" min="0" {...inp('levels')} />
              </div>
              <div>
                {label('Construcción (m²)')}
                <input type="number" min="0" {...inp('construction_size_sqm')} />
              </div>
              <div>
                {label('Terreno (m²)')}
                <input type="number" min="0" {...inp('land_size_sqm')} />
              </div>
              <div>
                {label('Año de construcción')}
                <input type="number" min="1900" max="2100" {...inp('year_built')} />
              </div>
              <div>
                {label('Amueblado')}
                <select {...sel('furnished')}>
                  <option value="">Sin especificar</option>
                  <option value="yes">Amueblado</option>
                  <option value="no">Sin amueblar</option>
                  <option value="partial">Parcialmente</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ══ CONTENIDO ══ */}
        {tab === 'contenido' && (
          <div className="space-y-6">
            {sectionHeader('Títulos y descripciones')}

            {/* Language column headers */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground pb-1 border-b border-border">
                ES
              </div>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground pb-1 border-b border-border">
                EN
              </div>
            </div>

            {/* title_es | title_en */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                {label('Título ES')}
                <input type="text" {...inp('title_es')} />
              </div>
              <div>
                {label('Título EN')}
                <input type="text" {...inp('title_en')} />
              </div>
            </div>

            {/* subtitle | subtitle_en */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                {label('Subtítulo ES')}
                <input type="text" {...inp('subtitle')} />
              </div>
              <div>
                {label('Subtítulo EN')}
                <input type="text" {...inp('subtitle_en')} />
              </div>
            </div>

            {/* description_es | description_en */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                {label('Descripción ES')}
                <textarea rows={8} {...inp('description_es')} className="w-full px-3 py-2.5 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              </div>
              <div>
                {label('Descripción EN')}
                <textarea rows={8} {...inp('description_en')} className="w-full px-3 py-2.5 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              </div>
            </div>

            {/* features_es | features_en */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                {label('Características ES')}
                <p className="text-xs text-muted-foreground mb-1">una característica por línea</p>
                <textarea rows={6} {...inp('features_es')} className="w-full px-3 py-2.5 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              </div>
              <div>
                {label('Características EN')}
                <p className="text-xs text-muted-foreground mb-1">una característica por línea</p>
                <textarea rows={6} {...inp('features_en')} className="w-full px-3 py-2.5 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              </div>
            </div>

            {/* amenities_es | amenities_en */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                {label('Amenidades ES')}
                <p className="text-xs text-muted-foreground mb-1">una amenidad por línea</p>
                <textarea rows={4} {...inp('amenities_es')} className="w-full px-3 py-2.5 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              </div>
              <div>
                {label('Amenidades EN')}
                <p className="text-xs text-muted-foreground mb-1">una amenidad por línea</p>
                <textarea rows={4} {...inp('amenities_en')} className="w-full px-3 py-2.5 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              </div>
            </div>

            {/* plusvalia_notes — full width */}
            <div>
              {label('Notas de plusvalía')}
              <textarea rows={4} {...inp('plusvalia_notes')} className="w-full px-3 py-2.5 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
            </div>

            {/* YouTube section */}
            <div className="space-y-3 pt-2 border-t border-border">
              {sectionHeader('Video YouTube')}
              <div>
                {label('URL de YouTube')}
                <input type="url" {...inp('youtube_url')} placeholder="https://youtube.com/watch?v=..." />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.youtube_enabled}
                  onChange={() => toggle('youtube_enabled')}
                  className="rounded"
                />
                Mostrar video en el sitio
              </label>
              {form.youtube_url && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    {label('Etiqueta del video ES')}
                    <input type="text" {...inp('youtube_label_es')} />
                  </div>
                  <div>
                    {label('Etiqueta del video EN')}
                    <input type="text" {...inp('youtube_label_en')} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ IMÁGENES ══ */}
        {tab === 'imagenes' && (
          <div className="space-y-8">
            {/* Gallery images */}
            <div>
              {sectionHeader('Imágenes de la propiedad')}
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
                {images.map((url, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded overflow-hidden bg-secondary group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="object-cover w-full h-full" />
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage() } }}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2.5 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded bg-secondary text-sm hover:bg-secondary/80 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              </div>
            </div>

            {/* Featured images */}
            <div>
              {sectionHeader('Imágenes destacadas (portada)')}
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
                {featuredImages.slice(0, 5).map((url, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded overflow-hidden bg-secondary group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="object-cover w-full h-full" />
                    <button
                      type="button"
                      onClick={() =>
                        setFeaturedImages((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              {featuredImages.length < 5 && (
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newFeaturedUrl}
                    onChange={(e) => setNewFeaturedUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeatured() } }}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2.5 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={addFeatured}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded bg-secondary text-sm hover:bg-secondary/80 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Agregar
                  </button>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">Máximo 5 imágenes destacadas</p>
            </div>
          </div>
        )}

        {/* ══ VISIBILIDAD ══ */}
        {tab === 'visibilidad' && (
          <div className="space-y-4">
            {sectionHeader('Visibilidad y publicación')}

            {/* hidden toggle */}
            <label className="flex items-center gap-3 text-sm cursor-pointer p-3 rounded border border-border hover:bg-secondary/40 transition-colors">
              <input
                type="checkbox"
                checked={form.hidden}
                onChange={() => toggle('hidden')}
                className="rounded"
              />
              <div>
                <div className="font-medium">Ocultar en el sitio público</div>
                <div className="text-xs text-muted-foreground">
                  La propiedad no aparecerá en los listados ni búsquedas
                </div>
              </div>
            </label>

            {/* visibility select */}
            <div>
              {label('Visibilidad')}
              <select {...sel('visibility')}>
                <option value="public">Público</option>
                <option value="private">Privado</option>
                <option value="hidden">Oculto</option>
              </select>
            </div>

            {/* featured toggle */}
            <label className="flex items-center gap-3 text-sm cursor-pointer p-3 rounded border border-border hover:bg-secondary/40 transition-colors">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={() => toggle('featured')}
                className="rounded"
              />
              <div>
                <div className="font-medium">Propiedad destacada</div>
                <div className="text-xs text-muted-foreground">
                  Aparece en la sección destacada del inicio
                </div>
              </div>
            </label>

            {/* featured_order — only if featured */}
            {form.featured && (
              <div>
                {label('Orden de aparición destacada')}
                <input type="number" min="1" {...inp('featured_order')} />
              </div>
            )}

            {/* internal_notes */}
            <div>
              {label('Notas internas')}
              <p className="text-xs text-muted-foreground mb-1">Solo visible en admin</p>
              <textarea
                rows={5}
                {...inp('internal_notes')}
                className="w-full px-3 py-2.5 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
          </div>
        )}

        {/* ══ UBICACIÓN ══ */}
        {tab === 'ubicacion' && (
          <div className="space-y-4">
            {sectionHeader('Coordenadas geográficas')}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                {label('Latitud')}
                <input type="number" step="any" {...inp('lat')} placeholder="9.9347" />
              </div>
              <div>
                {label('Longitud')}
                <input type="number" step="any" {...inp('lng')} placeholder="-84.0875" />
              </div>
            </div>
            {form.lat && form.lng && (
              <iframe
                src={`https://www.google.com/maps?q=${form.lat},${form.lng}&hl=es&z=15&output=embed`}
                className="w-full h-64 rounded border border-border mt-4"
                loading="lazy"
              />
            )}
          </div>
        )}

        {/* ══ IA ══ */}
        {tab === 'ai' && (
          <div className="space-y-8">
            {sectionHeader('Herramientas de IA')}

            {aiError && (
              <div className="bg-destructive/10 border border-destructive/20 rounded p-3 text-sm text-destructive">
                {aiError}
              </div>
            )}

            {/* Generate */}
            <div className="p-4 rounded-lg border border-border space-y-3">
              <div>
                <div className="font-medium text-sm">Generar contenido con IA</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Genera título, descripción, características y amenidades automáticamente
                  para esta propiedad.
                </div>
              </div>
              <button
                type="button"
                onClick={handleAiGenerate}
                disabled={aiLoading}
                className="flex items-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
              >
                {aiLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Generar contenido con IA
              </button>
            </div>

            {/* Import from URL */}
            <div className="p-4 rounded-lg border border-border space-y-3">
              <div>
                <div className="font-medium text-sm">Importar desde URL</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Extrae los datos de una propiedad publicada en otro sitio web.
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2.5 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={importLoading || !importUrl.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded bg-secondary text-sm font-medium hover:bg-secondary/80 disabled:opacity-60 transition-colors"
                >
                  {importLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Importar
                </button>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* ── Bottom save bar ── */}
      <div className="flex gap-3 pt-6 mt-6 border-t border-border">
        <Link
          href="/admin/listings"
          className="flex-1 text-center py-2.5 rounded border border-border text-sm hover:bg-secondary transition-colors"
        >
          Cancelar
        </Link>
        <button
          form="edit-form"
          type="submit"
          disabled={saving}
          className="flex-1 py-2.5 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
            </>
          ) : (
            'Guardar cambios'
          )}
        </button>
      </div>
    </div>
  )
}
