'use client'

import { useState, useTransition } from 'react'
import { Eye, EyeOff, Lock, KeyRound, Check, Loader2 } from 'lucide-react'
import type { ManagedRoute } from '@/lib/visibility/routes'
import { setRouteStatus, setPreviewPin, clearPreviewPin } from './actions'

interface Props {
  routes: ManagedRoute[]
  statusByPath: Record<string, 'public' | 'private'>
  pinConfigured: boolean
}

export default function VisibilityClient({ routes, statusByPath, pinConfigured }: Props) {
  const [optimistic, setOptimistic] = useState(statusByPath)
  const [pending, startTransition] = useTransition()
  const [pendingPath, setPendingPath] = useState<string | null>(null)
  const [pinInput, setPinInput] = useState('')
  const [pinMsg, setPinMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [savingPin, setSavingPin] = useState(false)

  const grouped = routes.reduce<Record<string, ManagedRoute[]>>((acc, r) => {
    (acc[r.group] ||= []).push(r)
    return acc
  }, {})

  const toggle = (path: string, next: 'public' | 'private') => {
    if (next === 'private' && !pinConfigured) {
      setPinMsg({ kind: 'err', text: 'Set a preview PIN below before marking pages private.' })
      return
    }
    setPendingPath(path)
    setOptimistic(prev => ({ ...prev, [path]: next }))
    startTransition(async () => {
      const result = await setRouteStatus(path, next)
      if (!result.ok) {
        setOptimistic(prev => ({ ...prev, [path]: next === 'private' ? 'public' : 'private' }))
        setPinMsg({ kind: 'err', text: result.error })
      }
      setPendingPath(null)
    })
  }

  const savePin = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingPin(true)
    setPinMsg(null)
    const result = await setPreviewPin(pinInput)
    setSavingPin(false)
    if (result.ok) {
      setPinInput('')
      setPinMsg({ kind: 'ok', text: 'PIN saved. Existing preview sessions were signed out.' })
    } else {
      setPinMsg({ kind: 'err', text: result.error })
    }
  }

  const removePin = async () => {
    if (!confirm('Remove the preview PIN? Any pages marked private will become inaccessible.')) return
    setSavingPin(true)
    const result = await clearPreviewPin()
    setSavingPin(false)
    if (result.ok) {
      setPinMsg({ kind: 'ok', text: 'PIN removed.' })
    } else {
      setPinMsg({ kind: 'err', text: result.error })
    }
  }

  return (
    <div className="space-y-10 max-w-3xl">
      {/* ── PIN ─────────────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <KeyRound className="w-4 h-4 text-[#6B6B6B]" />
          <h2 className="font-serif text-lg text-foreground">Preview PIN</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Required before marking any page private. Share this PIN with anyone who needs preview access — rotate it to revoke.
        </p>

        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                pinConfigured ? 'bg-[#C9A96E]' : 'bg-[#E8E3DC]'
              }`}
            />
            <span className="text-sm text-foreground">
              {pinConfigured ? 'PIN is configured' : 'No PIN set'}
            </span>
          </div>

          <form onSubmit={savePin} className="flex flex-col sm:flex-row gap-2">
            <input
              type="password"
              value={pinInput}
              onChange={e => setPinInput(e.target.value)}
              placeholder={pinConfigured ? 'Enter a new PIN to rotate' : 'Choose a PIN (min 4 chars)'}
              minLength={4}
              required
              autoComplete="off"
              className="flex-1 px-4 py-2 rounded border border-border bg-background text-sm focus:outline-none focus:border-[#C9A96E]"
            />
            <button
              type="submit"
              disabled={savingPin || pinInput.length < 4}
              className="px-4 py-2 rounded bg-[#C9A96E] text-[#1A1A1A] text-sm font-medium hover:bg-[#b89656] disabled:opacity-50 transition-colors"
            >
              {savingPin ? <Loader2 className="w-4 h-4 animate-spin" /> : pinConfigured ? 'Rotate PIN' : 'Set PIN'}
            </button>
            {pinConfigured && (
              <button
                type="button"
                onClick={removePin}
                disabled={savingPin}
                className="px-4 py-2 rounded border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                Remove
              </button>
            )}
          </form>

          {pinMsg && (
            <p
              className={`mt-3 text-sm ${
                pinMsg.kind === 'ok' ? 'text-[#1A1A1A]' : 'text-destructive'
              }`}
            >
              {pinMsg.text}
            </p>
          )}
        </div>
      </section>

      {/* ── Routes ──────────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-[#6B6B6B]" />
          <h2 className="font-serif text-lg text-foreground">Pages</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Toggle individual pages between public and private. Private pages require the PIN above.
        </p>

        <div className="space-y-8">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <h3 className="text-xs tracking-widest uppercase text-muted-foreground mb-3">{group}</h3>
              <div className="bg-card border border-border rounded-lg divide-y divide-border">
                {items.map(route => {
                  const status = optimistic[route.path] ?? 'public'
                  const isPrivate = status === 'private'
                  const isPendingThis = pending && pendingPath === route.path
                  return (
                    <div key={route.path} className="flex items-center justify-between p-4 gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-foreground truncate">{route.label}</span>
                          {isPrivate ? (
                            <span className="inline-flex items-center gap-1 text-[10px] tracking-wide uppercase px-2 py-0.5 rounded-full bg-[#1A1A1A] text-white">
                              <EyeOff className="w-3 h-3" /> Private
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] tracking-wide uppercase px-2 py-0.5 rounded-full bg-[#E8E3DC] text-[#1A1A1A]">
                              <Eye className="w-3 h-3" /> Public
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 font-mono">{route.path}</div>
                        {route.description && (
                          <div className="text-xs text-muted-foreground mt-1">{route.description}</div>
                        )}
                      </div>

                      <button
                        onClick={() => toggle(route.path, isPrivate ? 'public' : 'private')}
                        disabled={isPendingThis}
                        className={`shrink-0 relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${
                          isPrivate ? 'bg-[#1A1A1A]' : 'bg-[#E8E3DC]'
                        } ${isPendingThis ? 'opacity-60' : ''}`}
                        aria-label={isPrivate ? 'Make public' : 'Make private'}
                      >
                        <span
                          className={`inline-block w-4 h-4 rounded-full bg-white transition-transform ${
                            isPrivate ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                        {isPendingThis && (
                          <Loader2 className="absolute -right-6 w-3.5 h-3.5 animate-spin text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="text-xs text-muted-foreground">
        <p className="flex items-start gap-2">
          <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          Visitors without the PIN are redirected to a preview gate. Authenticated admins bypass it automatically.
        </p>
      </section>
    </div>
  )
}
