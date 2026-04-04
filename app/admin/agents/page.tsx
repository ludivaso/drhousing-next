'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

type Agent = {
  id: string
  full_name: string | null
  role: string | null
  bio: string | null
  phone: string | null
  email: string | null
  photo_url: string | null
  languages: string[] | null
  service_areas: string[] | null
  active: boolean | null
  created_at: string
}

type AgentFormData = {
  full_name: string
  role: string
  email: string
  phone: string
  bio: string
  photo_url: string
  languages: string
  service_areas: string
}

const EMPTY_FORM: AgentFormData = {
  full_name: '',
  role: '',
  email: '',
  phone: '',
  bio: '',
  photo_url: '',
  languages: '',
  service_areas: '',
}

function getInitials(name: string | null): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

function agentToForm(agent: Agent): AgentFormData {
  return {
    full_name: agent.full_name ?? '',
    role: agent.role ?? '',
    email: agent.email ?? '',
    phone: agent.phone ?? '',
    bio: agent.bio ?? '',
    photo_url: agent.photo_url ?? '',
    languages: agent.languages ? agent.languages.join(', ') : '',
    service_areas: agent.service_areas ? agent.service_areas.join(', ') : '',
  }
}

function formToPayload(form: AgentFormData): Omit<Agent, 'id' | 'created_at'> {
  return {
    full_name: form.full_name.trim() || null,
    role: form.role.trim() || null,
    email: form.email.trim() || null,
    phone: form.phone.trim() || null,
    bio: form.bio.trim() || null,
    photo_url: form.photo_url.trim() || null,
    languages: form.languages.trim()
      ? form.languages.split(',').map((s) => s.trim()).filter(Boolean)
      : null,
    service_areas: form.service_areas.trim()
      ? form.service_areas.split(',').map((s) => s.trim()).filter(Boolean)
      : null,
    active: true,
  }
}

const INPUT_CLASS =
  'w-full px-3 py-2.5 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20'
const LABEL_CLASS = 'text-sm font-medium mb-1 block'

