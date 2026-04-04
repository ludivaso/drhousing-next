'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Phone, Mail, MessageCircle, Search, Loader2, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
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

const PAGE_SIZE = 20

// Status config
const STATUS_MAP: Record<string, { label: string; className: string }> = {
  new:       { label: 'Nuevo',       className: 'bg-blue-100 text-blue-800' },
  contacted: { label: 'Contactado',  className: 'bg-yellow-100 text-yellow-800' },
  qualified: { label: 'Calificado',  className: 'bg-purple-100 text-purple-800' },
  proposal:  { label: 'Propuesta',   className: 'bg-orange-100 text-orange-800' },
  won:       { label: 'Ganado',      className: 'bg-green-100 text-green-800' },
  lost:      { label: 'Perdido',     className: 'bg-gray-100 text-gray-600' },
}

// Type config
const TYPE_MAP: Record<string, { label: string; className: string }> = {
  buyer:   { label: 'Comprador',    className: 'bg-blue-50 text-blue-700 border border-blue-200' },
  renter:  { label: 'Arrendatario', className: 'bg-green-50 text-green-700 border border-green-200' },
  seller:  { label: 'Vendedor',     className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  general: { label: 'General',      className: 'bg-gray-50 text-gray-600 border border-gray-200' },
}

type TabKey = 'all' | 'new' | 'in_progress' | 'won' | 'lost'
const TABS: { key: TabKey; label: string }[] = [
  { key: 'all',         label: 'Todos' },
  { key: 'new',         label: 'Nuevos' },
  { key: 'in_progress', label: 'En proceso' },
  { key: 'won',         label: 'Ganados' },
  { key: 'lost',        label: 'Perdidos' },
]

function matchesTab(status: string, tab: TabKey): boolean {
  if (tab === 'all') return true
  if (tab === 'new') return status === 'new'
  if (tab === 'in_progress') return ['contacted', 'qualified', 'proposal'].includes(status)
  if (tab === 'won') return status === 'won'
  if (tab === 'lost') return status === 'lost'
  return true
}

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setLeads(data ?? [])
        setLoading(false)
      })
  }, [])

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [search, activeTab])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return leads.filter((l) => {
      const matchSearch =
        !q ||
        l.full_name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        (l.phone ?? '').includes(q)
      return matchSearch && matchesTab(l.status, activeTab)
    })
  }, [leads, search, activeTab])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const startIdx = (page - 1) * PAGE_SIZE + 1
  const endIdx = Math.min(page * PAGE_SIZE, filtered.length)

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<TabKey, number> = { all: leads.length, new: 0, in_progress: 0, won: 0, lost: 0 }
    for (const l of leads) {
      if (l.status === 'new') counts.new++
      else if (['contacted', 'qualified', 'proposal'].includes(l.status)) counts.in_progress++
      else if (l.status === 'won') counts.won++
      else if (l.status === 'lost') counts.lost++
    }
    return counts
  }, [leads])

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Leads</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {filtered.length > 0
              ? `${startIdx}–${endIdx} de ${filtered.length} leads`
              : `${leads.length} leads`}
          </p>
        </div>
        <Link
          href="/admin/leads/pipeline"
          className="inline-flex items-center gap-2 px-4 py-2 rounded border border-border text-sm hover:bg-secondary transition-colors"
        >
          Pipeline →
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, email o teléfono..."
          className="w-full pl-10 pr-4 py-2.5 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
              activeTab === tab.key
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs text-muted-foreground">({tabCounts[tab.key]})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : paginated.length === 0 ? (
        <div className="text-center py-12 card-elevated">
          <p className="text-muted-foreground">{leads.length === 0 ? 'Aún no hay leads' : 'No hay resultados'}</p>
        </div>
      ) : (
        <div className="card-elevated overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Email / Tel</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Fecha</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((lead) => {
                const statusCfg = STATUS_MAP[lead.status] ?? { label: lead.status, className: 'bg-muted text-muted-foreground' }
                const typeCfg = lead.lead_type ? (TYPE_MAP[lead.lead_type] ?? { label: lead.lead_type, className: 'bg-muted text-muted-foreground border border-border' }) : null
                return (
                  <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{lead.full_name}</div>
                      {lead.country_of_origin && (
                        <div className="text-xs text-muted-foreground">{lead.country_of_origin}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-muted-foreground truncate max-w-[180px]">{lead.email}</span>
                        {lead.phone && <span className="text-muted-foreground text-xs">{lead.phone}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {typeCfg && (
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${typeCfg.className}`}>
                          {typeCfg.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCfg.className}`}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                      {new Date(lead.created_at).toLocaleDateString('es-CR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {lead.phone && (
                          <a
                            href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded text-muted-foreground hover:text-[#25D366] transition-colors"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        )}
                        <a
                          href={`mailto:${lead.email}`}
                          className="p-1.5 rounded text-muted-foreground hover:text-primary transition-colors"
                          title="Email"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          className="p-1.5 rounded text-muted-foreground hover:text-primary transition-colors"
                          title="Ver detalle"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="inline-flex items-center gap-1 px-3 py-2 rounded border border-border text-sm disabled:opacity-40 hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>
          <span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="inline-flex items-center gap-1 px-3 py-2 rounded border border-border text-sm disabled:opacity-40 hover:bg-secondary transition-colors"
          >
            Siguiente <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
