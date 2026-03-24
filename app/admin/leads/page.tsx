'use client'

import { useEffect, useState } from 'react'
import { Phone, Mail, MessageCircle, Search, Archive, Loader2, ChevronDown } from 'lucide-react'
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
  country_of_origin: string | null
  preferred_contact_method: string | null
  interested_areas: string[] | null
  budget_min: number | null
  budget_max: number | null
  created_at: string
  source: string | null
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

  useEffect(() => {
    loadLeads()
  }, [])

  async function loadLeads() {
    const { data } = await (supabase as any)
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    setLeads(data ?? [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    await (supabase as any).from('leads').update({ status }).eq('id', id)
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l))
  }

  const filtered = leads.filter((l) => {
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
          <p className="text-muted-foreground text-sm mt-1">{filtered.length} de {leads.length} leads</p>
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

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
                      <>
                        <a
                          href={`tel:${lead.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                          title="Llamar"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                        <a
                          href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded border border-border text-muted-foreground hover:text-green-600 hover:border-green-400 transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      </>
                    )}
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
