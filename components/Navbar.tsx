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
  // false = solid (safe default); true = transparent (hero visible)
  const [isOverHero, setIsOverHero] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLang = pathname.startsWith('/es') ? 'es' : 'en'

  // Scroll-based hero detection — much more responsive than IntersectionObserver.
  // Flips transparent→solid after just 15% of the hero height is scrolled away.
  // MutationObserver covers Suspense-deferred heroes that appear after paint.
  useEffect(() => {
    setIsOverHero(false)

    const check = () => {
      const hero = document.querySelector('[data-hero="true"]') as HTMLElement | null
      if (!hero) { setIsOverHero(false); return }
      setIsOverHero(window.scrollY < hero.offsetHeight * 0.15)
    }

    check()
    window.addEventListener('scroll', check, { passive: true })

    const mutObs = new MutationObserver(check)
    mutObs.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('scroll', check)
      mutObs.disconnect()
    }
  }, [pathname])

  // Mobile menu open → force solid so menu items are always legible
  const solid = !isOverHero || mobileMenuOpen

  const toggleLang = () => {
    const next = currentLang === 'en' ? 'es' : 'en'
    router.push(pathname.replace(/^\/(en|es)/, `/${next}`))
  }

  const labels = {
    home:          currentLang === 'es' ? 'Inicio'      : 'Home',
    properties:    currentLang === 'es' ? 'Propiedades' : 'Properties',
    agents:        currentLang === 'es' ? 'Agentes'     : 'Advisors',
    services:      currentLang === 'es' ? 'Servicios'   : 'Solutions',
    contact:       currentLang === 'es' ? 'Contacto'    : 'Contact',
    toolsInsights: currentLang === 'es' ? 'Recursos'    : 'Resources',
    switchLang:    currentLang === 'es' ? '🇺🇸 Switch to English' : '🇨🇷 Cambiar a Español',
  }

  const navigation = [
    { name: labels.home,       href: `/${currentLang}` },
    { name: labels.properties, href: `/${currentLang}/properties` },
    { name: labels.agents,     href: `/${currentLang}/agents` },
    { name: labels.services,   href: `/${currentLang}/services` },
    { name: labels.contact,    href: `/${currentLang}/contact` },
  ]

  const resourcesItems = [
    { name: currentLang === 'es' ? 'Blog & Market Insights'      : 'Blog & Insights',      href: `/${currentLang}/blog`,          description: currentLang === 'es' ? 'Análisis de mercado y guías'   : 'Market analysis and guides',   icon: BookOpen  },
    { name: currentLang === 'es' ? 'Desarrollos & Preventa'      : 'Developments',          href: `/${currentLang}/desarrollos`,   description: currentLang === 'es' ? 'Nueva construcción y preventa' : 'New construction & pre-sales', icon: Building2 },
    { name: currentLang === 'es' ? 'Guía West GAM'               : 'West GAM Guide',        href: `/${currentLang}/guia-west-gam`, description: currentLang === 'es' ? 'Guía completa de vida de lujo' : 'Complete luxury living guide',  icon: MapPin    },
    { name: currentLang === 'es' ? 'Herramientas y Calculadoras' : 'Tools & Calculators',   href: `/${currentLang}/tools`,         description: currentLang === 'es' ? 'Calculadora de hipotecas y más': 'Mortgage calculator and more', icon: Calculator},
  ]

  const isActive = (href: string) =>
    href === `/${currentLang}`
      ? pathname === `/${currentLang}` || pathname === `/${currentLang}/`
      : pathname.startsWith(href)

  const isResourcesActive = resourcesItems.some((item) => pathname.startsWith(item.href))

  const linkCls = (active: boolean) => [
    'text-sm font-medium transition-colors link-underline',
    active
      ? solid ? 'text-[#C9A96E]' : 'text-gold'
      : solid ? 'text-muted-foreground hover:text-foreground' : 'text-white/80 hover:text-white',
  ].join(' ')

  const iconCls = solid ? 'text-muted-foreground hover:text-foreground' : 'text-white/80 hover:text-white'

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setResourcesOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className={[
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      solid ? 'bg-card/95 backdrop-blur-md border-b border-border' : 'bg-transparent',
    ].join(' ')}>

      {/* ── Single slim nav bar ── */}
      <nav className="container-wide h-16 lg:h-[72px] flex items-center justify-between">

        {/* Logo — fixed size, only color/filter changes on scroll */}
        <Link href={`/${currentLang}`} className="flex items-center gap-3 shrink-0">
          <Image
            src="/logo.png"
            alt="DR Housing"
            width={64}
            height={64}
            className="h-14 w-auto transition-all duration-300"
            style={!solid ? { filter: 'brightness(0) invert(1)' } : undefined}
          />
          <div>
            <span className={`font-serif text-2xl font-semibold tracking-tight transition-colors duration-300 ${solid ? 'text-foreground' : 'text-white'}`}>
              DR Housing
            </span>
            <span className={`hidden sm:block text-[13px] tracking-wide transition-colors duration-300 ${solid ? 'text-muted-foreground' : 'text-white/70'}`}>
              Costa Rica Real Estate
            </span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-7">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className={linkCls(isActive(item.href))}>
              {item.name}
            </Link>
          ))}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setResourcesOpen((v) => !v)}
              className={linkCls(isResourcesActive) + ' flex items-center gap-1'}
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

        {/* Desktop right: phone · email · divider · lang */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="relative group">
            <a href="tel:+50686540888" aria-label="Call DR Housing at +506 8654-0888" className={`p-1.5 transition-colors ${iconCls}`}>
              <Phone className="w-5 h-5" />
            </a>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1.5 bg-foreground text-background text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              +506 8654-0888
            </div>
          </div>
          <div className="relative group">
            <a href="mailto:info@drhousing.net" aria-label="Email DR Housing at info@drhousing.net" className={`p-1.5 transition-colors ${iconCls}`}>
              <Mail className="w-5 h-5" />
            </a>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1.5 bg-foreground text-background text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              info@drhousing.net
            </div>
          </div>
          <div className="w-px h-4 bg-current opacity-20 mx-1" />
          <div className="flex items-center rounded-full border border-[#E8E3DC] overflow-hidden text-xs font-medium">
            <button
              onClick={() => currentLang !== 'en' && toggleLang()}
              className={`px-3 py-1.5 transition-colors duration-150 ${
                currentLang === 'en'
                  ? 'bg-[#C9A96E] text-white'
                  : 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F0EBE3]'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => currentLang !== 'es' && toggleLang()}
              className={`px-3 py-1.5 transition-colors duration-150 ${
                currentLang === 'es'
                  ? 'bg-[#C9A96E] text-white'
                  : 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F0EBE3]'
              }`}
            >
              ES
            </button>
          </div>
        </div>

        {/* Mobile right: lang + hamburger */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="flex items-center rounded-full border border-[#E8E3DC] overflow-hidden text-xs font-medium">
            <button
              onClick={() => currentLang !== 'en' && toggleLang()}
              className={`px-3 py-1.5 transition-colors duration-150 ${
                currentLang === 'en'
                  ? 'bg-[#C9A96E] text-white'
                  : 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F0EBE3]'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => currentLang !== 'es' && toggleLang()}
              className={`px-3 py-1.5 transition-colors duration-150 ${
                currentLang === 'es'
                  ? 'bg-[#C9A96E] text-white'
                  : 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F0EBE3]'
              }`}
            >
              ES
            </button>
          </div>
          <button
            type="button"
            className={`p-2 transition-colors ${solid ? 'text-muted-foreground hover:text-foreground' : 'text-white hover:text-white/80'}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer — always solid bg for legibility */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-card/98 backdrop-blur-md">
          <div className="container-wide py-4 flex flex-col gap-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-medium py-1.5 ${isActive(item.href) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {item.name}
              </Link>
            ))}
            <div>
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
            <div className="pt-4 border-t border-border flex flex-col gap-3">
              <a href="tel:+50686540888" className="flex items-center gap-3 text-muted-foreground text-sm hover:text-foreground transition-colors">
                <Phone className="w-4 h-4 shrink-0" />
                +506 8654-0888
              </a>
              <a href="mailto:info@drhousing.net" className="flex items-center gap-3 text-muted-foreground text-sm hover:text-foreground transition-colors">
                <Mail className="w-4 h-4 shrink-0" />
                info@drhousing.net
              </a>
              <div className="flex items-center rounded-full border border-[#E8E3DC] overflow-hidden text-xs font-medium self-start">
                <button
                  onClick={() => { if (currentLang !== 'en') { toggleLang(); setMobileMenuOpen(false) } }}
                  className={`px-3 py-1.5 transition-colors duration-150 ${
                    currentLang === 'en'
                      ? 'bg-[#C9A96E] text-white'
                      : 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F0EBE3]'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => { if (currentLang !== 'es') { toggleLang(); setMobileMenuOpen(false) } }}
                  className={`px-3 py-1.5 transition-colors duration-150 ${
                    currentLang === 'es'
                      ? 'bg-[#C9A96E] text-white'
                      : 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F0EBE3]'
                  }`}
                >
                  ES
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
