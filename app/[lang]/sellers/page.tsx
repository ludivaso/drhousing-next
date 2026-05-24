import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Camera, Globe, Lock, MapPin, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import type { PropertyRow } from '@/lib/supabase/queries'
import { getHeroImage } from '@/lib/supabase/queries'
import ValuationForm from '@/components/valuation-form'
import { WhatsAppFAB } from '@/components/WhatsAppCTA'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { lang: string }
}): Promise<Metadata> {
  const lang = params.lang === 'es' ? 'es' : 'en'
  const isEs = lang === 'es'

  return {
    title: isEs
      ? 'Vender Propiedad de Lujo en Costa Rica — Corredor Oeste'
      : 'Sell Your Luxury Property in Costa Rica — Western Corridor',
    description: isEs
      ? 'Valoración gratuita, producción de medios de lujo y red de compradores internacionales calificados. Corredor licenciado — Escazú, Santa Ana, La Guácima, Lindora.'
      : 'Free valuation, luxury-grade media production, and a qualified international buyer network. Licensed brokerage — Escazú, Santa Ana, La Guácima, Lindora.',
    alternates: {
      canonical: `https://drhousing.net/${lang}/sellers`,
      languages: {
        en: 'https://drhousing.net/en/sellers',
        es: 'https://drhousing.net/es/sellers',
        'x-default': 'https://drhousing.net/en/sellers',
      },
    },
    openGraph: {
      title: isEs
        ? 'Vender Propiedad de Lujo en Costa Rica | DR Housing'
        : 'Sell Luxury Property in Costa Rica | DR Housing',
      description: isEs
        ? 'Alcance internacional, medios de lujo y red de compradores calificados — respaldado por un corretaje licenciado.'
        : 'International reach, luxury-grade media, and qualified buyer network — backed by a licensed brokerage.',
      url: `https://drhousing.net/${lang}/sellers`,
      siteName: 'DR Housing',
      locale: isEs ? 'es_CR' : 'en_US',
      type: 'website',
      images: [{ url: 'https://drhousing.net/og-default.jpg', width: 1200, height: 630 }],
    },
    robots: { index: true, follow: true },
  }
}

// ─── JSON-LD ─────────────────────────────────────────────────────────────────

function SellersJsonLd({ lang }: { lang: string }) {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        serviceType: 'Luxury real estate listing and seller representation',
        name:
          lang === 'es'
            ? 'Representación de Vendedores de Lujo'
            : 'Luxury Seller Representation',
        provider: {
          '@type': 'RealEstateAgent',
          name: 'DR Housing',
          url: 'https://drhousing.net',
          telephone: '+506 8654 0888',
          address: { '@type': 'PostalAddress', addressLocality: 'Escazú', addressCountry: 'CR' },
          areaServed: ['Escazú', 'Santa Ana', 'La Guácima', 'Lindora', 'Costa Rica'],
        },
        areaServed: "Costa Rica's Western Corridor",
        offers: {
          '@type': 'Offer',
          description:
            lang === 'es' ? 'Valoración gratuita de su propiedad' : 'Free property valuation',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'DR Housing', item: 'https://drhousing.net' },
          {
            '@type': 'ListItem',
            position: 2,
            name: lang === 'es' ? 'Vendedores' : 'Sellers',
            item: `https://drhousing.net/${lang}/sellers`,
          },
        ],
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// ─── Data fetching moved inline into page component (see below) ───────────────

// ─── Pillar data ──────────────────────────────────────────────────────────────

