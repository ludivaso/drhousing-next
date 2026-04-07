'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Home,
  Users,
  UserCircle,
  LogOut,
  Menu,
  X,
  Loader2,
  KanbanSquare,
  Bookmark,
  Ticket,
  Settings2,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const adminNav = [
  { name: 'Dashboard',    href: '/admin',                icon: LayoutDashboard },
  { name: 'Propiedades',  href: '/admin/listings',       icon: Home },
  { name: 'Leads',        href: '/admin/leads',          icon: Users },
  { name: 'Pipeline CRM', href: '/admin/leads/pipeline', icon: KanbanSquare },
  { name: 'Curated',      href: '/admin/curated',        icon: Bookmark },
  { name: 'Tickets',      href: '/admin/tickets',        icon: Ticket },
  { name: 'Agentes',      href: '/admin/agents',         icon: UserCircle },
  { name: 'Homepage',     href: '/admin/settings/homepage', icon: Settings2 },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
      if (!session?.user && pathname !== '/admin/login') {
        router.replace('/admin/login')
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) router.replace('/admin/login')
    })

    return () => subscription.unsubscribe()
  }, [pathname, router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.replace('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // Login page renders without the admin shell
  if (!user) return <>{children}</>


  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-forest-dark text-primary-foreground transform transition-transform lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-primary/80 flex items-center justify-center">
                <span className="text-primary-foreground font-serif font-bold text-sm">DR</span>
              </div>
              <span className="font-serif font-semibold">Admin</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-primary-foreground/70 hover:text-primary-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {adminNav.map((item) => {
              const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active
                      ? 'bg-white/20 text-white'
                      : 'text-primary-foreground/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-white/10 space-y-2">
            <div className="px-3 py-2 text-xs text-primary-foreground/50 truncate">{user.email}</div>
            <Link
              href="https://drhousing-next.vercel.app"
              target="_blank"
              className="flex items-center gap-2 px-3 py-2 rounded text-sm text-primary-foreground/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Home className="w-4 h-4" /> Ver sitio ↗
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-primary-foreground/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-card flex items-center px-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-muted-foreground hover:text-foreground">
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-4 font-serif font-semibold">DR Housing Admin</span>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
