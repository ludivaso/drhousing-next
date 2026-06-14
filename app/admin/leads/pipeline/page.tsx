'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Phone, Mail, MessageCircle, X, Save, Loader2,
  ExternalLink, User, DollarSign, MapPin, GripVertical, Ban, ShieldCheck, Star, Pencil, ChevronDown, Trash2
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { waLink, buildLeadMessage, resolveLeadPhone } from '@/lib/utils/waLink'
import WhatsAppConversation from '@/components/admin/WhatsAppConversation'

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
  is_spam: boolean
  second_full_name: string | null
  second_email: string | null
  second_phone: string | null
  primary_phone: string | null
  primary_email: string | null
  deleted_at: string | null
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
  onMarkSpam,
  isDragging = false,
}: {
  lead: Lead
  onClick: () => void
  onMarkSpam: (id: string, isSpam: boolean) => void
  isDragging?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lead.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const waUrl = waLink(resolveLeadPhone(lead), buildLeadMessage(lead.full_name, lead.notes))

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
        {waUrl
          ? (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-[#25D366] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            )
          : <span className="text-xs text-muted-foreground">Sin teléfono</span>
        }
        <button
          onClick={(e) => { e.stopPropagation(); onMarkSpam(lead.id, !lead.is_spam) }}
          className="text-muted-foreground/40 hover:text-red-500 transition-colors"
          title={lead.is_spam ? 'Quitar spam' : 'Marcar como spam'}
        >
          {lead.is_spam ? <ShieldCheck className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  )
}

// ─── Lead Detail Panel ───────────────────────────────────────────────────────
function LeadDetailPanel({
  lead,
  onClose,
  onUpdate,
  onMarkSpam,
  onTrash,
}: {
  lead: Lead
  onClose: () => void
  onUpdate: (updated: Lead) => void
  onMarkSpam: (id: string, isSpam: boolean) => void
  onTrash: () => void
}) {
  const [notes, setNotes] = useState(lead.notes ?? '')
  const [status, setStatus] = useState<LeadStatus>(lead.status)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [fullName, setFullName] = useState(lead.full_name)
  const [email, setEmail] = useState(lead.email)
  const [phone, setPhone] = useState(lead.phone ?? '')
  const [secondName, setSecondName] = useState(lead.second_full_name ?? '')
  const [secondEmail, setSecondEmail] = useState(lead.second_email ?? '')
  const [secondPhone, setSecondPhone] = useState(lead.second_phone ?? '')
  const [primaryPhone, setPrimaryPhone] = useState<string | null>(lead.primary_phone ?? null)
  const [primaryEmail, setPrimaryEmail] = useState<string | null>(lead.primary_email ?? null)
  const [showWA, setShowWA] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const patch = {
      notes,
      status,
      full_name: fullName,
      email,
      phone: phone || null,
      second_full_name: secondName || null,
      second_email: secondEmail || null,
      second_phone: secondPhone || null,
    }
    const { data } = await supabase
      .from('leads')
      .update(patch)
      .eq('id', lead.id)
      .select()
      .single()
    setSaving(false)
    if (data) {
      onUpdate({ ...lead, ...patch, primary_phone: primaryPhone, primary_email: primaryEmail })
      setEditMode(false)
    }
  }

  const handleStarPhone = async (key: 'phone' | 'second_phone') => {
    const newVal: string | null = primaryPhone === key ? null : key
    setPrimaryPhone(newVal)
    await supabase.from('leads').update({ primary_phone: newVal }).eq('id', lead.id)
    onUpdate({ ...lead, primary_phone: newVal, primary_email: primaryEmail })
  }

  const handleStarEmail = async (key: 'email' | 'second_email') => {
    const newVal: string | null = primaryEmail === key ? null : key
    setPrimaryEmail(newVal)
    await supabase.from('leads').update({ primary_email: newVal }).eq('id', lead.id)
    onUpdate({ ...lead, primary_phone: primaryPhone, primary_email: newVal })
  }

  const waUrl = waLink(
    resolveLeadPhone({ phone: phone || null, second_phone: secondPhone || null, primary_phone: primaryPhone }),
    buildLeadMessage(lead.full_name, lead.notes)
  )

  const inputCls = 'w-full px-3 py-1.5 rounded border border-input bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end" onClick={onClose}>
      <div
        className="w-full max-w-md h-full bg-card border-l border-border shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-foreground truncate">
            {editMode ? fullName || lead.full_name : lead.full_name}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
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
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Contacto
              </label>
              <button
                type="button"
                onClick={() => setEditMode((m) => !m)}
                className={`flex items-center gap-1 text-xs transition-colors ${editMode ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Pencil className="w-3 h-3" />
                {editMode ? 'Editando' : 'Editar'}
              </button>
            </div>

            {editMode ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Nombre</p>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Teléfono</p>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide border-t border-border pt-3">
                  Contacto adicional
                </p>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Nombre</p>
                  <input value={secondName} onChange={(e) => setSecondName(e.target.value)} placeholder="Nombre" className={inputCls} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <input type="email" value={secondEmail} onChange={(e) => setSecondEmail(e.target.value)} placeholder="email@ejemplo.com" className={inputCls} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Teléfono</p>
                  <input type="tel" value={secondPhone} onChange={(e) => setSecondPhone(e.target.value)} placeholder="+506 0000 0000" className={inputCls} />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Email rows */}
                <div className="flex items-center gap-2">
                  <a href={`mailto:${lead.email}`} className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors flex-1 min-w-0">
                    <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{lead.email}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleStarEmail('email')}
                    className={`shrink-0 transition-colors ${primaryEmail === 'email' ? 'text-yellow-400' : 'text-muted-foreground/30 hover:text-yellow-400'}`}
                    title="Marcar como email favorito"
                  >
                    <Star className={`w-3.5 h-3.5 ${primaryEmail === 'email' ? 'fill-yellow-400' : ''}`} />
                  </button>
                </div>
                {lead.second_email && (
                  <div className="flex items-center gap-2">
                    <a href={`mailto:${lead.second_email}`} className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors flex-1 min-w-0">
                      <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                      {lead.second_full_name && <span className="text-muted-foreground text-xs shrink-0">{lead.second_full_name.split(' ')[0]}</span>}
                      <span className="truncate">{lead.second_email}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleStarEmail('second_email')}
                      className={`shrink-0 transition-colors ${primaryEmail === 'second_email' ? 'text-yellow-400' : 'text-muted-foreground/30 hover:text-yellow-400'}`}
                      title="Marcar como email favorito"
                    >
                      <Star className={`w-3.5 h-3.5 ${primaryEmail === 'second_email' ? 'fill-yellow-400' : ''}`} />
                    </button>
                  </div>
                )}

                {/* Phone rows */}
                {lead.phone && (
                  <div className="flex items-center gap-2">
                    <a href={`tel:${lead.phone.replace(/\s|-/g, '')}`} className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors flex-1">
                      <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                      {lead.phone}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleStarPhone('phone')}
                      className={`shrink-0 transition-colors ${primaryPhone === 'phone' ? 'text-yellow-400' : 'text-muted-foreground/30 hover:text-yellow-400'}`}
                      title="Marcar como teléfono favorito"
                    >
                      <Star className={`w-3.5 h-3.5 ${primaryPhone === 'phone' ? 'fill-yellow-400' : ''}`} />
                    </button>
                  </div>
                )}
                {lead.second_phone && (
                  <div className="flex items-center gap-2">
                    <a href={`tel:${lead.second_phone.replace(/\s|-/g, '')}`} className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors flex-1">
                      <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                      {lead.second_full_name && <span className="text-muted-foreground text-xs shrink-0">{lead.second_full_name.split(' ')[0]}</span>}
                      {lead.second_phone}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleStarPhone('second_phone')}
                      className={`shrink-0 transition-colors ${primaryPhone === 'second_phone' ? 'text-yellow-400' : 'text-muted-foreground/30 hover:text-yellow-400'}`}
                      title="Marcar como teléfono favorito"
                    >
                      <Star className={`w-3.5 h-3.5 ${primaryPhone === 'second_phone' ? 'fill-yellow-400' : ''}`} />
                    </button>
                  </div>
                )}

                {/* WA link */}
                {waUrl
                  ? (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-[#25D366] hover:underline"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </a>
                  )
                  : (
                    <span className="flex items-center gap-3 text-sm text-muted-foreground">
                      <MessageCircle className="w-4 h-4" />
                      Sin teléfono
                    </span>
                  )
                }

                {/* Spam toggle */}
                <button
                  type="button"
                  onClick={() => onMarkSpam(lead.id, !lead.is_spam)}
                  className={`flex items-center gap-3 text-sm transition-colors ${lead.is_spam ? 'text-red-500 hover:text-muted-foreground' : 'text-muted-foreground hover:text-red-500'}`}
                >
                  {lead.is_spam ? <ShieldCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                  {lead.is_spam ? 'Quitar spam' : 'Marcar como spam'}
                </button>
                {/* Trash */}
                <button
                  type="button"
                  onClick={onTrash}
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Mover a papelera
                </button>
              </div>
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

          {/* WhatsApp inbox */}
          <div>
            <button
              type="button"
              onClick={() => setShowWA((s) => !s)}
              className="flex items-center justify-between w-full text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              WhatsApp
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showWA ? 'rotate-180' : ''}`} />
            </button>
            {showWA && (
              <div className="mt-3">
                <WhatsAppConversation
                  leadId={lead.id}
                  leadPhone={resolveLeadPhone({
                    phone: phone || null,
                    second_phone: secondPhone || null,
                    primary_phone: primaryPhone,
                  })}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Droppable Column ───────────────────────────────────────────────────────
function DroppableColumn({
  col,
  colLeads,
  activeLead,
  onCardClick,
  onMarkSpam,
}: {
  col: Column
  colLeads: Lead[]
  activeLead: Lead | null
  onCardClick: (lead: Lead) => void
  onMarkSpam: (id: string, isSpam: boolean) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id })

  return (
    <div className="flex-shrink-0 w-64">
      <div className={`flex items-center justify-between px-3 py-2 rounded-t-lg border ${col.bg} mb-2`}>
        <span className={`text-xs font-semibold uppercase tracking-wide ${col.color}`}>
          {col.label}
        </span>
        <span className={`text-xs font-bold ${col.color}`}>{colLeads.length}</span>
      </div>

      <SortableContext items={colLeads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`space-y-2 min-h-[200px] rounded-b-lg transition-colors ${isOver ? 'bg-primary/5 ring-1 ring-primary/20' : ''}`}
        >
          {colLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onClick={() => onCardClick(lead)}
              onMarkSpam={onMarkSpam}
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
}

// ─── Main Pipeline Page ──────────────────────────────────────────────────────
export default function LeadsPipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [activeLead, setActiveLead] = useState<Lead | null>(null)
  const [showSpam, setShowSpam] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    if (error) {
      console.error('fetchLeads:', error)
      setLoadError('No se pudieron cargar los leads')
      setLoading(false)
      return
    }
    setLeads((data as Lead[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchLeads()
    const channel = supabase
      .channel('leads-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        () => fetchLeads()
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchLeads])

  const handleDragStart = (event: DragStartEvent) => {
    const lead = leads.find((l) => l.id === event.active.id)
    if (lead) setActiveLead(lead)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveLead(null)
    const { active, over } = event
    if (!over) return

    const leadId = active.id as string

    // over.id is either a column status (dropped on the column droppable)
    // or a card UUID (dropped on top of another card — resolve to that card's column)
    let targetStatus: LeadStatus
    if (COLUMNS.find((c) => c.id === over.id)) {
      targetStatus = over.id as LeadStatus
    } else {
      const overLead = leads.find((l) => l.id === over.id)
      if (!overLead) return
      targetStatus = overLead.status
    }

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

  const handleMarkSpam = useCallback(async (id: string, isSpam: boolean) => {
    await supabase.from('leads').update({ is_spam: isSpam }).eq('id', id)
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, is_spam: isSpam } : l))
    setSelectedLead((prev) => prev?.id === id ? { ...prev, is_spam: isSpam } : prev)
  }, [])

  const handleTrash = useCallback(async (id: string) => {
    if (!window.confirm('¿Mover este lead a la papelera? Se elimina definitivamente en 30 días.')) return
    const { error } = await supabase
      .from('leads').update({ deleted_at: new Date().toISOString() }).eq('id', id)
    if (!error) {
      setLeads((prev) => prev.filter((l) => l.id !== id))
      setSelectedLead(null)
    }
  }, [])

  const visibleLeads = leads.filter((l) => showSpam ? l.is_spam : !l.is_spam)

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.id] = visibleLeads.filter((l) => l.status === col.id)
    return acc
  }, {} as Record<LeadStatus, Lead[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-destructive">{loadError}</p>
      </div>
    )
  }

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">Pipeline de Leads</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {visibleLeads.length} leads{showSpam ? ' (spam)' : ''} · Arrastre para cambiar estado
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSpam((s) => !s)}
            className={`flex items-center gap-1.5 text-sm transition-colors ${showSpam ? 'text-red-500 font-medium' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {showSpam ? <ShieldCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
            {showSpam ? 'Ocultar spam' : 'Ver spam'}
          </button>
          <a
            href="/admin/leads"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <User className="w-4 h-4" /> Vista de tabla
          </a>
        </div>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-6 min-h-[calc(100vh-200px)]">
          {COLUMNS.map((col) => (
            <DroppableColumn
              key={col.id}
              col={col}
              colLeads={grouped[col.id] ?? []}
              activeLead={activeLead}
              onCardClick={setSelectedLead}
              onMarkSpam={handleMarkSpam}
            />
          ))}
        </div>

        <DragOverlay>
          {activeLead && (
            <div className="rotate-2 opacity-90 shadow-2xl">
              <LeadCard lead={activeLead} onClick={() => {}} onMarkSpam={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {selectedLead && (
        <LeadDetailPanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleLeadUpdate}
          onMarkSpam={handleMarkSpam}
          onTrash={() => handleTrash(selectedLead.id)}
        />
      )}
    </div>
  )
}
