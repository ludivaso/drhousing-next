'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Home, Users, UserCircle, Loader2, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ properties: 0, leads: 0, agents: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ count: pCount }, { count: lCount }, { count: aCount }] = await Promise.all([
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        (supabase as any).from('leads').select('*', { count: 'exact', head: true }),
        (supabase as any).from('agents').select('*', { count: 'exact', head: true }),
      ])
      setStats({ properties: pCount ?? 0, leads: lCount ?? 0, agents: aCount ?? 0 })
      setLoading(false)
    }
    load()
  }, [])

  const cards = [
    { label: 'Propiedades', value: stats.properties, icon: Home, href: '/admin/listings', color: 'bg-primary/10' },
    { label: 'Leads', value: stats.leads, icon: Users, href: '/admin/leads', color: 'bg-gold/10' },
    { label: 'Agentes', value: stats.agents, icon: UserCircle, href: '/admin/agents', color: 'bg-primary/10' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Panel de administración DR Housing</p>
        </div>
        <Link
          href="/admin/listings/new"
          className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + Nueva Propiedad
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="card-elevated p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  <card.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="font-serif text-3xl font-semibold">{card.value}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="card-elevated p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="font-serif text-lg font-semibold">Accesos rápidos</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Ver Propiedades', href: '/admin/listings' },
            { label: 'Ver Leads', href: '/admin/leads' },
            { label: 'Nueva Propiedad', href: '/admin/listings/new' },
            { label: 'Ver Sitio', href: '/' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-center py-3 px-4 rounded border border-border text-sm hover:bg-secondary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
