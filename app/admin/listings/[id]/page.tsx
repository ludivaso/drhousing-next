'use client'

import { useEffect, useRef, useState } from 'react'
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

type Agent = { id: string; name: string }

type AiResult = {
  title?: string
  title_es?: string
  title_en?: string
  description?: string
  description_es?: string
  description_en?: string
  features_es?: string[]
  features_en?: string[]
  amenities_es?: string[]
  amenities_en?: string[]
}

function SectionDivider({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mt-10 mb-5">
      <span className="text-xl">{icon}</span>
      <span className="font-serif text-lg font-semibold text-foreground">{title}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

export default function EditListingPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successToast, setSuccessToast] = useState(false)
  const [errorToast, setErrorToast] = useState<string | null>(null)
  const [slug, setSlug] = useState('')
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  // Auto-save
  const [isDirty, setIsDirty] = useState(false)
  const [autoSaveMsg, setAutoSaveMsg] = useState(false)

  // Agents
  const [agents, setAgents] = useState<Agent[]>([])

  // PDF export
  const [pdfLang, setPdfLang] = useState<'es' | 'en'>('es')
  const [exportingPdf, setExportingPdf] = useState(false)

  // AI section
  const [aiLoading, setAiLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [importUrl, setImportUrl] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState<AiResult | null>(null)

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
    building_name: '',
    price_sale: '',
    price_rent_monthly: '',
    currency: 'USD',
    original_price: '',
    price_note: '',
    bedrooms: '',
    bathrooms: '',
    garage_spaces: '',
    construction_size_sqm: '',
    land_size_sqm: '',
    terrace_sqm: '',
    garden_sqm: '',
    levels: '',
    floor_number: '',
    year_built: '',
    year_renovated: '',
    property_condition: '',
    furnished: '',
    features_es: '',
    features_en: '',
    amenities_es: '',
    amenities_en: '',
    plusvalia_notes: '',
    internal_notes: '',
    youtube_url: '',
    youtube_enabled: false,
    youtube_label_es: '',
    youtube_label_en: '',
    hidden: false,
    visibility: 'public',
    featured: false,
    featured_order: '',
    lat: '',
    lng: '',
    // Agent & source
    listing_agent_id: '',
    external_agent_name: '',
    external_agent_phone: '',
    listing_source: '',
    reference_id: '',
    // Legal
    ownership_type: '',
    folio_real: '',
    plano_catastrado: '',
    has_encumbrances: false,
    encumbrances_notes: '',
    condo_regulations_available: false,
    // Rental
    deposit_amount: '',
    min_lease_months: '',
    hoa_monthly: '',
    annual_property_tax: '',
    pet_policy: '',
    included_services: '',
    appliances_included: '',
    // Availability & publishing
    availability_date: '',
    facebook_published: false,
    encuentra24_published: false,
  })

  // track initial load to avoid marking dirty on first set
  const initialLoad = useRef(true)

  // ── Load property ──────────────────────────────────────────────────────────
  useEffect(() => {
    supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) {
          const d = data as Record<string, unknown>
          setSlug((d.slug as string) ?? '')
          setUpdatedAt((d.updated_at as string) ?? null)
          setImages((d.images as string[]) ?? [])
          setFeaturedImages((d.featured_images as string[]) ?? [])
          setForm({
            title: (d.title as string) ?? '',
            title_en: (d.title_en as string) ?? '',
            title_es: (d.title_es as string) ?? '',
            subtitle: (d.subtitle as string) ?? '',
            subtitle_en: (d.subtitle_en as string) ?? '',
            description: (d.description as string) ?? '',
            description_en: (d.description_en as string) ?? '',
            description_es: (d.description_es as string) ?? '',
            status: (d.status as string) ?? 'for_sale',
            property_type: (d.property_type as string) ?? 'house',
            tier: (d.tier as string) ?? 'high_end',
            zone: (d.zone as string) ?? '',
            location_name: (d.location_name as string) ?? '',
            building_name: (d.building_name as string) ?? '',
            price_sale: d.price_sale != null ? String(d.price_sale) : '',
            price_rent_monthly: d.price_rent_monthly != null ? String(d.price_rent_monthly) : '',
            currency: (d.currency as string) ?? 'USD',
            original_price: d.original_price != null ? String(d.original_price) : '',
            price_note: (d.price_note as string) ?? '',
            bedrooms: d.bedrooms != null ? String(d.bedrooms) : '',
            bathrooms: d.bathrooms != null ? String(d.bathrooms) : '',
            garage_spaces: d.garage_spaces != null ? String(d.garage_spaces) : '',
            construction_size_sqm: d.construction_size_sqm != null ? String(d.construction_size_sqm) : '',
            land_size_sqm: d.land_size_sqm != null ? String(d.land_size_sqm) : '',
            terrace_sqm: d.terrace_sqm != null ? String(d.terrace_sqm) : '',
            garden_sqm: d.garden_sqm != null ? String(d.garden_sqm) : '',
            levels: d.levels != null ? String(d.levels) : '',
            floor_number: d.floor_number != null ? String(d.floor_number) : '',
            year_built: d.year_built != null ? String(d.year_built) : '',
            year_renovated: d.year_renovated != null ? String(d.year_renovated) : '',
            property_condition: (d.property_condition as string) ?? '',
            furnished: (d.furnished as string) ?? '',
            features_es: ((d.features_es as string[]) ?? []).join('\n'),
            features_en: ((d.features_en as string[]) ?? []).join('\n'),
            amenities_es: ((d.amenities_es as string[]) ?? []).join('\n'),
            amenities_en: ((d.amenities_en as string[]) ?? []).join('\n'),
            plusvalia_notes: (d.plusvalia_notes as string) ?? '',
            internal_notes: (d.internal_notes as string) ?? '',
            youtube_url: (d.youtube_url as string) ?? '',
            youtube_enabled: (d.youtube_enabled as boolean) ?? false,
            youtube_label_es: (d.youtube_label_es as string) ?? '',
            youtube_label_en: (d.youtube_label_en as string) ?? '',
            hidden: (d.hidden as boolean) ?? false,
            visibility: (d.visibility as string) ?? 'public',
            featured: (d.featured as boolean) ?? false,
            featured_order: d.featured_order != null ? String(d.featured_order) : '',
            lat: d.lat != null ? String(d.lat) : '',
            lng: d.lng != null ? String(d.lng) : '',
            listing_agent_id: (d.listing_agent_id as string) ?? '',
            external_agent_name: (d.external_agent_name as string) ?? '',
            external_agent_phone: (d.external_agent_phone as string) ?? '',
            listing_source: (d.listing_source as string) ?? '',
            reference_id: (d.reference_id as string) ?? '',
            ownership_type: (d.ownership_type as string) ?? '',
            folio_real: (d.folio_real as string) ?? '',
            plano_catastrado: (d.plano_catastrado as string) ?? '',
            has_encumbrances: (d.has_encumbrances as boolean) ?? false,
            encumbrances_notes: (d.encumbrances_notes as string) ?? '',
            condo_regulations_available: (d.condo_regulations_available as boolean) ?? false,
            deposit_amount: d.deposit_amount != null ? String(d.deposit_amount) : '',
            min_lease_months: d.min_lease_months != null ? String(d.min_lease_months) : '',
            hoa_monthly: d.hoa_monthly != null ? String(d.hoa_monthly) : '',
            annual_property_tax: d.annual_property_tax != null ? String(d.annual_property_tax) : '',
            pet_policy: (d.pet_policy as string) ?? '',
            included_services: (d.included_services as string) ?? '',
            appliances_included: (d.appliances_included as string) ?? '',
            availability_date: (d.availability_date as string) ?? '',
            facebook_published: (d.facebook_published as boolean) ?? false,
            encuentra24_published: (d.encuentra24_published as boolean) ?? false,
          })
        }
        setLoading(false)
        // after first load, mark as clean
        setTimeout(() => { initialLoad.current = false }, 0)
      })
  }, [id])

  // ── Load agents ────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase
      .from('agents')
      .select('id,name')
      .order('name')
      .then(({ data }) => {
        if (data) setAgents(data as Agent[])
      })
  }, [])

  // ── Mark dirty on changes ─────────────────────────────────────────────────
  useEffect(() => {
    if (!initialLoad.current) {
      setIsDirty(true)
    }
  }, [form, images, featuredImages])

  // ── Auto-save every 60s ────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!isDirty || loading) return
      const payload = buildPayload()
      const { error: err } = await supabase
        .from('properties')
        .update(payload as never)
        .eq('id', id)
      if (!err) {
        setIsDirty(false)
        setAutoSaveMsg(true)
        setTimeout(() => setAutoSaveMsg(false), 3000)
      }
    }, 60000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty, loading, form, images, featuredImages])

  // ── Helpers ────────────────────────────────────────────────────────────────
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

  const toggle = (field: keyof typeof form) =>
    setForm((prev) => ({ ...prev, [field]: !prev[field] }))

  const lbl = (text: string) => (
    <label className="text-sm font-medium mb-1 block">{text}</label>
  )

  const isRental = form.status === 'for_rent' || form.status === 'both'

  // ── Build save payload ─────────────────────────────────────────────────────
  const buildPayload = () => ({
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
    building_name: form.building_name || null,
    price_sale: form.price_sale ? parseInt(form.price_sale) : null,
    price_rent_monthly: form.price_rent_monthly ? parseInt(form.price_rent_monthly) : null,
    currency: form.currency,
    original_price: form.original_price ? parseInt(form.original_price) : null,
    price_note: form.price_note || null,
    bedrooms: form.bedrooms ? parseInt(form.bedrooms) : 0,
    bathrooms: form.bathrooms ? parseFloat(form.bathrooms) : 0,
    garage_spaces: form.garage_spaces ? parseInt(form.garage_spaces) : null,
    construction_size_sqm: form.construction_size_sqm ? parseInt(form.construction_size_sqm) : null,
    land_size_sqm: form.land_size_sqm ? parseInt(form.land_size_sqm) : null,
    terrace_sqm: form.terrace_sqm ? parseInt(form.terrace_sqm) : null,
    garden_sqm: form.garden_sqm ? parseInt(form.garden_sqm) : null,
    levels: form.levels ? parseInt(form.levels) : null,
    floor_number: form.floor_number ? parseInt(form.floor_number) : null,
    year_built: form.year_built ? parseInt(form.year_built) : null,
    year_renovated: form.year_renovated ? parseInt(form.year_renovated) : null,
    property_condition: form.property_condition || null,
    furnished: form.furnished || null,
    features_es: form.features_es ? form.features_es.split('\n').filter(Boolean) : null,
    features_en: form.features_en ? form.features_en.split('\n').filter(Boolean) : null,
    amenities_es: form.amenities_es ? form.amenities_es.split('\n').filter(Boolean) : null,
    amenities_en: form.amenities_en ? form.amenities_en.split('\n').filter(Boolean) : null,
    plusvalia_notes: form.plusvalia_notes || null,
    internal_notes: form.internal_notes || null,
    youtube_url: form.youtube_url || null,
    youtube_enabled: form.youtube_enabled,
    youtube_label_es: form.youtube_label_es || null,
    youtube_label_en: form.youtube_label_en || null,
    hidden: form.hidden,
    visibility: form.visibility,
    featured: form.featured,
    featured_order: form.featured_order ? parseInt(form.featured_order) : null,
    lat: form.lat ? parseFloat(form.lat) : null,
    lng: form.lng ? parseFloat(form.lng) : null,
    listing_agent_id: form.listing_agent_id || null,
    external_agent_name: form.external_agent_name || null,
    external_agent_phone: form.external_agent_phone || null,
    listing_source: form.listing_source || null,
    reference_id: form.reference_id || null,
    ownership_type: form.ownership_type || null,
    folio_real: form.folio_real || null,
    plano_catastrado: form.plano_catastrado || null,
    has_encumbrances: form.has_encumbrances,
    encumbrances_notes: form.encumbrances_notes || null,
    condo_regulations_available: form.condo_regulations_available,
    deposit_amount: form.deposit_amount ? parseInt(form.deposit_amount) : null,
    min_lease_months: form.min_lease_months ? parseInt(form.min_lease_months) : null,
    hoa_monthly: form.hoa_monthly ? parseInt(form.hoa_monthly) : null,
    annual_property_tax: form.annual_property_tax ? parseInt(form.annual_property_tax) : null,
    pet_policy: form.pet_policy || null,
    included_services: form.included_services || null,
    appliances_included: form.appliances_included || null,
    availability_date: form.availability_date || null,
    facebook_published: form.facebook_published,
    encuentra24_published: form.encuentra24_published,
    images,
    featured_images: featuredImages,
  })

  // ── PDF export ─────────────────────────────────────────────────────────────
  const handleExportPdf = async () => {
    setExportingPdf(true)
    try {
      const res = await fetch(`/api/pdf/brochure?id=${id}&lang=${pdfLang}`)
      if (!res.ok) {
        const j = (await res.json()) as { error?: string }
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

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)

    // required field check
    if (!form.status || !form.property_type || !form.location_name) {
      return
    }

    setSaving(true)
    setError(null)

    const payload = buildPayload()

    const { data: saved, error: err } = await supabase
      .from('properties')
      .update(payload as never)
      .eq('id', id)
      .select('updated_at')
      .single()

    if (err) {
      setErrorToast(err.message)
      setTimeout(() => setErrorToast(null), 3000)
      setSaving(false)
      return
    }

    setSaving(false)
    setIsDirty(false)
    if (saved) {
      const s = saved as Record<string, unknown>
      setUpdatedAt((s.updated_at as string) ?? null)
    }
    setSuccessToast(true)
    setTimeout(() => setSuccessToast(false), 3000)
  }

  // ── AI generate ────────────────────────────────────────────────────────────
  const handleAiGenerate = async () => {
    setAiLoading(true)
    setAiError(null)
    try {
      const res = await fetch(`/api/ai/generate-listing?id=${id}`)
      if (res.status === 404) throw new Error('Esta función requiere configuración de IA')
      if (!res.ok) throw new Error('Error al generar contenido')
      const json = (await res.json()) as AiResult
      setAiResult(json)
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setAiLoading(false)
    }
  }

  const applyAiResult = () => {
    if (!aiResult) return
    setForm((prev) => ({
      ...prev,
      title: aiResult.title ?? prev.title,
      title_es: aiResult.title_es ?? prev.title_es,
      title_en: aiResult.title_en ?? prev.title_en,
      description: aiResult.description ?? prev.description,
      description_es: aiResult.description_es ?? prev.description_es,
      description_en: aiResult.description_en ?? prev.description_en,
      features_es: aiResult.features_es ? aiResult.features_es.join('\n') : prev.features_es,
      features_en: aiResult.features_en ? aiResult.features_en.join('\n') : prev.features_en,
      amenities_es: aiResult.amenities_es ? aiResult.amenities_es.join('\n') : prev.amenities_es,
      amenities_en: aiResult.amenities_en ? aiResult.amenities_en.join('\n') : prev.amenities_en,
    }))
    setAiResult(null)
  }

  // ── Import from URL ────────────────────────────────────────────────────────
  const handleImport = async () => {
    if (!importUrl.trim()) return
    setImportLoading(true)
    setAiError(null)
    try {
      const res = await fetch(`/api/import-listing?url=${encodeURIComponent(importUrl)}`)
      if (res.status === 404) throw new Error('Esta función requiere configuración de IA')
      if (!res.ok) throw new Error('Error al importar desde URL')
      const json = (await res.json()) as Partial<typeof form>
      setForm((prev) => ({ ...prev, ...json }))
      setImportUrl('')
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setImportLoading(false)
    }
  }

  // ── Image helpers ──────────────────────────────────────────────────────────
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

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const requiredMissing = submitted && (!form.status || !form.property_type || !form.location_name)

  const inputBase =
    'w-full px-3 py-2.5 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20'
  const inputRequired = (field: string) =>
    submitted && !form[field as keyof typeof form]
      ? inputBase + ' border-red-500'
      : inputBase

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl pb-20">
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

          {slug && (
            <Link
              href={`/property/${slug}`}
              target="_blank"
              className="text-sm text-primary flex items-center gap-1 hover:underline"
            >
              <ExternalLink className="w-4 h-4" /> Ver en sitio
            </Link>
          )}

          <button
            form="edit-form"
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded bg-[#1B3A2D] text-white text-sm font-medium hover:bg-[#1B3A2D]/90 disabled:opacity-60 transition-colors"
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

      {/* ── Required fields warning ── */}
      {requiredMissing && (
        <div className="bg-yellow-50 border border-yellow-300 rounded p-3 text-sm text-yellow-800 mb-4">
          ⚠ Complete los campos requeridos
        </div>
      )}

      {/* ── Form ── */}
      <form id="edit-form" onSubmit={handleSubmit} className="space-y-1">

        {/* ══════════════════════════════════════════════════════════
            ✨ IA — Importar y generar contenido
        ══════════════════════════════════════════════════════════ */}
        <SectionDivider icon="✨" title="IA — Importar y generar contenido" />

        <div className="border border-amber-300 bg-amber-50/30 rounded-lg p-4 space-y-4">
          {aiError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded p-2 text-sm text-destructive">
              {aiError}
            </div>
          )}

          {/* Row 1: URL import */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Importar desde URL</label>
              <input
                type="url"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="https://..."
                className={inputBase}
              />
            </div>
            <button
              type="button"
              onClick={handleImport}
              disabled={importLoading || !importUrl.trim()}
              className="flex items-center gap-2 px-4 py-2.5 rounded bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-60 transition-colors whitespace-nowrap"
            >
              {importLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Importar URL
            </button>
          </div>

          {/* Row 2: AI generate with prompt */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Prompt para IA (opcional)</label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={2}
                placeholder="Ej: Casa de lujo en Escazú, 4 habitaciones..."
                className={inputBase + ' resize-none'}
              />
            </div>
            <button
              type="button"
              onClick={handleAiGenerate}
              disabled={aiLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors whitespace-nowrap"
            >
              {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generar con IA
            </button>
          </div>

          {/* Apply AI result */}
          {aiResult && (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded">
              <span className="text-sm text-green-700 flex-1">
                Contenido generado listo para aplicar.
              </span>
              <button
                type="button"
                onClick={applyAiResult}
                className="px-3 py-1.5 rounded bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Aplicar todo
              </button>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════
            📋 Esencial
        ══════════════════════════════════════════════════════════ */}
        <SectionDivider icon="📋" title="Esencial" />

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            {lbl('Estado *')}
            <select
              {...sel('status')}
              className={
                submitted && !form.status
                  ? 'w-full px-3 py-2.5 border border-red-500 rounded bg-background text-sm focus:outline-none'
                  : 'w-full px-3 py-2.5 border border-input rounded bg-background text-sm focus:outline-none'
              }
            >
              <option value="for_sale">En venta</option>
              <option value="for_rent">En alquiler</option>
              <option value="both">Venta y alquiler</option>
              <option value="sold">Vendido</option>
              <option value="rented">Alquilado</option>
              <option value="presale">Preventa</option>
              <option value="under_contract">Bajo contrato</option>
            </select>
          </div>

          <div>
            {lbl('Tipo de propiedad *')}
            <select
              {...sel('property_type')}
              className={
                submitted && !form.property_type
                  ? 'w-full px-3 py-2.5 border border-red-500 rounded bg-background text-sm focus:outline-none'
                  : 'w-full px-3 py-2.5 border border-input rounded bg-background text-sm focus:outline-none'
              }
            >
              <option value="house">Casa</option>
              <option value="condo">Condominio</option>
              <option value="apartment">Apartamento</option>
              <option value="land">Terreno</option>
              <option value="commercial">Comercial</option>
              <option value="townhouse">Townhouse</option>
            </select>
          </div>

          <div>
            {lbl('Categoría')}
            <select {...sel('tier')}>
              <option value="mid">Medio</option>
              <option value="high_end">High End</option>
              <option value="ultra_luxury">Ultra Lujo</option>
            </select>
          </div>

          <div>
            {lbl('Zona')}
            <select {...sel('zone')}>
              <option value="">— Sin asignar —</option>
              {ZONES.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          {lbl('Nombre de ubicación *')}
          <input
            type="text"
            {...inp('location_name')}
            className={inputRequired('location_name')}
          />
        </div>

        <div className="mt-4">
          {lbl('Nombre del edificio / condominio')}
          <input type="text" {...inp('building_name')} />
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-4">
          <div>
            {lbl('Precio de venta')}
            <input type="number" min="0" {...inp('price_sale')} />
          </div>
          <div>
            {lbl('Precio de alquiler mensual')}
            <input type="number" min="0" {...inp('price_rent_monthly')} />
          </div>
          <div>
            {lbl('Moneda')}
            <select {...sel('currency')}>
              <option value="USD">USD</option>
              <option value="CRC">CRC</option>
            </select>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <span className="text-sm font-medium">Precio tachado</span>
              <span className="text-xs text-muted-foreground">(original_price)</span>
            </div>
            <input type="number" min="0" {...inp('original_price')} />
          </div>
          <div className="md:col-span-2">
            {lbl('Nota de precio')}
            <input type="text" {...inp('price_note')} placeholder="Ej: Precio negociable" />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            📐 Especificaciones
        ══════════════════════════════════════════════════════════ */}
        <SectionDivider icon="📐" title="Especificaciones" />

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            {lbl('Habitaciones')}
            <input type="number" min="0" {...inp('bedrooms')} />
          </div>
          <div>
            {lbl('Baños')}
            <input type="number" min="0" step="0.5" {...inp('bathrooms')} />
          </div>
          <div>
            {lbl('Garages')}
            <input type="number" min="0" {...inp('garage_spaces')} />
          </div>
          <div>
            {lbl('Construcción (m²)')}
            <input type="number" min="0" {...inp('construction_size_sqm')} />
          </div>
          <div>
            {lbl('Terreno (m²)')}
            <input type="number" min="0" {...inp('land_size_sqm')} />
          </div>
          <div>
            {lbl('Terraza (m²)')}
            <input type="number" min="0" {...inp('terrace_sqm')} />
          </div>
          <div>
            {lbl('Jardín (m²)')}
            <input type="number" min="0" {...inp('garden_sqm')} />
          </div>
          <div>
            {lbl('Niveles')}
            <input type="number" min="0" {...inp('levels')} />
          </div>
          <div>
            {lbl('Número de piso')}
            <input type="number" min="0" {...inp('floor_number')} />
          </div>
          <div>
            {lbl('Año de construcción')}
            <input type="number" min="1900" max="2100" {...inp('year_built')} />
          </div>
          <div>
            {lbl('Año de renovación')}
            <input type="number" min="1900" max="2100" {...inp('year_renovated')} />
          </div>
          <div>
            {lbl('Condición')}
            <select {...sel('property_condition')}>
              <option value="">Sin especificar</option>
              <option value="excellent">Excelente</option>
              <option value="good">Buena</option>
              <option value="fair">Regular</option>
              <option value="needs_work">Necesita trabajo</option>
            </select>
          </div>
          <div>
            {lbl('Amueblado')}
            <select {...sel('furnished')}>
              <option value="">Sin especificar</option>
              <option value="yes">Amueblado</option>
              <option value="no">Sin amueblar</option>
              <option value="partial">Parcialmente</option>
            </select>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            📝 Contenido bilingüe
        ══════════════════════════════════════════════════════════ */}
        <SectionDivider icon="📝" title="Contenido bilingüe" />

        <div className="grid gap-6 md:grid-cols-2">
          {/* ES column */}
          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground pb-1 border-b border-border">
              Español
            </div>
            <div>
              {lbl('Título ES')}
              <input type="text" {...inp('title_es')} />
            </div>
            <div>
              {lbl('Subtítulo ES')}
              <input type="text" {...inp('subtitle')} />
            </div>
            <div>
              {lbl('Descripción ES')}
              <textarea
                rows={8}
                {...inp('description_es')}
                className={inputBase + ' resize-none'}
              />
            </div>
            <div>
              {lbl('Características ES')}
              <p className="text-xs text-muted-foreground mb-1">una por línea</p>
              <textarea
                rows={6}
                {...inp('features_es')}
                className={inputBase + ' resize-none'}
              />
            </div>
            <div>
              {lbl('Amenidades ES')}
              <p className="text-xs text-muted-foreground mb-1">una por línea</p>
              <textarea
                rows={4}
                {...inp('amenities_es')}
                className={inputBase + ' resize-none'}
              />
            </div>
          </div>

          {/* EN column */}
          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground pb-1 border-b border-border">
              English
            </div>
            <div>
              {lbl('Title EN')}
              <input type="text" {...inp('title_en')} />
            </div>
            <div>
              {lbl('Subtitle EN')}
              <input type="text" {...inp('subtitle_en')} />
            </div>
            <div>
              {lbl('Description EN')}
              <textarea
                rows={8}
                {...inp('description_en')}
                className={inputBase + ' resize-none'}
              />
            </div>
            <div>
              {lbl('Features EN')}
              <p className="text-xs text-muted-foreground mb-1">one per line</p>
              <textarea
                rows={6}
                {...inp('features_en')}
                className={inputBase + ' resize-none'}
              />
            </div>
            <div>
              {lbl('Amenities EN')}
              <p className="text-xs text-muted-foreground mb-1">one per line</p>
              <textarea
                rows={4}
                {...inp('amenities_en')}
                className={inputBase + ' resize-none'}
              />
            </div>
          </div>
        </div>

        {/* Plusvalía notes */}
        <div className="mt-4">
          {lbl('Notas de plusvalía')}
          <textarea
            rows={4}
            {...inp('plusvalia_notes')}
            className={inputBase + ' resize-none border-l-4 border-amber-400 pl-3'}
          />
        </div>

        {/* Internal notes */}
        <div className="mt-4">
          {lbl('Notas internas (solo admin)')}
          <textarea
            rows={3}
            {...inp('internal_notes')}
            className={inputBase + ' resize-none bg-secondary/40'}
          />
        </div>

        {/* ══════════════════════════════════════════════════════════
            🖼️ Imágenes
        ══════════════════════════════════════════════════════════ */}
        <SectionDivider icon="🖼️" title="Imágenes" />

        {/* Gallery images */}
        <div>
          <p className="text-sm font-medium mb-2">Galería de imágenes</p>
          <div className="flex flex-wrap gap-3 mb-4">
            {images.map((url, i) => (
              <div
                key={i}
                className="relative w-24 h-24 rounded overflow-hidden bg-secondary group flex-shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="object-cover w-full h-full" />
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold bg-black/60 text-white py-0.5">
                    PORTADA
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
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
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addImage()
                }
              }}
              placeholder="https://..."
              className={inputBase + ' flex-1'}
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
        <div className="mt-6">
          <p className="text-sm font-medium mb-2">Imágenes destacadas (portada)</p>
          <div className="flex flex-wrap gap-3 mb-4">
            {featuredImages.slice(0, 5).map((url, i) => (
              <div
                key={i}
                className="relative w-24 h-24 rounded overflow-hidden bg-secondary group flex-shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="object-cover w-full h-full" />
                <button
                  type="button"
                  onClick={() =>
                    setFeaturedImages((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addFeatured()
                  }
                }}
                placeholder="https://..."
                className={inputBase + ' flex-1'}
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

        {/* YouTube */}
        <div className="mt-6 pt-4 border-t border-border space-y-3">
          <p className="text-sm font-medium">Video YouTube</p>
          <div>
            {lbl('URL de YouTube')}
            <input
              type="url"
              {...inp('youtube_url')}
              placeholder="https://youtube.com/watch?v=..."
            />
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
                {lbl('Etiqueta del video ES')}
                <input type="text" {...inp('youtube_label_es')} />
              </div>
              <div>
                {lbl('Etiqueta del video EN')}
                <input type="text" {...inp('youtube_label_en')} />
              </div>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════
            🔗 Agente y fuente
        ══════════════════════════════════════════════════════════ */}
        <SectionDivider icon="🔗" title="Agente y fuente" />

        <div className="space-y-4">
          <div>
            {lbl('Agente asignado')}
            <select {...sel('listing_agent_id')}>
              <option value="">— Sin agente —</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              {lbl('Agente externo (nombre)')}
              <input type="text" {...inp('external_agent_name')} />
            </div>
            <div>
              {lbl('Agente externo (teléfono)')}
              <input type="text" {...inp('external_agent_phone')} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              {lbl('Fuente de listing')}
              <input type="text" {...inp('listing_source')} readOnly className={inputBase + ' bg-secondary/30'} />
            </div>
            <div>
              {lbl('ID de referencia')}
              <input type="text" {...inp('reference_id')} readOnly className={inputBase + ' bg-secondary/30'} />
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            ⚖️ Legal
        ══════════════════════════════════════════════════════════ */}
        <SectionDivider icon="⚖️" title="Legal" />

        <div className="space-y-4">
          <div>
            {lbl('Tipo de titularidad')}
            <select {...sel('ownership_type')}>
              <option value="">Sin especificar</option>
              <option value="fee_simple">Dominio pleno</option>
              <option value="condominium">Condominio</option>
              <option value="leasehold">Arrendamiento</option>
              <option value="other">Otro</option>
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              {lbl('Folio real')}
              <input type="text" {...inp('folio_real')} />
            </div>
            <div>
              {lbl('Plano catastrado')}
              <input type="text" {...inp('plano_catastrado')} />
            </div>
          </div>
          <label className="flex items-center gap-3 text-sm cursor-pointer p-3 rounded border border-border hover:bg-secondary/40 transition-colors">
            <input
              type="checkbox"
              checked={form.has_encumbrances}
              onChange={() => toggle('has_encumbrances')}
              className="rounded"
            />
            <div>
              <div className="font-medium">Tiene gravámenes</div>
            </div>
          </label>
          {form.has_encumbrances && (
            <div>
              {lbl('Notas sobre gravámenes')}
              <textarea
                rows={3}
                {...inp('encumbrances_notes')}
                className={inputBase + ' resize-none'}
              />
            </div>
          )}
          <label className="flex items-center gap-3 text-sm cursor-pointer p-3 rounded border border-border hover:bg-secondary/40 transition-colors">
            <input
              type="checkbox"
              checked={form.condo_regulations_available}
              onChange={() => toggle('condo_regulations_available')}
              className="rounded"
            />
            <div>
              <div className="font-medium">Reglamento de condominio disponible</div>
            </div>
          </label>
        </div>

        {/* ══════════════════════════════════════════════════════════
            🏠 Alquiler (only if rental)
        ══════════════════════════════════════════════════════════ */}
        {isRental && (
          <>
            <SectionDivider icon="🏠" title="Alquiler" />
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  {lbl('Depósito')}
                  <input type="number" min="0" {...inp('deposit_amount')} />
                </div>
                <div>
                  {lbl('Meses mínimos de contrato')}
                  <input type="number" min="1" {...inp('min_lease_months')} />
                </div>
                <div>
                  {lbl('Cuota HOA mensual')}
                  <input type="number" min="0" {...inp('hoa_monthly')} />
                </div>
                <div>
                  {lbl('Impuesto anual de propiedad')}
                  <input type="number" min="0" {...inp('annual_property_tax')} />
                </div>
              </div>
              <div>
                {lbl('Política de mascotas')}
                <select {...sel('pet_policy')}>
                  <option value="">Sin especificar</option>
                  <option value="allowed">Permitidas</option>
                  <option value="not_allowed">No permitidas</option>
                  <option value="negotiable">Negociable</option>
                </select>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  {lbl('Servicios incluidos')}
                  <input type="text" {...inp('included_services')} placeholder="Ej: Agua, electricidad (separados por coma)" />
                </div>
                <div>
                  {lbl('Electrodomésticos incluidos')}
                  <input type="text" {...inp('appliances_included')} placeholder="Ej: Lavadora, secadora (separados por coma)" />
                </div>
              </div>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════
            📍 Ubicación
        ══════════════════════════════════════════════════════════ */}
        <SectionDivider icon="📍" title="Ubicación" />

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            {lbl('Latitud')}
            <input type="number" step="0.000001" {...inp('lat')} placeholder="9.934700" />
          </div>
          <div>
            {lbl('Longitud')}
            <input type="number" step="0.000001" {...inp('lng')} placeholder="-84.087500" />
          </div>
        </div>
        {form.lat && form.lng && (
          <iframe
            src={`https://maps.google.com/maps?q=${form.lat},${form.lng}&z=15&output=embed`}
            className="w-full rounded border border-border mt-4"
            height={200}
          />
        )}

        {/* ══════════════════════════════════════════════════════════
            👁️ Visibilidad y publicación
        ══════════════════════════════════════════════════════════ */}
        <SectionDivider icon="👁️" title="Visibilidad y publicación" />

        <div className="space-y-4">
          <label className="flex items-center gap-3 text-sm cursor-pointer p-3 rounded border border-border hover:bg-secondary/40 transition-colors">
            <input
              type="checkbox"
              checked={form.hidden}
              onChange={() => toggle('hidden')}
              className="rounded"
            />
            <div>
              <div className="font-medium">{form.hidden ? 'Oculto' : 'Visible'}</div>
              <div className="text-xs text-muted-foreground">
                {form.hidden
                  ? 'La propiedad no aparecerá en el sitio público'
                  : 'La propiedad es visible en el sitio público'}
              </div>
            </div>
          </label>

          <div>
            {lbl('Visibilidad')}
            <select {...sel('visibility')}>
              <option value="public">Público</option>
              <option value="private">Privado</option>
            </select>
          </div>

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

          {form.featured && (
            <div>
              {lbl('Orden de aparición destacada')}
              <input type="number" min="1" {...inp('featured_order')} />
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-3 text-sm cursor-pointer p-3 rounded border border-border hover:bg-secondary/40 transition-colors">
              <input
                type="checkbox"
                checked={form.facebook_published}
                onChange={() => toggle('facebook_published')}
                className="rounded"
              />
              <div className="font-medium">Publicado en Facebook</div>
            </label>
            <label className="flex items-center gap-3 text-sm cursor-pointer p-3 rounded border border-border hover:bg-secondary/40 transition-colors">
              <input
                type="checkbox"
                checked={form.encuentra24_published}
                onChange={() => toggle('encuentra24_published')}
                className="rounded"
              />
              <div className="font-medium">Publicado en Encuentra24</div>
            </label>
          </div>

          <div>
            {lbl('Fecha de disponibilidad')}
            <input type="date" {...inp('availability_date')} />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            💾 Guardar
        ══════════════════════════════════════════════════════════ */}
        <SectionDivider icon="💾" title="Guardar" />

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded bg-[#1B3A2D] text-white text-sm font-medium hover:bg-[#1B3A2D]/90 disabled:opacity-60 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Guardar cambios
          </button>

          {slug && (
            <Link
              href={`/property/${slug}`}
              target="_blank"
              className="text-sm text-primary flex items-center gap-1 hover:underline"
            >
              <ExternalLink className="w-4 h-4" /> Ver en sitio →
            </Link>
          )}

          <div className="ml-auto text-xs text-muted-foreground space-y-0.5 text-right">
            {updatedAt && (
              <div>
                Última actualización:{' '}
                {new Date(updatedAt).toLocaleString('es-CR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            )}
            {form.reference_id && <div>ID: {form.reference_id}</div>}
          </div>
        </div>
      </form>

      {/* ── Success toast ── */}
      {successToast && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium z-50 transition-all">
          Guardado con éxito ✓
        </div>
      )}

      {/* ── Error toast ── */}
      {errorToast && (
        <div className="fixed bottom-6 right-6 bg-destructive text-destructive-foreground px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium z-50">
          {errorToast}
        </div>
      )}

      {/* ── Auto-save message ── */}
      {autoSaveMsg && (
        <div className="fixed bottom-6 right-6 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg shadow text-xs z-50">
          Guardado automáticamente
        </div>
      )}
    </div>
  )
}
