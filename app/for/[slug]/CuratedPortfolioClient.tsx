'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Bed, Bath, Maximize, MessageCircle } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'
import { formatPrice, getHeroImage } from '@/lib/supabase/queries'
import type { PropertyRow, CuratedListRow } from '@/src/integrations/supabase/types'

// Status badge labels — bilingual
const STATUS_LABELS: Record<string, { es: string; en: string; cls: string }> = {
  for_sale:       { es: 'En Venta',    en: 'For Sale',   cls: 'bg-gold/20 text-foreground border border-gold/40' },
  for_rent:       { es: 'En Alquiler', en: 'For Rent',   cls: 'bg-primary/10 text-primary border border-primary/20' },
  presale:        { es: 'Preventa',    en: 'Pre-Sale',   cls: 'bg-amber-100 text-amber-800 border border-amber-200' },
  under_contract: { es: 'En Proceso',  en: 'Under Contract', cls: 'bg-blue-100 text-blue-800 border border-blue-200' },
  sold:           { es: 'Vendido',     en: 'Sold',       cls: 'bg-gray-100 text-gray-600 border border-gray-200' },
  rented:         { es: 'Alquilado',   en: 'Rented',     cls: 'bg-gray-100 text-gray-600 border border-gray-200' },
}

function PropertyCard({ property, lang }: { property: PropertyRow; lang: string }) {
  const image = getHeroImage(property)
  const title = lang === 'en' && property.title_en ? property.title_en : property.title
  const price = property.price_sale ?? property.price_rent_monthly
  const status = STATUS_LABELS[property.status] ?? { es: property.status, en: property.status, cls: 'bg-muted text-muted-foreground' }
  const isRent = property.status === 'for_rent'

  return (
    <Link
      href={`/property/${property.reference_id || property.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block card-elevated overflow-hidden hover:shadow-xl transition-shadow"
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-secondary">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary">
            <span className="text-muted-foreground text-sm">Sin imagen</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.cls}`}>
            {lang === 'en' ? status.en : status.es}
          </span>
        </div>
        {price && (
          <div className="absolute bottom-3 right-3 bg-foreground/80 text-background px-3 py-1.5 rounded text-sm font-semibold backdrop-blur-sm">
            {formatPrice(price, property.currency)}
            {isRent && <span className="text-xs font-normal opacity-80">{lang === 'en' ? '/mo' : '/mes'}</span>}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{property.location_name}</p>
        <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-3">
          {title}
        </h3>

        {/* Specs strip */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 flex-shrink-0" />
              {property.bedrooms}
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 flex-shrink-0" />
              {property.bathrooms}
            </span>
          )}
          {property.construction_size_sqm && (
            <span className="flex items-center gap-1.5">
              <Maximize className="w-4 h-4 flex-shrink-0" />
              {property.construction_size_sqm} m²
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function CuratedPortfolioClient({
  list,
  properties,
}: {
  list: CuratedListRow
  properties: PropertyRow[]
}) {
  const { lang } = useI18n()

  const waMessage = encodeURIComponent(
    lang === 'en'
      ? `Hello, I'm interested in the property selection prepared for ${list.client_name}. Could you give me more information?`
      : `Hola, me interesa la selección de propiedades preparada para ${list.client_name}. ¿Puede darme más información?`
  )

  return (
    <>
      {/* noindex handled by metadata export in page.tsx — robots.ts also covers /for/* */}

      {/* Minimal unbranded header */}
      <header className="border-b border-border bg-card">
        <div className="container-wide h-16 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
              {lang === 'en' ? 'Private Property Selection' : 'Selección Privada de Propiedades'}
            </p>
            {list.client_name && (
              <p className="font-serif text-lg font-semibold text-foreground">
                {lang === 'en' ? `For: ${list.client_name}` : `Para: ${list.client_name}`}
              </p>
            )}
          </div>
          <a
            href={`https://wa.me/50686540888?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-[#25D366] text-white text-sm font-medium hover:bg-[#25D366]/90 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
        </div>
      </header>

      {/* Optional message from advisor */}
      {list.message && (
        <div className="bg-secondary/50 border-b border-border py-4">
          <div className="container-wide">
            <p className="text-muted-foreground text-sm italic">{list.message}</p>
          </div>
        </div>
      )}

      {/* Property grid */}
      <main className="section-padding bg-background">
        <div className="container-wide">
          <p className="text-muted-foreground text-sm mb-8">
            {properties.length}{' '}
            {lang === 'en'
              ? `propert${properties.length === 1 ? 'y' : 'ies'} selected for you`
              : `propiedad${properties.length === 1 ? '' : 'es'} seleccionadas para usted`}
          </p>

          {properties.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              {lang === 'en' ? 'No properties in this selection.' : 'No hay propiedades en esta selección.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p) => (
                <PropertyCard key={p.id} property={p} lang={lang} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer CTA */}
      <footer className="bg-[#2C2C2C] text-white/80 py-8">
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-gold text-[#1A1A1A] font-medium hover:bg-gold/90 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            {lang === 'en' ? 'Contact via WhatsApp' : 'Contactar por WhatsApp'}
          </a>
        </div>
      </footer>
    </>
  )
}
