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
  lang: 'es',
  setLang: () => {},
  t: (k) => k,
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('es')

  useEffect(() => {
    const stored = localStorage.getItem('drhousing_lang') as Lang | null
    if (stored === 'en' || stored === 'es') setLangState(stored)
  }, [])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    localStorage.setItem('drhousing_lang', l)
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
