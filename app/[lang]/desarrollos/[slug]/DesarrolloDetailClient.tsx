'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, CheckCircle, ArrowLeft, MessageCircle, TrendingUp } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'
import type { Development } from '../data'

const NEIGHBORHOOD_COORDS: Record<string, [number, number]> = {
  'Escazú':             [9.9188, -84.1386],
  'Santa Ana':          [9.9281, -84.1836],
  'Lindora':            [9.9500, -84.1500],
  'La Guácima':         [9.9667, -84.2167],
  'Ciudad Colón':       [9.9033, -84.2600],
  'Hacienda Los Reyes': [9.9550, -84.2000],
}

export default function DesarrolloDetailClient({
  development: dev,
}: {
  development: Development
}) {
  const { lang } = useI18n()

  const name = lang === 'en' ? dev.nameEn : dev.name
  const status = lang === 'en' ? dev.statusEn : dev.status
  const type = lang === 'en' ? dev.typeEn : dev.type
  const units = lang === 'en' ? dev.unitsEn : dev.units
  const description = lang === 'en' ? dev.descriptionEn : dev.description
  const features = lang === 'en' ? dev.featuresEn : dev.features
  const plusvalia = lang === 'en' ? dev.plusvaliaEn : dev.plusvalia

  // Map coordinates: use stored lat/lng or neighborhood fallback
  let mapLat = dev.lat
  let mapLng = dev.lng
  if (!mapLat || !mapLng) {
    for (const [key, coords] of Object.entries(NEIGHBORHOOD_COORDS)) {
      if (dev.location.toLowerCase().includes(key.toLowerCase())) {
        ;[mapLat, mapLng] = coords
        break
      }
    }
  }
  const mapSrc = mapLat && mapLng
    ? `https://maps.google.com/maps?q=${mapLat},${mapLng}&t=m&z=14&output=embed&hl=${lang}`
    : null

  const waMessage = encodeURIComponent(
    lang === 'en'
      ? `Hello, I'm interested in the ${name} project in ${dev.location}. Could you send me more information about available units and pre-sale pricing?`
      : `Hola, me interesa el proyecto ${name} en ${dev.location}. ¿Puede enviarme más información sobre unidades disponibles y precios de preventa?`
  )

  return (
    <>
      {/* Hero image */}
      <section className="relative h-72 sm:h-96 overflow-hidden bg-forest-dark">
        <Image
          src={dev.image}
          alt={name}
          fill
          className="object-cover opacity-70"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container-wide">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className={`text-xs font-medium px-3 py-1 rounded-full border ${dev.statusColor}`}>
                {status}
              </span>
              <span className="text-white/70 text-sm flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />{dev.location}
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-white">{name}</h1>
            <p className="text-white/70 mt-2 text-sm">{type} · {units} · {lang === 'en' ? 'Delivery' : 'Entrega'} {dev.completion}</p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-wide">
          {/* Back */}
          <Link
            href={`/${lang}/desarrollos`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === 'en' ? 'All Developments' : 'Todos los Desarrollos'}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-10">
              {/* Description */}
              <div>
                <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
                  {lang === 'en' ? 'About this Project' : 'Sobre este Proyecto'}
                </h2>
                <p className="text-muted-foreground leading-relaxed">{description}</p>
              </div>

              {/* Features */}
              <div>
                <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
                  {lang === 'en' ? 'Features & Specifications' : 'Características y Especificaciones'}
                </h2>
                <ul className="space-y-3">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Investment perspective */}
              {plusvalia && (
                <div className="border-l-4 border-gold bg-secondary/50 rounded-r-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="w-5 h-5 text-gold" />
                    <h3 className="font-serif text-lg font-semibold text-foreground">
                      {lang === 'en' ? 'Investment Perspective' : 'Perspectiva de Inversión'}
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-sm">{plusvalia}</p>
                </div>
              )}

              {/* Map */}
              {mapSrc && (
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
                    {lang === 'en' ? 'Location' : 'Ubicación'}
                  </h2>
                  <div className="rounded-lg overflow-hidden border border-border h-64">
                    <iframe
                      title={name}
                      src={mapSrc}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price card */}
              <div className="card-elevated p-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  {lang === 'en' ? 'Starting from' : 'Precio desde'}
                </p>
                <p className="font-serif text-3xl font-semibold text-foreground mb-1">
                  ${dev.priceFrom.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mb-6">USD</p>

                <a
                  href={`https://wa.me/50686540888?text=${waMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded bg-[#25D366] text-white text-sm font-medium hover:bg-[#25D366]/90 transition-colors mb-3"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
                <Link
                  href={`/${lang}/contact`}
                  className="flex items-center justify-center w-full py-3 rounded border border-border text-foreground text-sm font-medium hover:bg-secondary transition-colors"
                >
                  {lang === 'en' ? 'Contact Form' : 'Formulario de Contacto'}
                </Link>
              </div>

              {/* Quick facts */}
              <div className="card-elevated p-6 space-y-3 text-sm">
                <h3 className="font-medium text-foreground mb-2">
                  {lang === 'en' ? 'Quick Facts' : 'Datos Rápidos'}
                </h3>
                {[
                  { label: lang === 'en' ? 'Status' : 'Estado', value: status },
                  { label: lang === 'en' ? 'Type' : 'Tipo', value: type },
                  { label: lang === 'en' ? 'Units' : 'Unidades', value: units },
                  { label: lang === 'en' ? 'Delivery' : 'Entrega', value: dev.completion },
                  { label: lang === 'en' ? 'Location' : 'Ubicación', value: dev.location },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-medium text-foreground">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
