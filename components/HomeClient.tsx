'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Shield,
  MapPin,
  Users,
} from 'lucide-react'
import PropertyCard from '@/components/PropertyCard'
import ServicesPanels from '@/components/ServicesPanels'
import { useI18n } from '@/lib/i18n/context'
import type { PropertyRow } from '@/lib/supabase/queries'

export default function HomeClient({ featuredProperties, lang: langProp }: { featuredProperties: PropertyRow[]; lang?: 'es' | 'en' }) {
  const { t, lang: i18nLang } = useI18n()
  const lang = langProp ?? i18nLang

  const trustPoints = [
    { icon: Shield,  titleKey: 'home.trust.experience', descKey: 'home.trust.experienceDesc' },
    { icon: Users,   titleKey: 'home.trust.families',   descKey: 'home.trust.familiesDesc' },
    { icon: MapPin,  titleKey: 'home.trust.local',      descKey: 'home.trust.localDesc' },
  ]

  return (
    <>
      {/* ── Hero ── */}
      <section
        className="relative flex items-center"
        style={{
          minHeight: '85vh',
          backgroundImage: 'url(/hero-costa-rica.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} />
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
            <span className="inline-block px-4 py-1.5 border border-gold/40 text-gold text-xs tracking-widest uppercase mb-8 animate-fade-in">
              Escazú · Santa Ana · Costa Rica
            </span>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-medium text-primary-foreground leading-[1.15] mb-8 animate-slide-up">
              {t('home.hero.title')}{' '}
              <span className="text-gold">{t('home.hero.titleHighlight')}</span>
            </h1>

            <p
              className="text-lg text-primary-foreground/70 leading-relaxed mb-12 max-w-xl animate-slide-up"
              style={{ animationDelay: '0.1s' }}
            >
              {t('home.hero.description')}
            </p>

            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link
                href="/contacto"
                className="inline-flex items-center px-6 py-4 rounded bg-transparent border border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/60 transition-all text-base font-medium"
              >
                {t('home.hero.advisoryCta')}
              </Link>
            </div>

            <div
              className="flex flex-wrap gap-8 mt-16 pt-8 border-t border-primary-foreground/10 animate-fade-in"
              style={{ animationDelay: '0.3s' }}
            >
              <Link
                href="/servicios"
                className="text-xs text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors tracking-wide uppercase"
              >
                {t('home.hero.relocationGuidance')} →
              </Link>
              <Link
                href="/servicios"
                className="text-xs text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors tracking-wide uppercase"
              >
                {t('home.hero.investorServices')} →
              </Link>
              <Link
                href="/herramientas"
                className="text-xs text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors tracking-wide uppercase"
              >
                {t('home.hero.calculatorsTools')} →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Properties ── */}
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
              href="/propiedades"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.slice(0, 6).map((property) => (
                <PropertyCard key={property.id} property={property} lang={lang} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Services Panels ── */}
      <ServicesPanels />

      {/* ── Trust Section ── */}
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
                  href="/agentes"
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

      {/* ── Contact Strip ── */}
      <section className="bg-forest-dark text-primary-foreground py-16">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="font-serif text-xl font-medium mb-2">
                {t('home.cta.title')}
              </h3>
              <p className="text-primary-foreground/60 text-sm">
                {t('home.cta.noCommitment')}
              </p>
            </div>
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 px-6 py-4 rounded bg-transparent border border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 transition-all text-sm font-medium"
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
