'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  Menu, X, Phone, Mail, ChevronDown,
  BookOpen, Calculator, MapPin, Building2,
} from 'lucide-react'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Derive lang from URL — the ONLY source of truth
  const currentLang = pathname.startsWith('/es') ? 'es' : 'en'

  const toggleLang = () => {
    const nextLang = currentLang === 'en' ? 'es' : 'en'
    const newPath = pathname.replace(/^\/(en|es)/, `/${nextLang}`)
    router.push(newPath)
  }

  const labels = {
    home:         currentLang === 'es' ? 'Inicio'            : 'Home',
    properties:   currentLang === 'es' ? 'Propiedades'       : 'Properties',
    agents:       currentLang === 'es' ? 'Agentes'           : 'Advisors',
    services:     currentLang === 'es' ? 'Servicios'         : 'Solutions',
    contact:      currentLang === 'es' ? 'Contacto'          : 'Contact',
    toolsInsights:currentLang === 'es' ? 'Recursos'          : 'Resources',
    familyAffairs:currentLang === 'es' ? 'Asesoría Privada'  : 'Private Advisory',
    talkToUs:     currentLang === 'es' ? 'Solicitar Consulta': 'Request Consultation',
    tagline:      currentLang === 'es'
      ? 'Bienes Raíces de Lujo · Escazú · Santa Ana · Costa Rica'
      : 'Luxury Real Estate · Escazú · Santa Ana · Costa Rica',
    switchLang:   currentLang === 'es' ? '🇺🇸 Switch to English' : '🇨🇷 Cambiar a Español',
  }

  const navigation = [
    { name: labels.home,       href: `/${currentLang}` },
    { name: labels.properties, href: `/${currentLang}/properties` },
    { name: labels.agents,     href: `/${currentLang}/agents` },
    { name: labels.services,   href: `/${currentLang}/services` },
    { name: labels.contact,    href: `/${currentLang}/contact` },
  ]

  const resourcesItems = [
    {
      name:        currentLang === 'es' ? 'Blog & Market Insights'       : 'Blog & Insights',
      href:        `/${currentLang}/blog`,
      description: currentLang === 'es' ? 'Análisis de mercado y guías'  : 'Market analysis and guides',
      icon: BookOpen,
    },
    {
      name:        currentLang === 'es' ? 'Desarrollos & Preventa'       : 'Developments',
      href:        `/${currentLang}/desarrollos`,
      description: currentLang === 'es' ? 'Nueva construcción y preventa': 'New construction & pre-sales',
      icon: Building2,
    },
    {
      name:        currentLang === 'es' ? 'Guía West GAM'                : 'West GAM Guide',
      href:        `/${currentLang}/guia-west-gam`,
      description: currentLang === 'es' ? 'Guía completa de vida de lujo': 'Complete luxury living guide',
      icon: MapPin,
    },
    {
      name:        currentLang === 'es' ? 'Herramientas y Calculadoras'  : 'Tools & Calculators',
      href:        `/${currentLang}/tools`,
      description: currentLang === 'es' ? 'Calculadora de hipotecas y más': 'Mortgage calculator and more',
      icon: Calculator,
    },
  ]

  const isActive = (href: string) => {
    if (href === `/${currentLang}`) return pathname === `/${currentLang}` || pathname === `/${currentLang}/`
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
          <span className="font-medium">{labels.tagline}</span>
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
          <Link href={`/${currentLang}`} className="flex items-center gap-3">
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
                {labels.toolsInsights}
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
              onClick={toggleLang}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded px-2 py-1"
            >
              {currentLang === 'es' ? '🇺🇸 EN' : '🇪🇸 ES'}
            </button>
            <Link href={`/${currentLang}/family-affairs`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {labels.familyAffairs}
            </Link>
            <Link href={`/${currentLang}/contact`} className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              {labels.talkToUs}
            </Link>
          </div>

          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded px-2 py-1"
            >
              {currentLang === 'es' ? '🇺🇸 EN' : '🇪🇸 ES'}
            </button>
            <button
              type="button"
              className="p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
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
                  {labels.toolsInsights}
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
                href={`/${currentLang}/family-affairs`}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium py-2 text-muted-foreground hover:text-foreground"
              >
                {labels.familyAffairs}
              </Link>
              <div className="pt-4 border-t border-border flex flex-col gap-3">
                <button
                  onClick={() => {
                    toggleLang()
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center gap-2 text-muted-foreground text-sm"
                >
                  {labels.switchLang}
                </button>
                <a href="tel:+50686540888" className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Phone className="w-4 h-4" />
                  +506 8654-0888
                </a>
                <Link
                  href={`/${currentLang}/contact`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-3 rounded bg-primary text-primary-foreground text-sm font-medium"
                >
                  {labels.talkToUs}
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
