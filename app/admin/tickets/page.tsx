'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  X,
  ChevronDown,
  AlertCircle,
  Zap,
  CheckSquare,
  HelpCircle,
  Clock,
  Loader2,
  MessageSquare,
  ExternalLink,
  Trash2,
  Edit2,
  Send,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import type { TicketRow } from '@/src/integrations/supabase/types'

// ── Types ────────────────────────────────────────────────────────────────────

type TicketStatus = 'open' | 'in_progress' | 'done' | 'closed'
type TicketType   = 'bug' | 'feature' | 'task' | 'other'
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

interface Comment {
  id: string
  author: string
  body: string
  created_at: string
}

// ── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TicketStatus, { label: string; cls: string }> = {
  open:        { label: 'Abierto',     cls: 'bg-blue-100 text-blue-800 border border-blue-200' },
  in_progress: { label: 'En Proceso',  cls: 'bg-amber-100 text-amber-800 border border-amber-200' },
  done:        { label: 'Listo',       cls: 'bg-green-100 text-green-800 border border-green-200' },
  closed:      { label: 'Cerrado',     cls: 'bg-gray-100 text-gray-500 border border-gray-200' },
}

const TYPE_CONFIG: Record<TicketType, { label: string; Icon: React.ElementType; cls: string }> = {
  bug:     { label: 'Bug',       Icon: AlertCircle,  cls: 'text-red-600' },
  feature: { label: 'Feature',   Icon: Zap,          cls: 'text-purple-600' },
  task:    { label: 'Tarea',     Icon: CheckSquare,  cls: 'text-blue-600' },
  other:   { label: 'Otro',      Icon: HelpCircle,   cls: 'text-gray-500' },
}

const PRIORITY_CONFIG: Record<TicketPriority, { label: string; cls: string }> = {
  low:    { label: 'Baja',     cls: 'text-gray-400' },
  medium: { label: 'Media',    cls: 'text-blue-500' },
  high:   { label: 'Alta',     cls: 'text-orange-500' },
  urgent: { label: 'Urgente',  cls: 'text-red-600 font-semibold' },
}

