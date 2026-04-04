'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Lock, Loader2, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import PropertyCard from '@/components/PropertyCard'
import type { PropertyRow } from '@/lib/supabase/queries'

type CuratedList = {
  id: string
  slug: string
  title: string
  client_name: string | null
  message: string | null
  language: string
  property_ids: string[]
}

const MAX_ATTEMPTS = 5

export default function PrivateCuratedPage() {
  const { slug } = useParams<{ slug: string }>()
  const [listMeta, setListMeta] = useState<CuratedList | null>(null)
  const [pin, setPin] = useState(['', '', '', ''])
  const [error, setError] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const [properties, setProperties] = useState<PropertyRow[]>([])
  const [loadingProps, setLoadingProps] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Fetch list metadata (no PIN required — just title/client name)
  useEffect(() => {
    supabase
      .from('curated_lists')
      .select('id, slug, title, client_name, message, language, property_ids')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setListMeta(data as CuratedList)
      })

    // Check if already verified in sessionStorage
    const stored = sessionStorage.getItem(`curated-pin-${slug}`)
    if (stored === 'verified') {
      setVerified(true)
    }

    // Check lockout
    const lockKey = `curated-lock-${slug}`
    const lockUntil = sessionStorage.getItem(lockKey)
    if (lockUntil && Date.now() < parseInt(lockUntil)) {
      setLocked(true)
    }
  }, [slug])

  // Load properties once verified
  useEffect(() => {
    if (!verified || !listMeta) return
    setLoadingProps(true)
    const ids = listMeta.property_ids ?? []
    if (!ids.length) { setLoadingProps(false); return }
    supabase
      .from('properties')
      .select('*')
      .in('id', ids)
      .then(({ data }) => {
        const map = new Map((data ?? []).map((p) => [p.id, p]))
        setProperties(ids.map((id) => map.get(id)).filter(Boolean) as PropertyRow[])
        setLoadingProps(false)
      })
  }, [verified, listMeta])

  const handlePinChange = (idx: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...pin]
    next[idx] = digit
    setPin(next)
    setError(null)
    if (digit && idx < 3) {
      inputRefs.current[idx + 1]?.focus()
    }
    if (idx === 3 && digit) {
      // Auto-submit when last digit entered
      setTimeout(() => verifyPin(next.join('')), 50)
    }
  }

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
  }

  const verifyPin = async (code: string) => {
    if (code.length < 4 || locked) return
    setVerifying(true)

    try {
      const { data, error: fnError } = await supabase.functions.invoke('verify-curated-pin', {
        body: { slug, pin: code },
      })

      if (fnError || !data?.valid) {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        setPin(['', '', '', ''])
        inputRefs.current[0]?.focus()

        if (newAttempts >= MAX_ATTEMPTS) {
          setLocked(true)
          const lockUntil = Date.now() + 15 * 60 * 1000 // 15 min
          sessionStorage.setItem(`curated-lock-${slug}`, String(lockUntil))
          setError('Demasiados intentos. Acceso bloqueado por 15 minutos.')
        } else {
          setError(`PIN incorrecto. ${MAX_ATTEMPTS - newAttempts} intento(s) restante(s).`)
        }
      } else {
        sessionStorage.setItem(`curated-pin-${slug}`, 'verified')
        setVerified(true)
      }
    } catch {
      setError('Error al verificar. Intente de nuevo.')
    } finally {
      setVerifying(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    verifyPin(pin.join(''))
  }

  // ── Verified view ─────────────────────────────────────────────────────────
  if (verified && listMeta) {
    const lang = (listMeta.language ?? 'es') as 'es' | 'en'
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
            <Link href="/">
              <Image src="/logo.png" alt="DR Housing" width={40} height={40} className="h-10 w-auto" />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-lg font-semibold text-foreground truncate">
                {listMeta.client_name
                  ? (lang === 'en' ? `${listMeta.client_name}'s Portfolio` : `Portafolio para ${listMeta.client_name}`)
                  : listMeta.title}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" />
                <span>{lang === 'en' ? 'Private selection' : 'Selección privada'}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {listMeta.message && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-8">
              <p className="text-sm text-foreground leading-relaxed italic">"{listMeta.message}"</p>
            </div>
          )}

          {loadingProps ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : properties.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">
              {lang === 'en' ? 'No properties in this list.' : 'Sin propiedades en esta lista.'}
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                {lang === 'en'
                  ? `${properties.length} properties selected for you`
                  : `${properties.length} propiedades seleccionadas para usted`}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((p) => (
                  <PropertyCard key={p.id} property={p} lang={lang} />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    )
  }

  // ── PIN gate ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <Link href="/" className="mb-8">
        <Image src="/logo.png" alt="DR Housing" width={72} height={72} className="h-18 w-auto" />
      </Link>

      <div className="w-full max-w-sm">
        <div className="card-elevated p-8 text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6 text-primary" />
          </div>

          <div>
            <h1 className="font-serif text-xl font-semibold text-foreground">Acceso Privado</h1>
            {listMeta?.client_name && (
              <p className="text-sm text-muted-foreground mt-1">
                Portafolio para <span className="font-medium text-foreground">{listMeta.client_name}</span>
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              Ingrese el PIN de 4 dígitos para ver esta selección.
            </p>
          </div>

          {locked ? (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Acceso bloqueado temporalmente por múltiples intentos fallidos.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-center gap-3">
                {pin.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    disabled={verifying}
                    className="w-12 h-14 text-center text-xl font-bold border-2 border-input rounded-lg bg-background focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={pin.join('').length < 4 || verifying}
                className="w-full py-2.5 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
              >
                {verifying ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</>
                ) : (
                  'Acceder'
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          ¿Necesita acceso? Contacte a{' '}
          <a href="https://wa.me/50660775000" className="text-primary hover:underline">DR Housing</a>
        </p>
      </div>
    </div>
  )
}
