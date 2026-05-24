import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ShieldCheck, Users, Lock, Network, MapPin, ArrowRight, CheckCircle } from 'lucide-react'
import { getFeaturedProperties } from '@/lib/supabase/queries'
import PropertyCard from '@/components/PropertyCard'
import LeadFormMini from '@/components/lead-form-mini'
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
      ? 'Comprar Propiedades en Costa Rica | DR Housing'
      : 'Buy Property in Costa Rica — Western Corridor | DR Housing',
    description: isEs
      ? 'Casas de lujo en Escazú, Santa Ana, La Guácima y Lindora. Concierge bilingüe, portafolio off-market y asesoría legal para familias e inversionistas internacionales.'
      : 'Luxury homes in Escazú, Santa Ana, La Guácima and Lindora. Bilingual concierge, off-market portfolio, and legal advisory for international families and investors.',
    alternates: {
      canonical: `https://drhousing.net/${lang}/buyers`,
      languages: {
        en: 'https://drhousing.net/en/buyers',
        es: 'https://drhousing.net/es/buyers',
        'x-default': 'https://drhousing.net/en/buyers',
      },
    },
    openGraph: {
      title: isEs
        ? 'Comprar Propiedades de Lujo en Costa Rica | DR Housing'
        : 'Buy Luxury Property in Costa Rica | DR Housing',
      description: isEs
        ? 'Tu hogar en el Corredor Oeste de Costa Rica. Asesoría bilingüe, portafolio exclusivo y red de relocation.'
        : "Your home in Costa Rica's Western Corridor. Bilingual advisory, exclusive portfolio, and relocation network.",
      url: `https://drhousing.net/${lang}/buyers`,
      siteName: 'DR Housing',
      locale: isEs ? 'es_CR' : 'en_US',
      type: 'website',
      images: [{ url: 'https://drhousing.net/og-default.jpg', width: 1200, height: 630 }],
    },
    robots: { index: true, follow: true },
  }
}

// ─── JSON-LD ─────────────────────────────────────────────────────────────────