const STATUS_TABS: Array<{ key: TicketStatus | 'all'; label: string }> = [
  { key: 'all',        label: 'Todos' },
  { key: 'open',       label: 'Abierto' },
  { key: 'in_progress',label: 'En Proceso' },
  { key: 'done',       label: 'Listo' },
  { key: 'closed',     label: 'Cerrado' },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// ── Ticket Form Modal ─────────────────────────────────────────────────────────

interface TicketFormProps {
  initial?: Partial<TicketRow>
  onSave: (data: Partial<TicketRow>) => Promise<void>
  onClose: () => void
}

function TicketForm({ initial, onSave, onClose }: TicketFormProps) {
  const [title,         setTitle]         = useState(initial?.title ?? '')
  const [type,          setType]          = useState<TicketType>(initial?.type ?? 'task')
  const [priority,      setPriority]      = useState<TicketPriority>(initial?.priority ?? 'medium')
  const [description,   setDescription]   = useState(initial?.description ?? '')
  const [screenshotUrl, setScreenshotUrl] = useState(initial?.screenshot_url ?? '')
  const [saving,        setSaving]        = useState(false)
  const [error,         setError]         = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('El título es obligatorio'); return }
    setSaving(true)
    setError(null)
    try {
      await onSave({
        title:          title.trim(),
        type,
        priority,
        description:    description.trim() || null,
        screenshot_url: screenshotUrl.trim() || null,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar'
      setError(msg)
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-serif text-lg font-semibold">{initial?.id ? 'Editar Ticket' : 'Nuevo Ticket'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Título <span className="text-red-500">*</span></label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Descripción breve del ticket"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Tipo</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as TicketType)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Prioridad</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as TicketPriority)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Descripción</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              placeholder="Detalla el problema o la solicitud..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">URL de captura (opcional)</label>
            <input
              type="url"
              value={screenshotUrl}
              onChange={e => setScreenshotUrl(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-secondary transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {initial?.id ? 'Guardar cambios' : 'Crear Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Detail Panel ──────────────────────────────────────────────────────────────

interface DetailPanelProps {
  ticket: TicketRow
  onClose: () => void
  onUpdate: (id: string, changes: Partial<TicketRow>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onEdit: (ticket: TicketRow) => void
  currentUserEmail: string
}

function DetailPanel({ ticket, onClose, onUpdate, onDelete, onEdit, currentUserEmail }: DetailPanelProps) {
  const [comments,    setComments]    = useState<Comment[]>((ticket.comments as Comment[]) ?? [])
  const [commentBody, setCommentBody] = useState('')
  const [savingComment, setSavingComment] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const TypeIcon = TYPE_CONFIG[ticket.type].Icon

  const handleStatusChange = (status: TicketStatus) => {
    onUpdate(ticket.id, { status })
  }

  const handleAddComment = async () => {
    if (!commentBody.trim()) return
    setSavingComment(true)
    const newComment: Comment = {
      id: uid(),
      author: currentUserEmail,
      body: commentBody.trim(),
      created_at: new Date().toISOString(),
    }
    const updated = [...comments, newComment]
    setComments(updated)
    setCommentBody('')
    await onUpdate(ticket.id, { comments: updated as unknown as TicketRow['comments'] })
    setSavingComment(false)
  }

  const handleDeleteComment = async (commentId: string) => {
    const updated = comments.filter(c => c.id !== commentId)
    setComments(updated)
    await onUpdate(ticket.id, { comments: updated as unknown as TicketRow['comments'] })
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card w-full max-w-lg h-full overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-start gap-3 z-10">
          <TypeIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${TYPE_CONFIG[ticket.type].cls}`} />
          <div className="flex-1 min-w-0">
            <h2 className="font-serif text-base font-semibold text-foreground leading-snug">{ticket.title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{formatDate(ticket.created_at)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onEdit(ticket)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 space-y-6">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Estado</p>
              <select
                value={ticket.status}
                onChange={e => handleStatusChange(e.target.value as TicketStatus)}
                className="w-full border border-border rounded px-2 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Prioridad</p>
              <p className={`text-sm font-medium ${PRIORITY_CONFIG[ticket.priority].cls}`}>
                {PRIORITY_CONFIG[ticket.priority].label}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Tipo</p>
              <p className="text-sm">{TYPE_CONFIG[ticket.type].label}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Creado por</p>
              <p className="text-sm truncate">{ticket.created_by ?? '—'}</p>
            </div>
          </div>

          {/* Description */}
          {ticket.description && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Descripción</p>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
            </div>
          )}

          {/* Screenshot */}
          {ticket.screenshot_url && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Captura de pantalla</p>
              <a
                href={ticket.screenshot_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Ver captura
              </a>
            </div>
          )}

          {/* Comments */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              Comentarios ({comments.length})
            </p>

            {comments.length > 0 ? (
              <div className="space-y-3 mb-4">
                {comments.map(c => (
                  <div key={c.id} className="bg-secondary/60 rounded-lg p-3 text-sm relative group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-foreground text-xs">{c.author}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{formatDate(c.created_at)}</span>
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-600 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-foreground whitespace-pre-wrap">{c.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">Sin comentarios aún.</p>
            )}

            {/* Add comment */}
            <div className="flex gap-2">
              <textarea
                value={commentBody}
                onChange={e => setCommentBody(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddComment() }}
                rows={2}
                className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                placeholder="Añadir comentario… (Cmd+Enter para enviar)"
              />
              <button
                onClick={handleAddComment}
                disabled={savingComment || !commentBody.trim()}
                className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 self-end"
              >
                {savingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4">
          {confirmDelete ? (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-red-600 flex-1">¿Eliminar este ticket?</span>
              <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 rounded border border-border hover:bg-secondary text-sm">
                Cancelar
              </button>
              <button onClick={() => onDelete(ticket.id)} className="px-3 py-1.5 rounded bg-red-600 text-white text-sm hover:bg-red-700">
                Eliminar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar ticket
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Ticket Card ───────────────────────────────────────────────────────────────

function TicketCard({ ticket, onClick }: { ticket: TicketRow; onClick: () => void }) {
  const TypeIcon = TYPE_CONFIG[ticket.type].Icon
  const status   = STATUS_CONFIG[ticket.status]
  const priority = PRIORITY_CONFIG[ticket.priority]
  const commentCount = ((ticket.comments as Comment[]) ?? []).length

  return (
    <div
      onClick={onClick}
      className="group bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <TypeIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${TYPE_CONFIG[ticket.type].cls}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {ticket.title}
            </h3>
            <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full ${status.cls}`}>
              {status.label}
            </span>
          </div>

          {ticket.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{ticket.description}</p>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className={priority.cls}>{priority.label}</span>
              <span>{TYPE_CONFIG[ticket.type].label}</span>
            </div>
            <div className="flex items-center gap-3">
              {commentCount > 0 && (
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> {commentCount}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {formatDate(ticket.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TicketsPage() {
  const [tickets,       setTickets]       = useState<TicketRow[]>([])
  const [loading,       setLoading]       = useState(true)
  const [statusFilter,  setStatusFilter]  = useState<TicketStatus | 'all'>('all')
  const [typeFilter,    setTypeFilter]    = useState<TicketType | 'all'>('all')
  const [search,        setSearch]        = useState('')
  const [showForm,      setShowForm]      = useState(false)
  const [editTicket,    setEditTicket]    = useState<TicketRow | null>(null)
  const [detailTicket,  setDetailTicket]  = useState<TicketRow | null>(null)
  const [currentEmail,  setCurrentEmail]  = useState('')
  const [error,         setError]         = useState<string | null>(null)

  // ── Fetch ──

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })

    if (err) {
      // Table may not exist yet — show empty state gracefully
      console.warn('support_tickets:', err.message)
      setTickets([])
    } else {
      setTickets((data ?? []) as TicketRow[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTickets()
    supabase.auth.getUser().then(({ data }) => {
      setCurrentEmail(data.user?.email ?? 'admin')
    })
  }, [fetchTickets])

  // ── CRUD ──

  const handleCreate = async (data: Partial<TicketRow>) => {
    const { data: created, error: err } = await supabase
      .from('support_tickets')
      .insert({
        ...data,
        status:     'open',
        created_by: currentEmail,
        comments:   [],
      })
      .select()
      .single()

    if (err) throw err
    setTickets(prev => [created as TicketRow, ...prev])
    setShowForm(false)
  }

  const handleUpdate = async (id: string, changes: Partial<TicketRow>) => {
    const { data: updated, error: err } = await supabase
      .from('support_tickets')
      .update({ ...changes, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (err) throw err
    setTickets(prev => prev.map(t => t.id === id ? updated as TicketRow : t))
    if (detailTicket?.id === id) setDetailTicket(updated as TicketRow)
  }

  const handleEdit = async (data: Partial<TicketRow>) => {
    if (!editTicket) return
    await handleUpdate(editTicket.id, data)
    setEditTicket(null)
  }

  const handleDelete = async (id: string) => {
    const { error: err } = await supabase.from('support_tickets').delete().eq('id', id)
    if (err) { setError(err.message); return }
    setTickets(prev => prev.filter(t => t.id !== id))
    setDetailTicket(null)
  }

  // ── Filter ──

  const filtered = tickets.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (typeFilter !== 'all'   && t.type   !== typeFilter)   return false
    if (search) {
      const q = search.toLowerCase()
      if (!t.title.toLowerCase().includes(q) && !(t.description ?? '').toLowerCase().includes(q)) return false
    }
    return true
  })

  // ── Counts ──

  const countByStatus = (s: TicketStatus) => tickets.filter(t => t.status === s).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">Tickets de Soporte</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} en total
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Ticket
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['open', 'in_progress', 'done', 'closed'] as TicketStatus[]).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
            className={`rounded-xl border p-3 text-left transition-all ${
              statusFilter === s ? 'border-primary/50 shadow-sm bg-primary/5' : 'border-border bg-card hover:border-primary/30'
            }`}
          >
            <p className={`text-xl font-semibold font-serif ${statusFilter === s ? 'text-primary' : 'text-foreground'}`}>
              {countByStatus(s)}
            </p>
            <p className={`text-xs mt-0.5 ${STATUS_CONFIG[s].cls} w-fit px-2 py-0.5 rounded-full`}>
              {STATUS_CONFIG[s].label}
            </p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Status tabs */}
        <div className="flex bg-secondary rounded-lg p-1 gap-0.5 overflow-x-auto">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === tab.key
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div className="relative">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as TicketType | 'all')}
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">Todos los tipos</option>
            {Object.entries(TYPE_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>

        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
          placeholder="Buscar tickets…"
        />
      </div>

      {/* Ticket list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No hay tickets</p>
          <p className="text-sm mt-1">
            {tickets.length === 0
              ? 'Crea el primer ticket con el botón de arriba.'
              : 'Cambia los filtros para ver más resultados.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(t => (
            <TicketCard key={t.id} ticket={t} onClick={() => setDetailTicket(t)} />
          ))}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <TicketForm onSave={handleCreate} onClose={() => setShowForm(false)} />
      )}
      {editTicket && (
        <TicketForm initial={editTicket} onSave={handleEdit} onClose={() => setEditTicket(null)} />
      )}
      {detailTicket && (
        <DetailPanel
          ticket={detailTicket}
          onClose={() => setDetailTicket(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onEdit={(t) => { setDetailTicket(null); setEditTicket(t) }}
          currentUserEmail={currentEmail}
        />
      )}
    </div>
  )
}
