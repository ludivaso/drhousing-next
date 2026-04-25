'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Shield, MapPin, Users } from 'lucide-react'
import PropertyCard from '@/components/PropertyCard'
import ServicesPanels from '@/components/ServicesPanels'
import { useI18n } from '@/lib/i18n/context'
import type { PropertyRow } from '@/lib/supabase/queries'
import type { ServiceCardConfig, HeroHeight, SiteSettings } from '@/lib/supabase/settings'

// ── Detect MIME type from URL extension ──────────────────────────────────────
function mimeType(url: string): string {
  if (/\.webm(\?|$)/i.test(url)) return 'video/webm'
  if (/\.og[gv](\?|$)/i.test(url)) return 'video/ogg'
  return 'video/mp4'
}

// ── Hero height map ───────────────────────────────────────────────────────────
const HEIGHT: Record<HeroHeight, string> = {
  cinematic: '50vh',
  landscape:  '65vh',
  full:       '85vh',
}

// ── Hero background: video loop with static image fallback ────────────────────
function HeroBackground({
  videoUrl,
  brightness,
}: {
  videoUrl?: string
  brightness: number
}) {
  const [videoFailed, setVideoFailed] = useState(false)

  if (videoUrl && !videoFailed) {
    return (
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/hero-costa-rica.jpg"
        onError={() => setVideoFailed(true)}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: `brightness(${brightness}%)` }}
      >
        <source src={videoUrl} type={mimeType(videoUrl)} />
      </video>
    )
  }

  return (
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: 'url(/hero-costa-rica.jpg)' }}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────

interface HomeClientProps {
  featuredProperties: PropertyRow[]
  lang?: 'es' | 'en'
  heroVideoUrl?: string
  heroHeight?: HeroHeight
  heroOverlay?: number
  heroBrightness?: number
  panelOverlay?: number
  serviceCards?: ServiceCardConfig[]
}

export default function HomeClient({
  featuredProperties,
  lang: langProp,
  heroVideoUrl,
  heroHeight,
  heroOverlay,
  heroBrightness,
  panelOverlay,
  serviceCards,
}: HomeClientProps) {
  const { t, lang: i18nLang } = useI18n()
  const lang = langProp ?? i18nLang

  // Normalise any legacy Spanish href values from the DB before passing to ServicesPanels
  const normalizedCards = (serviceCards ?? []).map((card) => ({
    ...card,
    href: card.href
      .replace(/^\//, '')
      .replace('propiedades', 'properties')
      .replace('servicios', 'services')
      .replace('agentes', 'agents')
      .replace('contacto', 'contact')
      .replace('herramientas', 'tools'),
  }))

  const trustPoints = [
    { icon: Shield, titleKey: 'home.trust.experience', descKey: 'home.trust.experienceDesc' },
    { icon: Users,  titleKey: 'home.trust.families',   descKey: 'home.trust.familiesDesc' },
    { icon: MapPin, titleKey: 'home.trust.local',      descKey: 'home.trust.localDesc' },
  ]

  return (
    <>
      {/* ── 1. Hero ── */}
      {/* Negative margin slides the hero under the fixed navbar */}
      <section
        data-hero="true"
        className="relative flex items-center -mt-16 lg:-mt-[72px]"
        style={{ minHeight: HEIGHT[heroHeight ?? 'cinematic'] }}
      >
        {/* Background — video if available, static image as fallback */}
        <HeroBackground
          videoUrl={heroVideoUrl}
          brightness={heroBrightness ?? 100}
        />

        {/*
          Overlay:
          - Video  → dynamic black at heroOverlay % (default 45)
          - Static → brand gradient (high opacity keeps text readable)
        */}
        {heroVideoUrl
          ? (
            <div
              className="absolute inset-0 transition-opacity duration-300"
              style={{ backgroundColor: `rgba(0,0,0,${(heroOverlay ?? 45) / 100})` }}
            />
          ) : (
            <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} />
          )
        }

        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="container-wide relative z-10 py-24">
          <div className="max-w-2xl">
            <span className="inline-block text-gold text-xs tracking-widest uppercase mb-8 animate-fade-in">
              Escazú · Santa Ana · Costa Rica
            </span>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-medium text-primary-foreground leading-[1.15] mb-8 animate-slide-up">
              {t('home.hero.title')}{' '}
              <span className="text-gold">{t('home.hero.titleHighlight')}</span>
            </h1>
          </div>
        </div>
      </section>

      {/* ── White gap ── */}
      <div className="h-10 md:h-16 bg-background" />

      {/* ── 2. Services Panels ── */}
      <ServicesPanels cards={normalizedCards.length ? normalizedCards : undefined} panelOverlay={panelOverlay} />

      {/* ── 3. Featured Properties ── */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-foreground mb-2">
                {t('home.featured.title')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t('home.featured.subtitle')}
              </p>
            </div>
            <Link
              href={`/${lang}/properties`}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wide uppercase"
            >
              {t('common.viewAll')} →
            </Link>
          </div>

          {featuredProperties.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8">
              {t('home.featured.noProperties')}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProperties.slice(0, 4).map((property) => (
                <PropertyCard key={property.id} property={property} lang={lang} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 4. Trust Section ── */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-foreground mb-6">
                {t('home.trust.title')}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-10 text-sm">
                {t('home.trust.description')}
              </p>

              <div className="space-y-8">
                {trustPoints.map((point) => (
                  <div key={point.titleKey} className="flex gap-4">
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <point.icon className="w-4 h-4 text-foreground/70" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground text-sm mb-1">
                        {t(point.titleKey)}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {t(point.descKey)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <Link
                  href={`/${lang}/agents`}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wide uppercase"
                >
                  {t('home.trust.meetTeam')} →
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="overflow-hidden rounded-sm">
                <Image
                  src="/dr-portrait.png"
                  alt="DR Housing — Asesoría Inmobiliaria Privada"
                  width={600}
                  height={700}
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Contact Strip ── */}
      <section className="bg-[#2C2C2C] text-white py-16">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="font-serif text-xl font-medium mb-2">
                {t('home.cta.title')}
              </h3>
              <p className="text-white/60 text-sm">
                {t('home.cta.noCommitment')}
              </p>
            </div>
            <Link
              href={`/${lang}/contact`}
              className="inline-flex items-center gap-2 px-6 py-4 rounded bg-[#C9A96E] text-[#1A1A1A] hover:bg-[#b89656] transition-colors text-sm font-medium"
            >
              {t('home.hero.advisoryCta')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
