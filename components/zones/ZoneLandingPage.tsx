import Link from 'next/link'
import { MapPin, Home, Building2, TrendingUp, MessageCircle, ChevronRight } from 'lucide-react'
import PropertyCard from '@/components/PropertyCard'
import type { PropertyRow } from '@/lib/supabase/queries'
import type { ZoneConfig } from '@/config/zones'
import { ZONE_SLUGS, ZONE_CONFIG } from '@/config/zones'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  zone: ZoneConfig
  properties: PropertyRow[]
  mode: 'rent' | 'sale'
  lang: 'es' | 'en'
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const WA_NUMBER = '50686540888'

function waLink(message: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`
}

function otherZones(currentSlug: string): ZoneConfig[] {
  return ZONE_SLUGS.filter(s => s !== currentSlug).map(s => ZONE_CONFIG[s])
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ZoneLandingPage({ zone, properties, mode, lang }: Props) {
  const isEs = lang === 'es'
  const isSale = mode === 'sale'

  const pageTitle = isEs
    ? `${isSale ? 'Propiedades en Venta' : 'Alquiler de Propiedades'} en ${zone.nameEs}`
    : `Properties for ${isSale ? 'Sale' : 'Rent'} in ${zone.nameEn}`

  const pageSubtitle = isEs
    ? zone.descriptionEs
    : zone.descriptionEn

  const modeLabel  = isEs ? (isSale ? 'en venta' : 'en alquiler') : (isSale ? 'for sale' : 'for rent')
  const countLabel = isEs
    ? `${properties.length} propiedad${properties.length !== 1 ? 'es' : ''} ${modeLabel}`
    : `${properties.length} propert${properties.length !== 1 ? 'ies' : 'y'} ${modeLabel}`

  const whyTitle  = isEs ? `¿Por Qué Vivir en ${zone.nameEs}?` : `Why Live in ${zone.nameEn}?`
  const whyPoints = isEs ? zone.whyLiveEs : zone.whyLiveEn

  const ctaText = isEs
    ? `Quiero ver propiedades ${modeLabel} en ${zone.nameEs}`
    : `I'd like to see properties ${modeLabel} in ${zone.nameEn}`

  const ctaButton = isEs ? 'Consultar por WhatsApp' : 'Ask on WhatsApp'

  const noResultsText = isEs
    ? `No encontramos propiedades ${modeLabel} en ${zone.nameEs} en este momento. Contáctanos — podemos ayudarte a encontrar lo que buscas.`
    : `No properties ${modeLabel} in ${zone.nameEn} at the moment. Contact us — we can help you find exactly what you're looking for.`

  const otherZonesTitle = isEs ? 'Explorar Otras Zonas' : 'Explore Other Zones'
  const otherZonesList  = otherZones(zone.slug)

  // Route prefix per lang + mode
  const modePrefix = isEs
    ? (isSale ? 'venta' : 'alquiler')
    : (isSale ? 'for-sale' : 'rentals')
  const propertiesRoute = isEs ? 'properties' : 'properties'

  return (
    <main className="min-h-screen bg-background">

      {/* ── Hero / Page Header ─────────────────────────────────────────────── */}
      <section className="border-b border-[#E8E3DC] bg-[#FAFAF8]">
        <div className="container-wide py-10 md:py-14">

          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5 font-sans">
            <Link href={`/${lang}`} className="hover:text-foreground transition-colors">
              {isEs ? 'Inicio' : 'Home'}
            </Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <Link href={`/${lang}/properties`} className="hover:text-foreground transition-colors">
              {isEs ? 'Propiedades' : 'Properties'}
            </Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="text-foreground font-medium">{isEs ? zone.nameEs : zone.nameEn}</span>
          </nav>

          {/* Title */}
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium text-foreground leading-tight mb-4">
            {pageTitle}
          </h1>

          <p className="font-sans text-base text-muted-foreground max-w-2xl leading-relaxed mb-6">
            {pageSubtitle}
          </p>

          {/* Stat pill */}
          <div className="inline-flex items-center gap-2 bg-white border border-[#E8E3DC] rounded-full px-4 py-2 text-sm font-sans text-foreground shadow-sm">
            <MapPin className="w-4 h-4 text-[#C9A96E] shrink-0" />
            {countLabel}
          </div>
        </div>
      </section>

      {/* ── Property Grid ──────────────────────────────────────────────────── */}
      <section className="container-wide py-10 md:py-14">
        {properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(p => (
              <PropertyCard key={p.id} property={p} lang={lang} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <Home className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <p className="font-sans text-base text-muted-foreground max-w-md mx-auto leading-relaxed mb-6">
              {noResultsText}
            </p>
            <a
              href={waLink(ctaText)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-sans font-medium text-sm px-5 py-3 rounded-full transition-colors"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              {ctaButton}
            </a>
          </div>
        )}
      </section>

      {/* ── Why Live Here ──────────────────────────────────────────────────── */}
      {whyPoints.length > 0 && (
        <section className="bg-[#FAFAF8] border-t border-[#E8E3DC]">
          <div className="container-wide py-10 md:py-14">
            <div className="grid md:grid-cols-2 gap-8 items-start">

              {/* Left: heading + bullets */}
              <div>
                <p className="font-sans text-xs uppercase tracking-widest text-[#C9A96E] mb-3">
                  {isEs ? 'Estilo de Vida' : 'Lifestyle'}
                </p>
                <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground mb-6 leading-tight">
                  {whyTitle}
                </h2>
                <ul className="space-y-3">
                  {whyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-3 font-sans text-sm text-[#3D3D3D] leading-snug">
                      <TrendingUp className="w-4 h-4 text-[#C9A96E] mt-0.5 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: WhatsApp CTA card */}
              <div className="bg-white border border-[#EDE8E0] rounded-2xl p-6 md:p-8 shadow-sm">
                <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  {isEs ? 'Asesoría Personalizada' : 'Personal Advisory'}
                </p>
                <h3 className="font-serif text-xl font-medium text-foreground mb-3 leading-snug">
                  {isEs
                    ? `¿Buscas propiedad ${isSale ? 'en venta' : 'en alquiler'} en ${zone.nameEs}?`
                    : `Looking for property ${isSale ? 'for sale' : 'for rent'} in ${zone.nameEn}?`}
                </h3>
                <p className="font-sans text-sm text-muted-foreground mb-6 leading-relaxed">
                  {isEs
                    ? 'Nuestros asesores conocen cada detalle de esta zona. Contáctanos hoy y encuentra tu hogar ideal.'
                    : 'Our advisors know every detail of this area. Contact us today and find your ideal home.'}
                </p>
                <a
                  href={waLink(ctaText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-sans font-medium text-sm px-5 py-3 rounded-full transition-colors w-full justify-center"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  {ctaButton}
                </a>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* ── Other Zones ────────────────────────────────────────────────────── */}
      {otherZonesList.length > 0 && (
        <section className="border-t border-[#E8E3DC]">
          <div className="container-wide py-10 md:py-12">
            <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-4">
              {isEs ? 'West GAM' : 'West GAM'}
            </p>
            <h2 className="font-serif text-xl md:text-2xl font-medium text-foreground mb-6">
              {otherZonesTitle}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {otherZonesList.map(z => (
                <Link
                  key={z.slug}
                  href={`/${lang}/${modePrefix}/${z.slug}`}
                  className="group flex items-center justify-between gap-3 bg-[#FAFAF8] hover:bg-white border border-[#E8E3DC] hover:border-[#C9A96E] rounded-xl px-4 py-3.5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-[#9A9A8A] group-hover:text-[#C9A96E] transition-colors shrink-0" />
                    <span className="font-sans text-sm font-medium text-foreground">
                      {isEs ? z.nameEs : z.nameEn}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-[#C9A96E] transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

    </main>
  )
}