const SELLER_PILLARS = [
  {
    icon: Camera,
    titleEn: 'Luxury-Grade Media',
    titleEs: 'Producción de Medios de Lujo',
    bodyEn: 'Professional photography, drone video, and editorial copywriting for every listing.',
    bodyEs: 'Fotografía profesional, video con drone y copy editorial para cada propiedad.',
  },
  {
    icon: Globe,
    titleEn: 'International Exposure',
    titleEs: 'Exposición Internacional',
    bodyEn:
      'Your property reaches buyers in the US, Canada, and Europe through Facebook Catalog, Encuentra24, WhatsApp Business, and our editorial channels.',
    bodyEs:
      'Tu propiedad llega a compradores en EE.UU., Canadá y Europa vía Facebook Catalog, Encuentra24, WhatsApp Business y nuestros canales editoriales.',
  },
  {
    icon: Lock,
    titleEn: 'Discreet & Off-Market',
    titleEs: 'Ventas Discretas y Off-Market',
    bodyEn: 'Prefer privacy? We sell to qualified buyers without a public listing.',
    bodyEs: '¿Prefieres discreción? Vendemos a compradores calificados sin publicación pública.',
  },
  {
    icon: MapPin,
    titleEn: "15+ Years in Costa Rica's Western Corridor",
    titleEs: 'Más de 15 años en el Corredor Oeste',
    bodyEn:
      "Diego Vargas and team have built deep relationships and on-the-ground knowledge across Escazú, Santa Ana, La Guácima, and Lindora. Direct accountability from first call to closing — your home turf is our home turf.",
    bodyEs:
      'Diego Vargas y su equipo han construido relaciones profundas y conocimiento en sitio en Escazú, Santa Ana, La Guácima y Lindora. Responsabilidad directa desde la primera llamada hasta el cierre — tu zona es nuestra zona.',
  },
]

// ─── Channels data ────────────────────────────────────────────────────────────

const CHANNELS = [
  { icon: '🌐', nameEn: 'drhousing.net', nameEs: 'drhousing.net', descEn: 'Own portfolio site', descEs: 'Sitio propio' },
  { icon: '📘', nameEn: 'Facebook Catalog', nameEs: 'Catálogo de Facebook', descEn: 'Meta Ads targeting', descEs: 'Anuncios Meta' },
  { icon: '💬', nameEn: 'WhatsApp Business', nameEs: 'WhatsApp Business', descEn: 'Direct buyer catalog', descEs: 'Catálogo directo' },
  { icon: '🏠', nameEn: 'Encuentra24', nameEs: 'Encuentra24', descEn: "Central America's #1 portal", descEs: 'Portal #1 de Centroamérica' },
  { icon: '🔒', nameEn: 'Private Buyer List', nameEs: 'Lista Privada de Compradores', descEn: 'Curated qualified buyers', descEs: 'Compradores calificados' },
]

// ─── Process steps ────────────────────────────────────────────────────────────

