'use client'

import { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'
import type { PropertyRow, CuratedListRow } from '@/src/integrations/supabase/types'
import PropertyCard from './PropertyCard'
import PropertyDetailPanel from './PropertyDetailPanel'
import LangToggle from './LangToggle'

export default function CuratedPortfolioClient({
  list,
  properties,
}: {
  list: CuratedListRow
  properties: PropertyRow[]
}) {
  const { lang, setLang } = useI18n()
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    properties[0]?.id ?? null
  )
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const selectedProperty = properties.find(p => p.id === selectedPropertyId) ?? null

  // Keyboard: left/right switches between properties (photo arrows handle their own clicks)
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (lightboxOpen) return
      const currentIndex = properties.findIndex(p => p.id === selectedPropertyId)
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setSelectedPropertyId(properties[currentIndex - 1].id)
      }
      if (e.key === 'ArrowRight' && currentIndex < properties.length - 1) {
        setSelectedPropertyId(properties[currentIndex + 1].id)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [properties, selectedPropertyId, lightboxOpen])

  const waMessage = encodeURIComponent(
    lang === 'en'
      ? `Hello, I'm interested in the property selection prepared for ${list.client_name}. Could you give me more information?`
      : `Hola, me interesa la selección de propiedades preparada para ${list.client_name}. ¿Puede darme más información?`
  )

  return (
    <>
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-20">
        <div className="container-wide h-16 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium truncate">
              {lang === 'en' ? 'Private Property Selection' : 'Selección Privada de Propiedades'}
            </p>
            {list.client_name && (
              <p className="font-serif text-lg font-semibold text-foreground truncate">
                {lang === 'en' ? `For: ${list.client_name}` : `Para: ${list.client_name}`}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <LangToggle value={lang} onChange={setLang} />
            <a
              href={`https://wa.me/50686540888?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-[#25D366] text-white text-sm font-medium hover:bg-[#25D366]/90 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      {/* Optional advisor message */}
      {list.message && (
        <div className="bg-secondary/50 border-b border-border py-3">
          <div className="container-wide">
            <p className="text-muted-foreground text-sm italic">{list.message}</p>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="container-wide py-6">
        <p className="text-muted-foreground text-sm mb-4">
          {properties.length}{' '}
          {lang === 'es' ? 'propiedades' : 'properties'}
        </p>

        {properties.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            {lang === 'es'
              ? 'Diego está terminando de curar tu selección'
              : 'Diego is still curating your selection'}
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Property list — horizontal scroll on mobile, vertical on desktop */}
            <div
              className="flex lg:flex-col gap-3
                         overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto
                         lg:w-72 xl:w-80 lg:flex-shrink-0
                         lg:max-h-[calc(100vh-10rem)]
                         pb-2 lg:pb-0 lg:pr-1"
            >
              {properties.map((p, i) => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  lang={lang}
                  isSelected={p.id === selectedPropertyId}
                  index={i}
                  onClick={() => setSelectedPropertyId(p.id)}
                />
              ))}
            </div>

            {/* Detail panel */}
            <div className="flex-1 min-w-0">
              {selectedProperty ? (
                <PropertyDetailPanel
                  property={selectedProperty}
                  lang={lang}
                  lightboxOpen={lightboxOpen}
                  onLightboxChange={setLightboxOpen}
                  onClose={() => setSelectedPropertyId(null)}
                />
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                  {lang === 'es'
                    ? '← Toca una propiedad para ver los detalles'
                    : '← Tap a property to see details'}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#2C2C2C] text-white/80 py-8 mt-8">
        <div className="container-wide flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>
            {lang === 'en'
              ? 'Questions about any property? Contact your advisor.'
              : '¿Preguntas sobre alguna propiedad? Comuníquese con su asesor.'}
          </p>
          <a
            href={`https://wa.me/50686540888?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-[#C9A96E] text-[#1A1A1A] font-medium hover:bg-[#C9A96E]/90 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            {lang === 'en' ? 'Contact via WhatsApp' : 'Contactar por WhatsApp'}
          </a>
        </div>
      </footer>
    </>
  )
}
