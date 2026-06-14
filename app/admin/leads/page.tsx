'use client'

import { useEffect, useState } from 'react'
import { Phone, Mail, MessageCircle, Search, Loader2, ChevronDown, Ban, ShieldCheck, Trash2, RotateCcw } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { waLink, buildLeadMessage, resolveLeadPhone } from '@/lib/utils/waLink'

type Lead = {
  id: string
  full_name: string
  email: string
  phone: string | null
  lead_type: string | null
  timeline: string | null
  status: string
  message: string | null
  country_of_origin: string | null
  preferred_contact_method: string | null
  interested_areas: string[] | null
  budget_min: number | null
  budget_max: number | null
  created_at: string
  source: string | null
  is_spam: boolean
  notes: string | null
  deleted_at: string | null
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-purple-100 text-purple-800',
  closed: 'bg-green-100 text-green-800',
  lost: 'bg-gray-100 text-gray-600',
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Nuevo',
  contacted: 'Contactado',
  qualified: 'Calificado',
  closed: 'Cerrado',
  lost: 'Perdido',
}

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showSpam, setShowSpam] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'active' | 'trash'>('active')

  useEffect(() => {
    loadLeads(viewMode)
  }, [viewMode])

  async function loadLeads(mode: 'active' | 'trash' = 'active') {
    setLoadError(null)
    setLoading(true)
    let query = (supabase as any).from('leads').select('*')
    if (mode === 'active') {
      query = query.is('deleted_at', null).order('created_at', { ascending: false })
    } else {
      query = query.not('deleted_at', 'is', null).order('deleted_at', { ascending: false })
    }
    const { data, error } = await query
    if (error) {
      console.error('loadLeads:', error)
      setLoadError('No se pudieron cargar los leads')
      setLoading(false)
      return
    }
    setLeads(data ?? [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    await (supabase as any).from('leads').update({ status }).eq('id', id)
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l))
  }

  async function handleMarkSpam(id: string, isSpam: boolean) {
    await (supabase as any).from('leads').update({ is_spam: isSpam }).eq('id', id)
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, is_spam: isSpam } : l))
  }

  async function handleTrash(id: string) {
    if (!window.confirm('¿Mover este lead a la papelera? Se elimina definitivamente en 30 días.')) return
    const { error } = await (supabase as any)
      .from('leads').update({ deleted_at: new Date().toISOString() }).eq('id', id)
    if (!error) setLeads((prev) => prev.filter((l) => l.id !== id))
  }

  async function handleRestore(id: string) {
    const { error } = await (supabase as any)
      .from('leads').update({ deleted_at: null }).eq('id', id)
    if (!error) setLeads((prev) => prev.filter((l) => l.id !== id))
  }

  const filtered = leads.filter((l) => {
    if (showSpam ? !l.is_spam : l.is_spam) return false
    const matchSearch =
      l.full_name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      (l.phone ?? '').includes(search)
    const matchStatus = statusFilter === 'all' || l.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Leads</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {viewMode === 'trash'
              ? `${leads.length} en papelera`
              : `${filtered.length} de ${leads.filter((l) => showSpam ? l.is_spam : !l.is_spam).length} leads${showSpam ? ' (spam)' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {viewMode === 'active' && (
            <button
              onClick={() => setShowSpam((s) => !s)}
              className={`flex items-center gap-1.5 text-sm transition-colors ${showSpam ? 'text-red-500 font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {showSpam ? <ShieldCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
              {showSpam ? 'Ocultar spam' : 'Ver spam'}
            </button>
          )}
          <div className="flex rounded border border-input overflow-hidden text-sm">
            <button
              onClick={() => setViewMode('active')}
              className={`px-3 py-1.5 transition-colors ${viewMode === 'active' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Activos
            </button>
            <button
              onClick={() => setViewMode('trash')}
              className={`px-3 py-1.5 border-l border-input transition-colors flex items-center gap-1.5 ${viewMode === 'trash' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Papelera
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email o teléfono..."
            className="w-full pl-10 pr-4 py-2.5 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 border border-input rounded bg-background text-sm focus:outline-none"
        >
          <option value="all">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([v, label]) => (
            <option key={v} value={v}>{label}</option>
          ))}
        </select>
      </div>

      {viewMode === 'trash' ? (
        loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : loadError ? (
          <div className="text-center py-12 card-elevated">
            <p className="text-sm text-destructive">{loadError}</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-12 card-elevated">
            <p className="text-muted-foreground">La papelera está vacía</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leads.map((lead) => {
              const daysDeleted = Math.floor((Date.now() - new Date(lead.deleted_at!).getTime()) / 86400000)
              const daysLeft = Math.max(0, 30 - daysDeleted)
              return (
                <div key={lead.id} className="card-elevated p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium">{lead.full_name}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{lead.email}</span>
                        {lead.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{lead.phone}</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>Eliminado {new Date(lead.deleted_at!).toLocaleDateString('es-CR')}</span>
                        <span className={daysLeft <= 5 ? 'text-red-500 font-medium' : ''}>
                          Se purga en {daysLeft} día{daysLeft !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRestore(lead.id)}
                      className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded border border-input text-muted-foreground hover:text-primary hover:border-primary transition-colors shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restaurar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : loadError ? (
        <div className="text-center py-12 card-elevated">
          <p className="text-sm text-destructive">{loadError}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 card-elevated">
          <p className="text-muted-foreground">{leads.length === 0 ? 'Aún no hay leads' : 'No hay resultados'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => (
            <div key={lead.id} className="card-elevated">
              <div
                className="p-4 cursor-pointer"
                onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{lead.full_name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[lead.status] ?? 'bg-muted text-muted-foreground'}`}>
                        {STATUS_LABELS[lead.status] ?? lead.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{lead.email}</span>
                      {lead.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{lead.phone}</span>}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {lead.lead_type && (
                        <span className="text-xs border border-border rounded px-2 py-0.5">{lead.lead_type}</span>
                      )}
                      {lead.timeline && (
                        <span className="text-xs border border-border rounded px-2 py-0.5">{lead.timeline}</span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(lead.created_at).toLocaleDateString('es-CR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {lead.phone && (
                      <a
                        href={lead.phone ? `tel:${lead.phone.replace(/\s|-/g, '')}` : undefined}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                        title="Llamar"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                    {(() => {
                      const url = waLink(resolveLeadPhone(lead), buildLeadMessage(lead.full_name, lead.notes))
                      return url
                        ? (
                            <a
                              href={url}
                              target="_blank"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded border border-border text-muted-foreground hover:text-green-600 hover:border-green-400 transition-colors"
                              title="WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          )
                        : (
                            <span className="p-1.5 text-xs text-muted-foreground" title="Sin teléfono">
                              Sin teléfono
                            </span>
                          )
                    })()}
                    <a
                      href={`mailto:${lead.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                      title="Email"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                    <select
                      value={lead.status}
                      onChange={(e) => { e.stopPropagation(); updateStatus(lead.id, e.target.value) }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs border border-input rounded px-2 py-1 bg-background focus:outline-none"
                    >
                      {Object.entries(STATUS_LABELS).map(([v, label]) => (
                        <option key={v} value={v}>{label}</option>
                      ))}
                    </select>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMarkSpam(lead.id, !lead.is_spam) }}
                      className={`p-1.5 rounded border transition-colors ${lead.is_spam ? 'border-red-300 text-red-500 hover:text-muted-foreground hover:border-border' : 'border-border text-muted-foreground hover:text-red-500 hover:border-red-300'}`}
                      title={lead.is_spam ? 'Quitar spam' : 'Marcar como spam'}
                    >
                      {lead.is_spam ? <ShieldCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleTrash(lead.id) }}
                      className="p-1.5 rounded border border-border text-muted-foreground hover:text-red-500 hover:border-red-300 transition-colors"
                      title="Mover a papelera"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedId === lead.id ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </div>

              {expandedId === lead.id && (
                <div className="px-4 pb-4 border-t border-border pt-4 space-y-3">
                  {lead.message && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Mensaje</p>
                      <p className="text-sm">{lead.message}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    {lead.country_of_origin && (
                      <div>
                        <p className="text-xs text-muted-foreground">País</p>
                        <p>{lead.country_of_origin}</p>
                      </div>
                    )}
                    {lead.preferred_contact_method && (
                      <div>
                        <p className="text-xs text-muted-foreground">Contacto preferido</p>
                        <p>{lead.preferred_contact_method}</p>
                      </div>
                    )}
                    {(lead.budget_min || lead.budget_max) && (
                      <div>
                        <p className="text-xs text-muted-foreground">Presupuesto</p>
                        <p>${lead.budget_min?.toLocaleString() ?? '?'} – ${lead.budget_max?.toLocaleString() ?? '?'}</p>
                      </div>
                    )}
                    {lead.interested_areas && lead.interested_areas.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground">Zonas de interés</p>
                        <p>{lead.interested_areas.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