export default function AdminAgents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [tableExists, setTableExists] = useState(true)
  const [saving, setSaving] = useState(false)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [form, setForm] = useState<AgentFormData>(EMPTY_FORM)

  const loadAgents = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await (supabase as any)
        .from('agents')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) {
        setTableExists(false)
        setLoading(false)
        return
      }
      setAgents(data ?? [])
    } catch {
      setTableExists(false)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadAgents()
  }, [loadAgents])

  // ESC key closes modal
  useEffect(() => {
    if (!modalOpen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [modalOpen])

  function openAdd() {
    setEditingAgent(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(agent: Agent) {
    setEditingAgent(agent)
    setForm(agentToForm(agent))
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingAgent(null)
    setForm(EMPTY_FORM)
  }

  function setField(field: keyof AgentFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!form.full_name.trim()) return
    setSaving(true)
    const payload = formToPayload(form)

    if (editingAgent) {
      await (supabase as any)
        .from('agents')
        .update(payload)
        .eq('id', editingAgent.id)
    } else {
      await (supabase as any).from('agents').insert(payload)
    }

    setSaving(false)
    closeModal()
    await loadAgents()
  }

  async function handleDelete(agent: Agent) {
    const confirmed = window.confirm(
      `¿Eliminar a ${agent.full_name ?? 'este agente'}?`
    )
    if (!confirmed) return
    // Optimistic remove
    setAgents((prev) => prev.filter((a) => a.id !== agent.id))
    await (supabase as any).from('agents').delete().eq('id', agent.id)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Agentes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {agents.length} {agents.length === 1 ? 'agente registrado' : 'agentes registrados'}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar Agente
        </button>
      </div>

      {/* Table not found warning */}
      {!tableExists && (
        <div className="card-elevated p-6 mb-6 border-l-4 border-gold">
          <p className="font-medium mb-1">Tabla agents no encontrada</p>
          <p className="text-sm text-muted-foreground">
            La tabla <code className="bg-muted px-1 rounded text-xs">agents</code> no existe en
            Supabase todavía. Crea la tabla para poder gestionar los agentes desde aquí.
          </p>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : agents.length === 0 && tableExists ? (
        <div className="text-center py-12 card-elevated">
          <p className="text-muted-foreground">No hay agentes registrados</p>
        </div>
      ) : agents.length > 0 ? (
        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Foto</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Rol</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Teléfono</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Idiomas</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent, idx) => (
                  <tr
                    key={agent.id}
                    className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${
                      idx % 2 === 0 ? '' : 'bg-muted/10'
                    }`}
                  >
                    {/* Photo */}
                    <td className="px-4 py-3">
                      {agent.photo_url ? (
                        <img
                          src={agent.photo_url}
                          alt={agent.full_name ?? ''}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif font-bold text-sm select-none">
                          {getInitials(agent.full_name)}
                        </div>
                      )}
                    </td>

                    {/* Nombre */}
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">
                        {agent.full_name ?? <span className="text-muted-foreground italic">Sin nombre</span>}
                      </span>
                    </td>

                    {/* Rol */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {agent.role ?? '—'}
                    </td>

                    {/* Teléfono */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {agent.phone ? (
                        <a href={`tel:${agent.phone}`} className="hover:text-primary transition-colors">
                          {agent.phone}
                        </a>
                      ) : '—'}
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {agent.email ? (
                        <a href={`mailto:${agent.email}`} className="hover:text-primary transition-colors">
                          {agent.email}
                        </a>
                      ) : '—'}
                    </td>

                    {/* Idiomas */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {agent.languages && agent.languages.length > 0
                        ? agent.languages.join(', ')
                        : '—'}
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(agent)}
                          className="p-1.5 rounded border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(agent)}
                          className="p-1.5 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal()
          }}
        >
          <div className="bg-background rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-serif text-xl font-semibold">
                {editingAgent ? 'Editar Agente' : 'Agregar Agente'}
              </h2>
              <button
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground text-xl leading-none transition-colors"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4">
              {/* full_name */}
              <div>
                <label className={LABEL_CLASS}>
                  Nombre completo <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setField('full_name', e.target.value)}
                  placeholder="Ej. María González"
                  className={INPUT_CLASS}
                  required
                />
              </div>

              {/* role */}
              <div>
                <label className={LABEL_CLASS}>Rol</label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => setField('role', e.target.value)}
                  placeholder="Ej. Agente Senior"
                  className={INPUT_CLASS}
                />
              </div>

              {/* email + phone side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                    placeholder="agente@drhousing.com"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Teléfono</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    placeholder="+506 8888-0000"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              {/* bio */}
              <div>
                <label className={LABEL_CLASS}>Biografía</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setField('bio', e.target.value)}
                  placeholder="Breve descripción del agente..."
                  rows={3}
                  className={INPUT_CLASS + ' resize-none'}
                />
              </div>

              {/* photo_url */}
              <div>
                <label className={LABEL_CLASS}>URL de foto</label>
                <input
                  type="text"
                  value={form.photo_url}
                  onChange={(e) => setField('photo_url', e.target.value)}
                  placeholder="https://..."
                  className={INPUT_CLASS}
                />
              </div>

              {/* languages */}
              <div>
                <label className={LABEL_CLASS}>Idiomas</label>
                <input
                  type="text"
                  value={form.languages}
                  onChange={(e) => setField('languages', e.target.value)}
                  placeholder="Español, Inglés"
                  className={INPUT_CLASS}
                />
                <p className="text-xs text-muted-foreground mt-1">Separados por coma</p>
              </div>

              {/* service_areas */}
              <div>
                <label className={LABEL_CLASS}>Zonas de servicio</label>
                <input
                  type="text"
                  value={form.service_areas}
                  onChange={(e) => setField('service_areas', e.target.value)}
                  placeholder="Escazú, Santa Ana"
                  className={INPUT_CLASS}
                />
                <p className="text-xs text-muted-foreground mt-1">Separadas por coma</p>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <button
                onClick={closeModal}
                disabled={saving}
                className="px-4 py-2 rounded border border-input text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.full_name.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
