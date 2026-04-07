'use client'

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '@/messages/en.json'
import es from '@/messages/es.json'

// Read persisted language from cookie then localStorage (browser-only)
function getInitialLang(): 'en' | 'es' {
  if (typeof window === 'undefined') return 'en'
  const cookieLang = document.cookie
    .split('; ')
    .find((r) => r.startsWith('lang='))
    ?.split('=')[1]
  const stored = cookieLang ?? localStorage.getItem('drhousing_lang')
  return stored === 'es' ? 'es' : 'en'
}

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      lng: getInitialLang(),
      fallbackLng: 'en',
      resources: {
        en: { translation: en as Record<string, unknown> },
        es: { translation: es as Record<string, unknown> },
      },
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    })
}

export default i18n