function BuyersJsonLd({ lang }: { lang: string }) {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        serviceType: 'Luxury real estate buyer representation',
        name: lang === 'es' ? 'Representación de Compradores de Lujo' : 'Luxury Buyer Representation',
        provider: {
          '@type': 'RealEstateAgent',
          name: 'DR Housing',
          url: 'https://drhousing.net',
          telephone: '+506 8654 0888',
          address: { '@type': 'PostalAddress', addressLocality: 'Escazú', addressCountry: 'CR' },
          areaServed: ['Escazú', 'Santa Ana', 'La Guácima', 'Lindora', 'Costa Rica'],
        },
        areaServed: "Costa Rica's Western Corridor",
        description:
          lang === 'es'
            ? 'Asesoría de compra de propiedades de lujo en el Corredor Oeste de Costa Rica.'
            : "Luxury property buying advisory in Costa Rica's Western Corridor.",
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'DR Housing', item: 'https://drhousing.net' },
          {
            '@type': 'ListItem',
            position: 2,
            name: lang === 'es' ? 'Compradores' : 'Buyers',
            item: `https://drhousing.net/${lang}/buyers`,
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

// ─── Pillar data ──────────────────────────────────────────────────────────────

const PILLARS = [
  {
    icon: ShieldCheck,
    titleEn: 'Broker of Record Licensed',
    titleEs: 'Corredor Titular Licenciado',
    bodyEn: 'Fully licensed brokerage with legal accountability under Costa Rican law.',
    bodyEs: 'Corretaje licenciado con responsabilidad legal bajo la ley costarricense.',
  },
  {
    icon: Users,
    titleEn: 'Bilingual Concierge',
    titleEs: 'Concierge Bilingüe',
    bodyEn: 'Native EN/ES team that handles every detail — from first call to final closing.',
    bodyEs: 'Equipo bilingüe EN/ES que maneja cada detalle — desde la primera llamada hasta el cierre.',
  },
  {
    icon: Lock,
    titleEn: 'Off-Market Portfolio',
    titleEs: 'Portafolio Off-Market',
    bodyEn: 'Access to discreet listings never published publicly.',
    bodyEs: 'Acceso a propiedades discretas que nunca se publican.',
  },
  {
    icon: Network,
    titleEn: 'Relocation Network',
    titleEs: 'Red de Relocation',
    bodyEn: 'Trusted attorneys, residency specialists, schools, and moving services.',
    bodyEs: 'Red de abogados, especialistas en residencia, escuelas y servicios de mudanza de confianza.',
  },
]

// ─── Area cards ───────────────────────────────────────────────────────────────

const AREAS = [
  {
    name: 'Escazú',
    vibeEn: "Costa Rica's benchmark for luxury living — international schools, hospitals, and Multiplaza.",
    vibeEs: 'El referente de lujo en Costa Rica — escuelas internacionales, hospitales y Multiplaza.',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    slug: 'escazu',
  },
  {
    name: 'Santa Ana',
    vibeEn: 'Modern lifestyle communities with corporate-zone proximity and strong investment upside.',
    vibeEs: 'Comunidades modernas con cercanía a zonas corporativas y alto potencial de inversión.',
    img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
    slug: 'santa-ana',
  },
  {
    name: 'La Guácima',
    vibeEn: 'Estate living, equestrian heritage, and spacious lots in a tranquil gated setting.',
    vibeEs: 'Vida en hacienda, tradición ecuestre y lotes amplios en entornos seguros y tranquilos.',
    img: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80',
    slug: 'la-guacima',
  },
  {
    name: 'Lindora',
    vibeEn: 'Executive enclave next to Forum Business Park — ideal for corporate relocations.',
    vibeEs: 'Enclave ejecutivo junto al Forum Business Park — ideal para reubicaciones corporativas.',
    img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    slug: 'lindora',
  },
]

// ─── Process steps ────────────────────────────────────────────────────────────

const PROCESS_STEPS = [
  {
    num: '01',
    titleEn: 'Discovery Call',
    titleEs: 'Llamada de Descubrimiento',
    bodyEn: '30-minute conversation to understand your goals, budget, and timing.',
    bodyEs: 'Conversación de 30 minutos para entender tus objetivos, presupuesto y tiempos.',
  },
  {
    num: '02',
    titleEn: 'Curated Selection',
    titleEs: 'Selección Personalizada',
    bodyEn: 'We send a personalized shortlist of homes that match your criteria.',
    bodyEs: 'Te enviamos una selección personalizada de casas que cumplen tus criterios.',
  },
  {
    num: '03',
    titleEn: 'Visits & Closing',
    titleEs: 'Visitas y Cierre',
    bodyEn: 'On-the-ground visits, negotiation, and full legal support through closing.',
    bodyEs: 'Visitas en sitio, negociación y soporte legal completo hasta el cierre.',
  },
]

// ─── Interest options for lead form ──────────────────────────────────────────

const BUYER_INTEREST_OPTIONS = [
  { value: 'buy', labelEn: 'Buy a home', labelEs: 'Comprar una casa' },
  { value: 'invest', labelEn: 'Invest in property', labelEs: 'Invertir en propiedad' },
  { value: 'relocate', labelEn: 'Relocate to Costa Rica', labelEs: 'Relocalizarme a Costa Rica' },
  { value: 'explore', labelEn: 'Just exploring', labelEs: 'Solo explorando' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BuyersPage({ params }: { params: { lang: string } }) {
  const lang = params.lang === 'es' ? 'es' : 'en'
  const isEs = lang === 'es'

  const featuredProperties = await getFeaturedProperties()

  const waUrl =
    'https://wa.me/50686540888?text=' +
    encodeURIComponent('Hola, quiero información sobre propiedades en Costa Rica')

  return (
    <>
      <BuyersJsonLd lang={lang} />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section
        data-hero="true"
        className="relative min-h-[60vh] lg:min-h-[70vh] flex items-center bg-[#F5F2EE] overflow-hidden"
      >
        {/* Gold accent line */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C9A96E]" />

        <div className="container-wide relative z-10 py-24 lg:py-32">
          {/* Badge */}
          <p className="inline-block text-[11px] font-semibold tracking-[0.15em] uppercase text-[#C9A96E] mb-6 font-sans">
            Escazú · Santa Ana · La Guácima · Lindora
          </p>

          {/* H1 */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground leading-tight max-w-3xl mb-6">
            {isEs
              ? 'Encuentra tu hogar en el Corredor Oeste de Costa Rica'
              : "Find Your Home in Costa Rica's Western Corridor"}
          </h1>

          {/* Subheadline */}
          <p className="text-[#6B6B6B] text-lg leading-relaxed max-w-2xl mb-10 font-sans">
            {isEs
              ? 'Casas de lujo curadas, asesoría de relocation y concierge bilingüe — para familias e inversionistas internacionales que se mudan a Costa Rica.'
              : 'Curated luxury homes, relocation guidance, and bilingual concierge — for international families and investors moving to Costa Rica.'}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#start-conversation"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors min-h-[52px]"
            >
              {isEs ? 'Iniciar conversación' : 'Start a conversation'}
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href={`/${lang}/properties`}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg border-2 border-[#C9A96E] text-[#C9A96E] font-medium text-sm hover:bg-[#C9A96E] hover:text-[#1A1A1A] transition-colors min-h-[52px]"
            >
              {isEs ? 'Ver propiedades' : 'Browse properties'}
            </Link>
          </div>
        </div>

        {/* Decorative geometric element */}
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[#E8E3DC]/60 to-transparent hidden lg:block" />
      </section>

      {/* ── WHY BUY WITH DR HOUSING — 4 pillars ────────────────────────────── */}
      <section className="section-padding bg-card">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-4">
              {isEs ? 'Por qué comprar con DR Housing' : 'Why Buy with DR Housing'}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto font-sans">
              {isEs
                ? 'No somos solo un agente. Somos tu equipo completo en Costa Rica.'
                : "We're not just an agent. We're your full team in Costa Rica."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PILLARS.map((p) => {
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

      {/* ── AREAS WE COVER ───────────────────────────────────────────────────── */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-4">
              {isEs ? 'Zonas que cubrimos' : 'Areas We Cover'}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto font-sans">
              {isEs
                ? 'Conocemos cada calle, cada comunidad y cada oportunidad del Corredor Oeste.'
                : 'We know every street, community, and opportunity in the Western Corridor.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {AREAS.map((area) => (
              <Link
                key={area.slug}
                href={`/${lang}/properties`}
                className="group block bg-card rounded-lg overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={area.img}
                    alt={area.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-[1.04] transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C9A96E] shrink-0" />
                    <h3 className="font-serif text-base font-semibold text-foreground">
                      {area.name}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed font-sans">
                    {isEs ? area.vibeEs : area.vibeEn}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUR PROCESS ─────────────────────────────────────────────────────── */}
      <section className="section-padding bg-card">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-4">
              {isEs ? 'Nuestro proceso' : 'Our Process'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line on desktop */}
            <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-px bg-[#E8E3DC]" />

            {PROCESS_STEPS.map((step, i) => (
              <div key={step.num} className="relative text-center md:text-left">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C9A96E]/10 border-2 border-[#C9A96E] mb-5 relative z-10">
                  <span className="font-serif text-xl font-semibold text-[#C9A96E]">
                    {step.num}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                  {isEs ? step.titleEs : step.titleEn}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-sans">
                  {isEs ? step.bodyEs : step.bodyEn}
                </p>
                {i < PROCESS_STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8 h-px bg-[#C9A96E]/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PROPERTIES ──────────────────────────────────────────────── */}
      {featuredProperties.length > 0 && (
        <section className="section-padding bg-background">
          <div className="container-wide">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-2">
                  {isEs ? 'Propiedades destacadas' : 'Featured Properties'}
                </h2>
                <p className="text-muted-foreground font-sans">
                  {isEs
                    ? 'Selección curada de residencias de lujo disponibles ahora.'
                    : 'Curated selection of luxury residences available now.'}
                </p>
              </div>
              <Link
                href={`/${lang}/properties`}
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-[#C9A96E] hover:text-[#b8945c] transition-colors font-sans"
              >
                {isEs ? 'Ver todo el portafolio' : 'View full portfolio'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProperties.slice(0, 4).map((property) => (
                <PropertyCard key={property.id} property={property} lang={lang} />
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link
                href={`/${lang}/properties`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#C9A96E] hover:text-[#b8945c] transition-colors font-sans"
              >
                {isEs ? 'Ver todo el portafolio' : 'View full portfolio'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── LEAD CAPTURE FORM ────────────────────────────────────────────────── */}
      <section id="start-conversation" className="section-padding bg-[#F5F2EE]">
        <div className="container-wide">
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-10">
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#C9A96E] mb-3 font-sans">
                {isEs ? 'Sin compromiso' : 'No commitment'}
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-4">
                {isEs ? 'Inicia la conversación' : 'Start the Conversation'}
              </h2>
              <p className="text-muted-foreground font-sans">
                {isEs
                  ? 'Cuéntanos qué buscas y te enviamos propiedades que encajan con tu perfil.'
                  : "Tell us what you need and we'll send you properties that match your profile."}
              </p>
            </div>

            <div className="bg-card rounded-xl shadow-sm border border-border p-6 sm:p-8">
              <LeadFormMini
                lang={lang}
                source="buyers_lp"
                leadType="buying"
                interestOptions={BUYER_INTEREST_OPTIONS}
              />
            </div>

            {/* Trust signals */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-muted-foreground font-sans">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#C9A96E]" />
                {isEs ? 'Sin comisión para compradores' : 'No buyer commission'}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#C9A96E]" />
                {isEs ? 'Respuesta en menos de 2 horas' : 'Response within 2 hours'}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#C9A96E]" />
                {isEs ? '100% bilingüe' : '100% bilingual'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHATSAPP CTA SECTION ─────────────────────────────────────────────── */}
      <section className="section-padding bg-[#2C2C2C] text-white">
        <div className="container-wide text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold mb-4">
            {isEs
              ? '¿Prefieres hablar directamente?'
              : 'Prefer to talk directly?'}
          </h2>
          <p className="text-white/70 mb-8 max-w-lg mx-auto font-sans">
            {isEs
              ? 'Escríbenos por WhatsApp ahora mismo. Respuesta inmediata durante horas hábiles.'
              : 'Message us on WhatsApp right now. Immediate response during business hours.'}
          </p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-lg bg-[#25D366] text-white font-semibold text-base hover:opacity-90 transition-opacity min-h-[56px]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp — +506 8654-0888
          </a>
        </div>
      </section>

      {/* ── MOBILE STICKY FAB ───────────────────────────────────────────────── */}
      <WhatsAppFAB message="Hola, quiero información sobre propiedades en Costa Rica" />
    </>
  )
}
