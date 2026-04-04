'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Phone, Mail, MessageCircle, ExternalLink,
  Loader2, Save, CheckCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

type Lead = {
  id: string
  full_name: string
  email: string
  phone: string | null
  lead_type: string | null
  timeline: string | null
  status: string
  message: string | null
  notes: string | null
  country_of_origin: string | null
  preferred_contact_method: string | null
  interested_areas: string[] | null
  interested_property_type: string | null
  budget_min: number | null
  budget_max: number | null
  created_at: string
  source: string | null
  property_id: string | null
  follow_up_date: string | null
}

type Agent = { id: string; full_name: string }

const STATUS_OPTIONS = [
  { value: 'new',       label: 'Nuevo' },
  { value: 'contacted', label: 'Contactado' },
  { value: 'qualified', label: 'Calificado' },
  { value: 'proposal',  label: 'Propuesta' },
  { value: 'won',       label: 'Ganado' },
  { value: 'lost',      label: 'Perdido' },
]

const STATUS_COLORS: Record<string, string> = {
  new:       'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-purple-100 text-purple-800',
  proposal:  'bg-orange-100 text-orange-800',
  won:       'bg-green-100 text-green-800',
  lost:      'bg-gray-100 text-gray-600',
}

const TYPE_LABELS: Record<string, string> = {
  buyer:   'Comprador',
  renter:  'Arrendatario',
  seller:  'Vendedor',
  general: 'General',
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Editable fields
  const [status, setStatus] = useState('')
  const [notes, setNotes] = useState('')
  const [assignedAgentId, setAssignedAgentId] = useState<string>('')
  const [followUpDate, setFollowUpDate] = useState('')

  useEffect(() => {
    Promise.all([
      supabase.from('leads').select('*').eq('id', id).maybeSingle(),
      supabase.from('agents').select('id, full_name').order('full_name'),
    ]).then(([{ data: lead }, { data: agents }]) => {
      if (lead) {
        setLead(lead as Lead)
        setStatus(lead.status)
        setNotes(lead.notes ?? '')
        setAssignedAgentId((lead as any).assigned_agent_id ?? '')
        setFollowUpDate((lead as any).follow_up_date ?? '')
      }
      setAgents((agents as Agent[]) ?? [])
      setLoading(false)
    })
  }, [id])

  const handleSave = async () => {
    if (!lead) return
    setSaving(true)
    const payload: Record<string, unknown> = { status, notes: notes || null }
    if (assignedAgentId) payload.assigned_agent_id = assignedAgentId
    if (followUpDate) payload.follow_up_date = followUpDate
    await supabase.from('leads').update(payload).eq('id', lead.id)
    setSaving(false)
    setSaved(true)
    setLead((prev) => prev ? { ...prev, status, notes } : prev)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleMarkContacted = async () => {
    if (!lead || status === 'contacted') return
    setStatus('contacted')
    await supabase.from('leads').update({ status: 'contacted' }).eq('id', lead.id)
    setLead((prev) => prev ? { ...prev, status: 'contacted' } : prev)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Lead no encontrado.</p>
        <Link href="/admin/leads" className="text-primary hover:underline mt-2 inline-block">← Volver</Link>
      </div>
    )
  }

  const waText = encodeURIComponent(`Hola ${lead.full_name}, le contactamos de DR Housing en relación a su consulta inmobiliaria.`)

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/leads" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-2xl font-semibold truncate">{lead.full_name}</h1>
          <p className="text-sm text-muted-foreground">
            Lead recibido el {new Date(lead.created_at).toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' })}
            {lead.source && ` · ${lead.source}`}
          </p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[status] ?? 'bg-muted text-muted-foreground'}`}>
          {STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — info */}
        <div className="lg:col-span-2 space-y-5">

          {/* Contact info */}
          <div className="card-elevated p-5 space-y-3">
            <h2 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">Contacto</h2>
            <div className="space-y-2">
              <a href={`mailto:${lead.email}`} className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                {lead.email}
              </a>
              {lead.phone && (
                <>
                  <a href={`tel:${lead.phone}`} className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors">
                    <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                    {lead.phone}
                  </a>
                  <a
                    href={`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${waText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-[#25D366] hover:underline"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    WhatsApp
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Lead details */}
          <div className="card-elevated p-5">
            <h2 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-3">Detalles</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                { label: 'Tipo de Lead', value: lead.lead_type ? (TYPE_LABELS[lead.lead_type] ?? lead.lead_type) : null },
                { label: 'País', value: lead.country_of_origin },
                { label: 'Timeline', value: lead.timeline },
                { label: 'Tipo de Propiedad', value: lead.interested_property_type },
                { label: 'Contacto Preferido', value: lead.preferred_contact_method },
                { label: 'Fuente', value: lead.source },
                {
                  label: 'Presupuesto',
                  value: lead.budget_min || lead.budget_max
                    ? `${lead.budget_min ? fmt(lead.budget_min) : '?'} – ${lead.budget_max ? fmt(lead.budget_max) : '?'}`
                    : null,
                },
                {
                  label: 'Zonas de Interés',
                  value: lead.interested_areas?.length ? lead.interested_areas.join(', ') : null,
                },
              ].filter((r) => r.value).map((row) => (
                <div key={row.label}>
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="font-medium mt-0.5">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Message */}
          {lead.message && (
            <div className="card-elevated p-5">
              <h2 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-3">Mensaje</h2>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{lead.message}</p>
            </div>
          )}

          {/* Property link */}
          {lead.property_id && (
            <div className="card-elevated p-5">
              <h2 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-3">Propiedad Relacionada</h2>
              <Link
                href={`/admin/listings/${lead.property_id}`}
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Ver propiedad en admin
              </Link>
            </div>
          )}
        </div>

        {/* Right sidebar — CRM actions */}
        <div className="space-y-4">

          {/* Status */}
          <div className="card-elevated p-5 space-y-3">
            <h2 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">Estado</h2>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <button
              onClick={handleMarkContacted}
              disabled={status !== 'new'}
              className="w-full py-2 rounded text-sm font-medium border border-border hover:bg-secondary disabled:opacity-40 transition-colors"
            >
              Marcar como Contactado
            </button>
          </div>

          {/* Assign agent */}
          <div className="card-elevated p-5 space-y-3">
            <h2 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">Agente Asignado</h2>
            <select
              value={assignedAgentId}
              onChange={(e) => setAssignedAgentId(e.target.value)}
              className="w-full px-3 py-2 rounded border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">— Sin asignar —</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.full_name}</option>
              ))}
            </select>
          </div>

          {/* Follow-up date */}
          <div className="card-elevated p-5 space-y-3">
            <h2 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">Fecha de Seguimiento</h2>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full px-3 py-2 rounded border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Notes */}
          <div className="card-elevated p-5 space-y-3">
            <h2 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">Notas Internas</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleSave}
              placeholder="Notas sobre este lead..."
              rows={5}
              className="w-full px-3 py-2 rounded border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
            ) : saved ? (
              <><CheckCircle className="w-4 h-4" /> Guardado</>
            ) : (
              <><Save className="w-4 h-4" /> Guardar cambios</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
