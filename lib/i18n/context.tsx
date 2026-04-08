'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import en from '@/messages/en.json'
import es from '@/messages/es.json'

type Lang = 'es' | 'en'
type Translations = typeof es

interface I18nContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const messages: Record<Lang, Translations> = { es, en }

function resolve(obj: Record<string, unknown>, key: string): string {
  const parts = key.split('.')
  let cur: unknown = obj
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return key
    cur = (cur as Record<string, unknown>)[part]
  }
  return typeof cur === 'string' ? cur : key
}

const I18nContext = createContext<I18nContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (k) => k,
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    // Primary: read from URL path — this is the source of truth
    const detectFromPath = (): Lang => {
      const path = window.location.pathname
      if (path.startsWith('/es')) return 'es'
      if (path.startsWith('/en')) return 'en'
      return null as unknown as Lang
    }

    const pathLang = detectFromPath()
    if (pathLang) {
      setLangState(pathLang)
      return
    }

    // Fallback: cookie then localStorage
    const cookieLang = document.cookie
      .split('; ')
      .find((r) => r.startsWith('lang='))
      ?.split('=')[1] as Lang | undefined
    const stored = cookieLang ?? (localStorage.getItem('drhousing_lang') as Lang | null)
    if (stored === 'en' || stored === 'es') {
      setLangState(stored)
    } else {
      // First visit — detect from browser language
      const nav = navigator.language ?? ''
      const detected: Lang = nav.startsWith('en') ? 'en' : nav.startsWith('es') ? 'es' : 'en'
      setLangState(detected)
    }
  }, [])

  // Keep lang in sync when user navigates (popstate = back/forward)
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname
      const detected: Lang = path.startsWith('/es') ? 'es' : 'en'
      setLangState(detected)
    }
    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    document.documentElement.lang = l
  }, [])

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      let str = resolve(messages[lang] as unknown as Record<string, unknown>, key)
      if (str === key) str = resolve(messages['es'] as unknown as Record<string, unknown>, key)
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          str = str.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v))
        })
      }
      return str
    },
    [lang]
  )

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
