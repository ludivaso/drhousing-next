'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Phone, Mail } from 'lucide-react'

const NAV_LINKS = [
  { href: '/property',    label: 'Propiedades' },
  { href: '/desarrollos', label: 'Desarrollos' },
  { href: '/servicios',   label: 'Servicios' },
  { href: '/contacto',    label: 'Contacto' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50">

      {/* ── Top bar (contact strip) — hidden on mobile ── */}
      <div className="hidden md:block bg-primary text-primary-foreground">
        <div className="container-wide py-2 flex items-center justify-between">
          <p className="text-xs text-primary-foreground/70 tracking-wide">
            Bienes Raíces de Lujo · Escazú · Santa Ana · Costa Rica
          </p>
          <div className="flex items-center gap-6">
            <a
              href="tel:+50686540888"
              className="flex items-center gap-1.5 text-xs text-primary-foreground/80 hover:text-primary-foreground transition-colors"
            >
              <Phone className="w-3 h-3" />
              +506 8654-0888
            </a>
            <a
              href="mailto:diego@drhousing.net"
              className="flex items-center gap-1.5 text-xs text-primary-foreground/80 hover:text-primary-foreground transition-colors"
            >
              <Mail className="w-3 h-3" />
              diego@drhousing.net
            </a>
          </div>
        </div>
      </div>

      {/* ── Main navbar ── */}
      <div className="bg-card/95 backdrop-blur-md border-b border-border">
        <div className="container-wide py-4 flex items-center justify-between">

          {/* Logo */}
          <Link
            href="/"
            className="flex flex-col shrink-0"
            onClick={() => setMobileOpen(false)}
          >
            <span className="font-serif text-xl font-semibold text-foreground tracking-tight leading-none">
              DR <span className="text-[#C9A96E]">Housing</span>
            </span>
            <span className="hidden sm:block text-[10px] font-sans text-muted-foreground tracking-widest uppercase mt-0.5">
              Luxury Real Estate
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`link-underline font-sans text-sm font-medium transition-colors ${
                    active ? 'text-[#C9A96E]' : 'text-foreground/80 hover:text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/contacto"
              className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Consulta Privada
            </Link>
            <a
              href="https://wa.me/50686540888?text=Hola,%20me%20gustaría%20agendar%20una%20consulta%20estratégica."
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-sm font-medium bg-primary text-primary-foreground px-5 py-2.5 rounded hover:bg-primary/90 transition-colors"
            >
              Agendar Consulta
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-foreground p-2 -mr-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border bg-card px-6 py-4 flex flex-col gap-1 animate-fade-in">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-sans text-base py-3 border-b border-border/50 transition-colors ${
                    active ? 'text-[#C9A96E]' : 'text-foreground/80 hover:text-foreground'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              )
            })}

            {/* Mobile contact strip */}
            <div className="flex items-center gap-4 py-3 border-b border-border/50">
              <a href="tel:+50686540888" className="flex items-center gap-1.5 font-sans text-sm text-muted-foreground">
                <Phone className="w-4 h-4" /> +506 8654-0888
              </a>
            </div>

            <a
              href="https://wa.me/50686540888?text=Hola,%20me%20gustaría%20agendar%20una%20consulta%20estratégica."
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-sm font-medium bg-primary text-primary-foreground px-4 py-3 rounded text-center mt-3"
              onClick={() => setMobileOpen(false)}
            >
              Agendar Consulta Estratégica
            </a>
          </div>
        )}
      </div>
    </header>
  )
}
