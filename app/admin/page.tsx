import Link from 'next/link'
import { Home, Globe, Users, UserCircle, TrendingUp } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'

interface Metrics {
  totalListings: number
  publicListings: number
  activeLeads: number
  agents: number
}

async function fetchMetrics(): Promise<Metrics> {
  const supabase = createAdminClient()

  // 1. Total listings — all rows
  const { count: totalListings } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })

  // 2. Public listings — hidden=false AND visibility='public'
  const { count: publicListings } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('hidden', false)
    .eq('visibility', 'public')

  // 3. Active leads — status NOT IN closed_won / closed_lost / archived
  let activeLeads = 0
  try {
    const { count, error } = await (supabase as any)
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .not('status', 'in', '("closed_won","closed_lost","archived")')
    if (!error) activeLeads = count ?? 0
  } catch {
    // table doesn't exist or query failed — leave at 0
  }

  // 4. Agents
  let agents = 0
  try {
    const { count, error } = await (supabase as any)
      .from('agents')
      .select('*', { count: 'exact', head: true })
    if (!error) agents = count ?? 0
  } catch {
    // table doesn't exist or query failed — leave at 0
  }

  return {
    totalListings: totalListings ?? 0,
    publicListings: publicListings ?? 0,
    activeLeads,
    agents,
  }
}

export default async function AdminDashboardPage() {
  const metrics = await fetchMetrics()

  const now = new Date()
  const formattedDate = now.toLocaleDateString('es-DO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const cards = [
    {
      label: 'Total Listados',
      value: metrics.totalListings,
      icon: Home,
      href: '/admin/listings',
    },
    {
      label: 'Públicos',
      value: metrics.publicListings,
      icon: Globe,
      href: '/admin/listings',
    },
    {
      label: 'Leads activos',
      value: metrics.activeLeads,
      icon: Users,
      href: '/admin/leads',
    },
    {
      label: 'Agentes',
      value: metrics.agents,
      icon: UserCircle,
      href: '/admin/agents',
    },
  ]

  const quickActions = [
    {
      label: 'Nueva Propiedad',
      href: '/admin/listings/new',
      primary: true,
    },
    {
      label: 'Ver Propiedades',
      href: '/admin/listings',
      primary: false,
    },
    {
      label: 'Ver Leads',
      href: '/admin/leads',
      primary: false,
    },
    {
      label: 'Ver Agentes',
      href: '/admin/agents',
      primary: false,
    },
  ]

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Panel de administración DR Housing</p>
        <p className="text-xs text-muted-foreground mt-1 capitalize">{formattedDate}</p>
      </div>

      {/* Metric cards — 2×2 grid */}
      <div className="grid grid-cols-2 gap-6 mb-10">
        {cards.map((card) => (
          <Link
            key={`${card.href}-${card.label}`}
            href={card.href}
            className="bg-card border border-border rounded-xl p-6 flex items-center gap-4 hover:shadow-md transition-shadow group"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <card.icon className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="font-serif text-3xl font-semibold leading-tight">{card.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="card-elevated p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="font-serif text-lg font-semibold">Acciones rápidas</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href + action.label}
              href={action.href}
              className={
                action.primary
                  ? 'text-center py-3 px-4 rounded text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'
                  : 'text-center py-3 px-4 rounded border border-border text-sm hover:bg-secondary transition-colors'
              }
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
