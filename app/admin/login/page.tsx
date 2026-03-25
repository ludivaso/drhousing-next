'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  // If already logged in, go straight to dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.replace('/admin')
      } else {
        setChecking(false)
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message)
      setIsSubmitting(false)
    } else {
      router.replace('/admin')
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-serif font-bold text-2xl">DR</span>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">Admin — DR Housing</h1>
          <p className="text-muted-foreground mt-2">Acceso restringido a personal autorizado</p>
        </div>
        <div className="card-elevated p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-1 block">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@drhousing.net"
                  className="w-full pl-10 pr-4 py-2.5 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Iniciando sesión...</>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-6">
          <a href="/" className="hover:text-foreground transition-colors">← Volver al sitio</a>
        </p>
      </div>
    </div>
  )
}
