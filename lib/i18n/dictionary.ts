import en from '@/messages/en.json'
import es from '@/messages/es.json'

export type Lang = 'en' | 'es'

/**
 * Minimal dot-path dictionary lookup for Server Components, which can't use
 * the client-side I18nProvider/useI18n() context. Falls back to the raw key
 * if it isn't found — never throws, never mixes languages.
 */
export function t(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  const msgs: Record<string, unknown> = lang === 'en' ? (en as unknown as Record<string, unknown>) : (es as unknown as Record<string, unknown>)
  const parts = key.split('.')
  let cur: unknown = msgs
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return key
    cur = (cur as Record<string, unknown>)[part]
  }
  let str = typeof cur === 'string' ? cur : key
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v))
    })
  }
  return str
}
