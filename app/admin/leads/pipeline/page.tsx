'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Phone, Mail, MessageCircle, X, Save, Loader2,
  ExternalLink, User, Calendar, DollarSign, MapPin, GripVertical
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

// ─── Types ──────────────────────────────────────────────────────────────────
type LeadStatus = 'new' | 'contacted' | 'viewing' | 'offer' | 'closed' | 'lost'

type Lead = {
  id: string
  full_name: string
  email: string
  phone: string | null
  lead_type: string
  status: LeadStatus
  message: string | null
  notes: string | null
  country_of_origin: string | null
  budget_min: number | null
  budget_max: number | null
  interested_areas: string[] | null
  interested_property_type: string | null
  timeline: string | null
  created_at: string
  property_id: string | null
  preferred_contact_method: string | null
}

type Column = {
  id: LeadStatus
  label: string
  color: string
  bg: string
}

const COLUMNS: Column[] = [
  { id: 'new',       label: 'Nuevos',    color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200' },
  { id: 'contacted', label: 'Contactados', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
  { id: 'viewing',   label: 'Visita',    color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  { id: 'offer',     label: 'Oferta',    color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  { id: 'closed',    label: 'Cerrado ✓', color: 'text-green-700',  bg: 'bg-green-50 border-green-200' },
  { id: 'lost',      label: 'Perdido',   color: 'text-gray-500',   bg: 'bg-gray-50 border-gray-200' },
]

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

// ─── Lead Card ──────────────────────────────────────────────────────────────
function LeadCard({
  lead,
  onClick,
  isDragging = false,
}: {
  lead: Lead
  onClick: () => void
  isDragging?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lead.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const waText = encodeURIComponent(`Hola ${lead.full_name}, le contactamos de DR Housing en relación a su consulta inmobiliaria.`)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              {...attributes}
              {...listeners}
              className="text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-3.5 h-3.5" />
            </span>
            <p className="font-medium text-foreground text-sm truncate">{lead.full_name}</p>
          </div>
          {lead.country_of_origin && (
            <p className="text-xs text-muted-foreground mt-0.5 ml-5">{lead.country_of_origin}</p>
          )}
        </div>
        <span className="text-xs text-muted-foreground flex-shrink-0">
          {new Date(lead.created_at).toLocaleDateString('es-CR', { month: 'short', day: 'numeric' })}
        </span>
      </div>

      {(lead.budget_min || lead.budget_max) && (
        <div className="flex items-center gap-1 mt-2 ml-5 text-xs text-muted-foreground">
          <DollarSign className="w-3 h-3" />
          {lead.budget_min && fmt(lead.budget_min)}
          {lead.budget_min && lead.budget_max && ' – '}
          {lead.budget_max && fmt(lead.budget_max)}
        </div>
      )}

      {lead.interested_areas && lead.interested_areas.length > 0 && (
        <div className="flex items-center gap-1 mt-1 ml-5 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />
          {lead.interested_areas.slice(0, 2).join(', ')}
          {lead.interested_areas.length > 2 && ` +${lead.interested_areas.length - 2}`}
        </div>
      )}

      <div className="flex items-center gap-2 mt-3 ml-5" onClick={(e) => e.stopPropagation()}>
        {lead.phone && (
          <a href={`tel:${lead.phone.replace(/\s|-/g,'')}`} className="text-muted-foreground hover:text-primary transition-colors">
            <Phone className="w-3.5 h-3.5" />
          </a>
        )}
        <a href={`mailto:${lead.email}`} className="text-muted-foreground hover:text-primary transition-colors">
          <Mail className="w-3.5 h-3.5" />
        </a>
        {lead.phone && (
          <a
            href={`https://wa.me/50686540888?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-[#25D366] transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  )
}

// ─── Lead Detail Panel ───────────────────────────────────────────────────────
function LeadDetailPanel({
  lead,
  onClose,
  onUpdate,
}: {
  lead: Lead
  onClose: () => void
  onUpdate: (updated: Lead) => void
}) {
  const [notes, setNotes] = useState(lead.notes ?? '')
  const [status, setStatus] = useState<LeadStatus>(lead.status)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const { data } = await supabase
      .from('leads')
      .update({ notes, status })
      .eq('id', lead.id)
      .select()
      .single()
    setSaving(false)
    if (data) onUpdate({ ...lead, notes, status })
  }

  const waText = encodeURIComponent(`Hola ${lead.full_name}, le contactamos de DR Housing en relación a su consulta inmobiliaria.`)

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end" onClick={onClose}>
      <div
        className="w-full max-w-md h-full bg-card border-l border-border shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-foreground">{lead.full_name}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Estado
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as LeadStatus)}
              className="w-full px-3 py-2 rounded border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {COLUMNS.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Contact info */}
          <div className="space-y-3">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Contacto
            </label>
            <a href={`mailto:${lead.email}`} className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors">
              <Mail className="w-4 h-4 text-muted-foreground" />
              {lead.email}
            </a>
            {lead.phone && (
              <>
                <a href={`tel:${lead.phone.replace(/\s|-/g,'')}`} className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  {lead.phone}
                </a>
                <a
                  href={`https://wa.me/50686540888?text=${waText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-[#25D366] hover:underline"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </>
            )}
          </div>

          {/* Lead details */}
          <div className="space-y-2 text-sm">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Detalles
            </label>
            {[
              { label: 'Tipo', value: lead.lead_type },
              { label: 'País', value: lead.country_of_origin },
              { label: 'Timeline', value: lead.timeline },
              { label: 'Tipo propiedad', value: lead.interested_property_type },
              { label: 'Presupuesto',
                value: lead.budget_min || lead.budget_max
                  ? `${lead.budget_min ? fmt(lead.budget_min) : '?'} – ${lead.budget_max ? fmt(lead.budget_max) : '?'}`
                  : null },
              { label: 'Zonas', value: lead.interested_areas?.join(', ') },
              { label: 'Contacto pref.', value: lead.preferred_contact_method },
              { label: 'Fecha', value: new Date(lead.created_at).toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' }) },
            ].filter(r => r.value).map(row => (
              <div key={row.label} className="flex justify-between gap-4">
                <span className="text-muted-foreground flex-shrink-0">{row.label}</span>
                <span className="text-foreground text-right">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Message */}
          {lead.message && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Mensaje
              </label>
              <p className="text-sm text-foreground bg-secondary rounded p-3 leading-relaxed">{lead.message}</p>
            </div>
          )}

          {/* Property link */}
          {lead.property_id && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Propiedad
              </label>
              <a
                href={`/admin/listings/${lead.property_id}`}
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Ver propiedad
              </a>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Notas internas
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Agregar notas sobre este lead..."
              className="w-full px-3 py-2 rounded border border-input bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Pipeline Page ──────────────────────────────────────────────────────
export default function LeadsPipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [activeLead, setActiveLead] = useState<Lead | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    setLeads((data as Lead[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  const handleDragStart = (event: DragStartEvent) => {
    const lead = leads.find((l) => l.id === event.active.id)
    if (lead) setActiveLead(lead)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveLead(null)
    const { active, over } = event
    if (!over) return

    const leadId = active.id as string
    const targetStatus = over.id as LeadStatus

    // Only update if dropped on a column header (a valid status id)
    if (!COLUMNS.find((c) => c.id === targetStatus)) return

    const lead = leads.find((l) => l.id === leadId)
    if (!lead || lead.status === targetStatus) return

    // Optimistic update
    setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, status: targetStatus } : l))

    await supabase.from('leads').update({ status: targetStatus }).eq('id', leadId)
  }

  const handleLeadUpdate = (updated: Lead) => {
    setLeads((prev) => prev.map((l) => l.id === updated.id ? updated : l))
    setSelectedLead(updated)
  }

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.id] = leads.filter((l) => l.status === col.id)
    return acc
  }, {} as Record<LeadStatus, Lead[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">Pipeline de Leads</h1>
          <p className="text-sm text-muted-foreground mt-1">{leads.length} leads · Arrastre para cambiar estado</p>
        </div>
        <a
          href="/admin/leads"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <User className="w-4 h-4" /> Vista de tabla
        </a>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-6 min-h-[calc(100vh-200px)]">
          {COLUMNS.map((col) => {
            const colLeads = grouped[col.id] ?? []
            return (
              <div key={col.id} className="flex-shrink-0 w-64">
                {/* Column header — also a drop target */}
                <div
                  id={col.id}
                  className={`flex items-center justify-between px-3 py-2 rounded-t-lg border ${col.bg} mb-2`}
                >
                  <span className={`text-xs font-semibold uppercase tracking-wide ${col.color}`}>
                    {col.label}
                  </span>
                  <span className={`text-xs font-bold ${col.color}`}>{colLeads.length}</span>
                </div>

                <SortableContext
                  items={colLeads.map((l) => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2 min-h-[200px]">
                    {colLeads.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onClick={() => setSelectedLead(lead)}
                        isDragging={activeLead?.id === lead.id}
                      />
                    ))}
                    {colLeads.length === 0 && (
                      <div className="border-2 border-dashed border-border rounded-lg h-24 flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">Vacío</span>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </div>
            )
          })}
        </div>

        <DragOverlay>
          {activeLead && (
            <div className="rotate-2 opacity-90 shadow-2xl">
              <LeadCard lead={activeLead} onClick={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {selectedLead && (
        <LeadDetailPanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleLeadUpdate}
        />
      )}
    </div>
  )
}
