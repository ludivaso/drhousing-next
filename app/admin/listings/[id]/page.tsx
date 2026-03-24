'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, ExternalLink, FileDown } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function EditListingPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [slug, setSlug] = useState('')
  const [pdfLang, setPdfLang] = useState<'es' | 'en'>('es')
  const [exportingPdf, setExportingPdf] = useState(false)
  const [form, setForm] = useState({
    title: '',
    location_name: '',
    property_type: 'house',
    status: 'active',
    price_sale: '',
    price_rent_monthly: '',
    bedrooms: '',
    bathrooms: '',
    construction_size_sqm: '',
    description: '',
    featured: false,
    hidden: false,
  })

  useEffect(() => {
    supabase.from('properties').select('*').eq('id', id).single().then(({ data }) => {
      if (data) {
        setSlug(data.slug ?? '')
        setForm({
          title: data.title ?? '',
          location_name: data.location_name ?? '',
          property_type: data.property_type ?? 'house',
          status: data.status ?? 'active',
          price_sale: data.price_sale?.toString() ?? '',
          price_rent_monthly: data.price_rent_monthly?.toString() ?? '',
          bedrooms: data.bedrooms?.toString() ?? '',
          bathrooms: data.bathrooms?.toString() ?? '',
          construction_size_sqm: data.construction_size_sqm?.toString() ?? '',
          description: data.description ?? '',
          featured: data.featured ?? false,
          hidden: data.hidden ?? false,
        })
      }
      setLoading(false)
    })
  }, [id])

  const set = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleExportPdf = async () => {
    setExportingPdf(true)
    try {
      const res = await fetch(`/api/pdf/brochure?id=${id}&lang=${pdfLang}`)
      if (!res.ok) { const j = await res.json(); throw new Error(j.error ?? 'Error') }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `drhousing-${slug || id}-${pdfLang}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al generar PDF')
    } finally {
      setExportingPdf(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { error: err } = await supabase.from('properties').update({
      title: form.title,
      location_name: form.location_name,
      property_type: form.property_type,
      status: form.status,
      price_sale: form.price_sale ? parseInt(form.price_sale) : null,
      price_rent_monthly: form.price_rent_monthly ? parseInt(form.price_rent_monthly) : null,
      bedrooms: form.bedrooms ? parseInt(form.bedrooms) : 0,
      bathrooms: form.bathrooms ? parseFloat(form.bathrooms) : 0,
      construction_size_sqm: form.construction_size_sqm ? parseInt(form.construction_size_sqm) : null,
      description: form.description || null,
      featured: form.featured,
      hidden: form.hidden,
    }).eq('id', id)

    if (err) { setError(err.message); setSaving(false); return }
    router.push('/admin/listings')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Link href="/admin/listings" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-serif text-2xl font-semibold">Editar Propiedad</h1>
        <div className="ml-auto flex items-center gap-2">
          {/* PDF export */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <select
              value={pdfLang}
              onChange={e => setPdfLang(e.target.value as 'es' | 'en')}
              className="px-2 py-1.5 text-xs bg-background border-r border-border focus:outline-none"
            >
              <option value="es">ES</option>
              <option value="en">EN</option>
            </select>
            <button
              onClick={handleExportPdf}
              disabled={exportingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-background hover:bg-secondary transition-colors disabled:opacity-60"
            >
              {exportingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
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
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card-elevated p-6 space-y-5">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded p-3 text-sm text-destructive">{error}</div>
        )}

        {[
          { label: 'Título *', field: 'title', type: 'text', required: true },
          { label: 'Ubicación *', field: 'location_name', type: 'text', required: true },
          { label: 'Precio de venta (USD)', field: 'price_sale', type: 'number' },
          { label: 'Precio de alquiler mensual (USD)', field: 'price_rent_monthly', type: 'number' },
          { label: 'Habitaciones', field: 'bedrooms', type: 'number' },
          { label: 'Baños', field: 'bathrooms', type: 'number' },
          { label: 'Construcción (m²)', field: 'construction_size_sqm', type: 'number' },
        ].map(({ label, field, type, required }) => (
          <div key={field}>
            <label className="text-sm font-medium mb-1 block">{label}</label>
            <input
              type={type}
              value={form[field as keyof typeof form] as string}
              onChange={(e) => set(field, e.target.value)}
              required={required}
              className="w-full px-3 py-2.5 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        ))}

        <div>
          <label className="text-sm font-medium mb-1 block">Tipo de propiedad</label>
          <select
            value={form.property_type}
            onChange={(e) => set('property_type', e.target.value)}
            className="w-full px-3 py-2.5 border border-input rounded bg-background text-sm focus:outline-none"
          >
            {['house', 'condo', 'apartment', 'land', 'commercial', 'townhouse'].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Estado</label>
          <select
            value={form.status}
            onChange={(e) => set('status', e.target.value)}
            className="w-full px-3 py-2.5 border border-input rounded bg-background text-sm focus:outline-none"
          >
            {['active', 'pending', 'sold', 'rented'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Descripción</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2.5 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>

        <div className="flex gap-6">
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
            Ocultar en sitio
          </label>
        </div>

        <div className="flex gap-3 pt-2">
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
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