const SELLER_PROCESS = [
  {
    num: '01',
    titleEn: 'Free Valuation',
    titleEs: 'Valoración Gratuita',
    bodyEn: 'No commitment. We analyze your property and provide an honest market assessment.',
    bodyEs: 'Sin compromiso. Analizamos tu propiedad y damos una evaluación honesta del mercado.',
  },
  {
    num: '02',
    titleEn: 'Listing Preparation',
    titleEs: 'Preparación de la Propiedad',
    bodyEn: 'Professional photography, drone video, and editorial copy to position your property at its best.',
    bodyEs: 'Fotografía profesional, video con drone y texto editorial para posicionar tu propiedad al máximo.',
  },
  {
    num: '03',
    titleEn: 'Multi-Channel Launch',
    titleEs: 'Lanzamiento Multicanal',
    bodyEn: 'Simultaneous exposure across all our platforms to reach the right buyers fast.',
    bodyEs: 'Exposición simultánea en todas nuestras plataformas para llegar a los compradores correctos rápidamente.',
  },
  {
    num: '04',
    titleEn: 'Negotiation & Closing',
    titleEs: 'Negociación y Cierre',
    bodyEn: 'End-to-end legal support, negotiation, and transaction management through final closing.',
    bodyEs: 'Soporte legal completo, negociación y gestión de la transacción hasta el cierre final.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SellersPage({ params }: { params: { lang: string } }) {
  const lang = params.lang === 'es' ? 'es' : 'en'
  const isEs = lang === 'es'

  // Fetch the system curated list for sellers-page closings
  const { data: curatedList } = await supabase
    .from('curated_lists')
    .select('property_ids')
    .eq('slug', '_sellers-page-closings')
    .eq('is_active', true)
    .maybeSingle()

  let closedProperties: PropertyRow[] = []

  if (
    curatedList?.property_ids &&
    Array.isArray(curatedList.property_ids) &&
    curatedList.property_ids.length > 0
  ) {
    const { data: properties } = await supabase
      .from('properties')
      .select('*')
      .in('id', curatedList.property_ids)
      .eq('hidden', false)
      .or('visibility.eq.public,visibility.is.null')

    if (properties && properties.length > 0) {
      // Preserve admin-controlled order from property_ids array
      closedProperties = curatedList.property_ids
        .map((id: string) => properties.find((p) => p.id === id))
        .filter(Boolean) as PropertyRow[]
    }
  }

  const waSellerUrl =
    'https://wa.me/50686540888?text=' +
    encodeURIComponent('Hola, quiero vender mi propiedad')

  return (
    <>
      <SellersJsonLd lang={lang} />

      {/* ── HERO + VALUATION FORM ───────────────────────────────────────────── */}
      <section
        data-hero="true"
        className="relative bg-[#F5F2EE] overflow-hidden"
      >
        {/* Gold accent line */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C9A96E]" />

        <div className="container-wide relative z-10 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left: Copy */}
            <div className="pt-4">
              <p className="inline-block text-[11px] font-semibold tracking-[0.15em] uppercase text-[#C9A96E] mb-6 font-sans">
                {isEs
                  ? 'Vendedores y Arrendadores · Corredor Oeste'
                  : "Sellers & Landlords · Costa Rica's Western Corridor"}
              </p>

              <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-foreground leading-tight mb-6">
                {isEs
                  ? 'Vende tu propiedad de lujo en el Corredor Oeste de Costa Rica'
                  : "Sell Your Luxury Property in Costa Rica's Western Corridor"}
              </h1>

              <p className="text-[#6B6B6B] text-lg leading-relaxed mb-8 font-sans">
                {isEs
                  ? 'Alcance internacional, producción de medios de lujo y red de compradores calificados — respaldado por un corretaje licenciado.'
                  : 'International marketing reach, luxury-grade media, and a qualified buyer network — backed by a fully licensed brokerage.'}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a
                  href="#valuation"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors min-h-[52px]"
                >
                  {isEs ? 'Solicitar valoración gratuita' : 'Get free valuation'}
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href={waSellerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg border-2 border-[#C9A96E] text-[#C9A96E] font-medium text-sm hover:bg-[#C9A96E] hover:text-[#1A1A1A] transition-colors min-h-[52px]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              </div>

              {/* Trust signals */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#E8E3DC]">
                {[
                  { num: '15+', label: isEs ? 'Años de experiencia' : 'Years of experience' },
                  { num: '100%', label: isEs ? 'Corretaje licenciado' : 'Licensed brokerage' },
                  { num: 'EN/ES', label: isEs ? 'Equipo bilingüe' : 'Bilingual team' },
                ].map((stat) => (
                  <div key={stat.num} className="text-center">
                    <div className="font-serif text-2xl font-semibold text-foreground">{stat.num}</div>
                    <div className="text-xs text-muted-foreground font-sans mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Valuation Form */}
            <div id="valuation" className="scroll-mt-24">
              <div className="bg-card rounded-xl shadow-md border border-border p-6 sm:p-8">
                <div className="mb-6">
                  <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#C9A96E] mb-2 font-sans">
                    {isEs ? '100% gratuito · Sin compromiso' : '100% free · No commitment'}
                  </p>
                  <h2 className="font-serif text-2xl font-semibold text-foreground">
                    {isEs ? 'Valoración gratuita de tu propiedad' : 'Free Property Valuation'}
                  </h2>
                  <p className="text-muted-foreground text-sm mt-2 font-sans">
                    {isEs
                      ? 'Completa el formulario y te contactamos en menos de 2 horas.'
                      : "Fill in the form and we'll reach out within 2 hours."}
                  </p>
                </div>
                <ValuationForm lang={lang} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY LIST WITH DR HOUSING — 4 pillars ────────────────────────────── */}
      <section className="section-padding bg-card">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-4">
              {isEs ? 'Por qué publicar con DR Housing' : 'Why List with DR Housing'}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto font-sans">
              {isEs
                ? 'No somos solo un escaparate. Somos tu equipo de marketing y ventas de lujo.'
                : "We're not just a listing portal. We're your luxury marketing and sales team."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SELLER_PILLARS.map((p) => {
              const Icon = p.icon
              return (
                <div
                  key={p.titleEn}
                  className="bg-background rounded-lg p-6 border-l-4 border-[#C9A96E] shadow-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#C9A96E]/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#C9A96E]" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                    {isEs ? p.titleEs : p.titleEn}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed font-sans">
                    {isEs ? p.bodyEs : p.bodyEn}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── WHERE YOUR PROPERTY GETS SEEN ───────────────────────────────────── */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-4">
              {isEs ? 'Dónde se verá tu propiedad' : 'Where Your Property Gets Seen'}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto font-sans">
              {isEs
                ? 'Exposición multicanal desde el día uno del lanzamiento.'
                : 'Multi-channel exposure from day one of launch.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {CHANNELS.map((ch) => (
              <div
                key={ch.nameEn}
                className="bg-card rounded-lg p-5 text-center border border-border shadow-sm"
              >
                <div className="text-3xl mb-3">{ch.icon}</div>
                <h3 className="font-serif text-sm font-semibold text-foreground mb-1">
                  {isEs ? ch.nameEs : ch.nameEn}
                </h3>
                <p className="text-muted-foreground text-xs font-sans">
                  {isEs ? ch.descEs : ch.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUR PROCESS ─────────────────────────────────────────────────────── */}
      <section className="section-padding bg-card">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-4">
              {isEs ? 'Nuestro proceso de venta' : 'Our Selling Process'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {SELLER_PROCESS.map((step) => (
              <div key={step.num} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C9A96E]/10 border-2 border-[#C9A96E] mb-5">
                  <span className="font-serif text-xl font-semibold text-[#C9A96E]">
                    {step.num}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                  {isEs ? step.titleEs : step.titleEn}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-sans">
                  {isEs ? step.bodyEs : step.bodyEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECENTLY CLOSED / TRACK RECORD ──────────────────────────────────── */}
      {closedProperties.length > 0 && (
        <section className="section-padding bg-background">
          <div className="container-wide">
            <div className="text-center mb-10">
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-4">
                {isEs ? 'Transacciones recientes' : 'Recently Closed Transactions'}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto font-sans">
                {isEs
                  ? 'Un historial de ventas y arrendamientos exitosos en el Corredor Oeste.'
                  : 'A track record of successful sales and rentals across the Western Corridor.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {closedProperties.map((property) => {
                const heroImage = getHeroImage(property)
                const title =
                  lang === 'es'
                    ? property.title_es || property.ai_generated_title_es || property.title_en || property.title || ''
                    : property.title_en || property.ai_generated_title_en || property.title_es || property.title || ''
                const isSold = property.status === 'sold'

                return (
                  <div
                    key={property.id}
                    className="bg-card rounded-lg overflow-hidden border border-border shadow-sm"
                  >
                    <div className="relative h-48 overflow-hidden bg-muted">
                      {heroImage ? (
                        <Image
                          src={heroImage}
                          alt={title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm font-sans">
                          {isEs ? 'Sin imagen' : 'No image'}
                        </div>
                      )}
                      {/* Status badge */}
                      <span
                        className={`absolute top-3 left-3 text-[10px] font-semibold tracking-[0.08em] uppercase px-2.5 py-1 rounded font-sans ${
                          isSold
                            ? 'bg-[#1A1A1A] text-white'
                            : 'bg-[#C9A96E] text-[#1A1A1A]'
                        }`}
                      >
                        {isSold
                          ? isEs ? 'Vendido' : 'Sold'
                          : isEs ? 'Arrendado' : 'Rented'}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-sans truncate mb-1">
                        {property.zone || property.location_name || ''}
                      </p>
                      <h3 className="font-serif text-base font-medium text-foreground leading-snug line-clamp-2">
                        {title}
                      </h3>
                      {/* Price intentionally omitted — client confidentiality */}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── WHATSAPP CTA SECTION ─────────────────────────────────────────────── */}
      <section className="section-padding bg-[#2C2C2C] text-white">
        <div className="container-wide text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold mb-4">
            {isEs ? '¿Listo para hablar sobre tu propiedad?' : 'Ready to talk about your property?'}
          </h2>
          <p className="text-white/70 mb-8 max-w-lg mx-auto font-sans">
            {isEs
              ? 'Escríbenos ahora. Sin presión, sin compromiso — solo una conversación honesta.'
              : 'Message us now. No pressure, no commitment — just an honest conversation.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={waSellerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-lg bg-[#25D366] text-white font-semibold text-base hover:opacity-90 transition-opacity min-h-[56px]"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp — +506 8654-0888
            </a>
            <a
              href="#valuation"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg border border-white/30 text-white font-medium text-sm hover:bg-white/10 transition-colors min-h-[56px]"
            >
              {isEs ? 'Solicitar valoración' : 'Request valuation'}
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── MOBILE STICKY FAB ───────────────────────────────────────────────── */}
      <WhatsAppFAB message="Hola, quiero vender mi propiedad" />
    </>
  )
}
