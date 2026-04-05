'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Menu, X, Phone, Mail, ChevronDown,
  BookOpen, Calculator, MapPin, Building2,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { t, lang, setLang } = useI18n()

  const navigation = [
    { name: t('header.home'),       href: '/' },
    { name: t('header.properties'), href: '/propiedades' },
    { name: t('header.agents'),     href: '/agentes' },
    { name: t('header.services'),   href: '/servicios' },
    { name: t('header.contact'),    href: '/contacto' },
  ]

  const resourcesItems = [
    {
      name: lang === 'en' ? 'Blog & Insights' : 'Blog & Market Insights',
      href: '/blog',
      description: lang === 'en' ? 'Market analysis and guides' : 'Análisis de mercado y guías',
      icon: BookOpen,
    },
    {
      name: lang === 'en' ? 'Developments' : 'Desarrollos & Preventa',
      href: '/desarrollos',
      description: lang === 'en' ? 'New construction & pre-sales' : 'Nueva construcción y preventa',
      icon: Building2,
    },
    {
      name: lang === 'en' ? 'West GAM Guide' : 'Guía West GAM',
      href: '/guia-west-gam',
      description: lang === 'en' ? 'Complete luxury living guide' : 'Guía completa de vida de lujo',
      icon: MapPin,
    },
    {
      name: lang === 'en' ? 'Tools & Calculators' : 'Herramientas y Calculadoras',
      href: '/herramientas',
      description: lang === 'en' ? 'Mortgage calculator and more' : 'Calculadora de hipotecas y más',
      icon: Calculator,
    },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const isResourcesActive = resourcesItems.some((item) =>
    pathname.startsWith(item.href)
  )

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setResourcesOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="hidden md:block bg-primary text-primary-foreground">
        <div className="container-wide py-2 flex items-center justify-between text-sm">
          <span className="font-medium">
            {lang === 'en'
              ? 'Luxury Real Estate · Escazú · Santa Ana · Costa Rica'
              : 'Bienes Raíces de Lujo · Escazú · Santa Ana · Costa Rica'}
          </span>
          <div className="flex items-center gap-6">
            <a href="tel:+50686540888" className="flex items-center gap-2 hover:text-gold transition-colors">
              <Phone className="w-4 h-4" />
              +506 8654-0888
            </a>
            <a href="mailto:info@drhousing.net" className="flex items-center gap-2 hover:text-gold transition-colors">
              <Mail className="w-4 h-4" />
              info@drhousing.net
            </a>
          </div>
        </div>
      </div>

      <nav className="container-wide py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="DR Housing" width={56} height={56} className="h-14 w-auto" />
            <div>
              <span className="font-serif text-xl font-semibold text-foreground tracking-tight">DR Housing</span>
              <span className="hidden sm:block text-xs text-muted-foreground tracking-wide">Costa Rica Real Estate</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors link-underline ${isActive(item.href) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {item.name}
              </Link>
            ))}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setResourcesOpen((v) => !v)}
                className={`text-sm font-medium transition-colors link-underline flex items-center gap-1 ${isResourcesActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <BookOpen className="w-4 h-4" />
                {t('header.toolsInsights')}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${resourcesOpen ? 'rotate-180' : ''}`} />
              </button>
              {resourcesOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-popover border border-border shadow-lg rounded z-50">
                  {resourcesItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setResourcesOpen(false)}
                      className={`flex items-start gap-3 p-3 hover:bg-secondary transition-colors ${isActive(item.href) ? 'bg-secondary' : ''}`}
                    >
                      <item.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-foreground text-sm">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded px-2 py-1"
            >
              {lang === 'es' ? '🇺🇸 EN' : '🇨🇷 ES'}
            </button>
            <Link href="/family-affairs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('header.familyAffairs')}
            </Link>
            <Link href="/contacto" className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              {t('common.talkToUs')}
            </Link>
          </div>

          <button
            type="button"
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-border pt-4 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-base font-medium py-2 ${isActive(item.href) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="py-2">
                <div className="flex items-center gap-2 text-base font-medium text-foreground mb-2">
                  <BookOpen className="w-4 h-4" />
                  {t('header.toolsInsights')}
                </div>
                <div className="pl-6 flex flex-col gap-2">
                  {resourcesItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-sm py-1.5 flex items-center gap-2 ${isActive(item.href) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              <Link
                href="/family-affairs"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium py-2 text-muted-foreground hover:text-foreground"
              >
                {t('header.familyAffairs')}
              </Link>
              <div className="pt-4 border-t border-border flex flex-col gap-3">
                <button
                  onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
                  className="flex items-center gap-2 text-muted-foreground text-sm"
                >
                  {lang === 'es' ? '🇺🇸 Switch to English' : '🇨🇷 Cambiar a Español'}
                </button>
                <a href="tel:+50686540888" className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Phone className="w-4 h-4" />
                  +506 8654-0888
                </a>
                <Link
                  href="/contacto"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-3 rounded bg-primary text-primary-foreground text-sm font-medium"
                >
                  {t('common.talkToUs')}
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
