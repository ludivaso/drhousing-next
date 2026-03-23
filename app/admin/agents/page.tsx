'use client'

import { useEffect, useState } from 'react'
import { Plus, Phone, Mail, Loader2, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

type Agent = {
  id: string
  full_name?: string
  name?: string
  email?: string
  phone?: string
  title?: string
  bio?: string
  active?: boolean
  created_at?: string
}

export default function AdminAgents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [tableExists, setTableExists] = useState(true)

  useEffect(() => {
    loadAgents()
  }, [])

  async function loadAgents() {
    try {
      const { data, error } = await (supabase as any).from('agents').select('*').order('created_at', { ascending: false })
      if (error?.code === 'PGRST205') { setTableExists(false); setLoading(false); return }
      setAgents(data ?? [])
    } catch {
      setTableExists(false)
    }
    setLoading(false)
  }

  async function toggleActive(agent: Agent) {
    await (supabase as any).from('agents').update({ active: !agent.active }).eq('id', agent.id)
    setAgents((prev) => prev.map((a) => a.id === agent.id ? { ...a, active: !a.active } : a))
  }

  const getDisplayName = (a: Agent) => a.full_name ?? a.name ?? 'Sin nombre'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Agentes</h1>
          <p className="text-muted-foreground text-sm mt-1">{agents.length} agentes registrados</p>
        </div>
      </div>

      {!tableExists && (
        <div className="card-elevated p-6 mb-6 border-l-4 border-gold">
          <p className="font-medium mb-1">Tabla de agentes no encontrada</p>
          <p className="text-sm text-muted-foreground">
            La tabla <code>agents</code> no existe en Supabase aún. Por ahora, los agentes se muestran como datos estáticos en la página pública /agentes.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-12 card-elevated">
          <p className="text-muted-foreground">No hay agentes registrados en la base de datos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div key={agent.id} className="card-elevated p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif font-bold text-lg">
                  {getDisplayName(agent).charAt(0)}
                </div>
                <button
                  onClick={() => toggleActive(agent)}
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    agent.active !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {agent.active !== false ? 'Activo' : 'Inactivo'}
                </button>
              </div>
              <h3 className="font-medium text-foreground">{getDisplayName(agent)}</h3>
              {agent.title && <p className="text-sm text-muted-foreground mb-3">{agent.title}</p>}
              {agent.bio && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{agent.bio}</p>}
              <div className="flex flex-col gap-1 text-sm">
                {agent.email && (
                  <a href={`mailto:${agent.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <Mail className="w-3.5 h-3.5" />{agent.email}
                  </a>
                )}
                {agent.phone && (
                  <a href={`tel:${agent.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <Phone className="w-3.5 h-3.5" />{agent.phone}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
