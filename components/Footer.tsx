'use client'

import Link from 'next/link'
import { Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    // bg-forest-dark text-primary-foreground = #2C2C2C with off-white text
    <footer style={{ backgroundColor: '#2C2C2C', color: 'hsl(30 18% 90%)' }}>

      {/* Main footer grid — py-12 md:py-16, 4-column */}
      <div className="container-wide py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Column 1 — Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <span className="font-serif text-xl font-semibold tracking-tight">
                DR <span style={{ color: '#C9A96E' }}>Housing</span>
              </span>
              <p className="text-xs font-sans tracking-widest uppercase mt-0.5" style={{ color: 'rgba(245,242,238,0.5)' }}>
                Luxury Real Estate
              </p>
            </div>
            <p className="text-sm leading-relaxed font-sans mb-6" style={{ color: 'rgba(245,242,238,0.6)' }}>
              Asesoría inmobiliaria de lujo en Escazú, Santa Ana y el corredor Ruta 27 de Costa Rica.
            </p>
            <div className="space-y-2">
              <a href="tel:+50686540888" className="flex items-center gap-2 text-sm font-sans transition-colors hover:opacity-100" style={{ color: 'rgba(245,242,238,0.7)' }}>
                <Phone className="w-3.5 h-3.5 shrink-0" />
                +506 8654-0888
              </a>
              <a href="mailto:diego@drhousing.net" className="flex items-center gap-2 text-sm font-sans transition-colors hover:opacity-100" style={{ color: 'rgba(245,242,238,0.7)' }}>
                <Mail className="w-3.5 h-3.5 shrink-0" />
                diego@drhousing.net
              </a>
              <div className="flex items-start gap-2 text-sm font-sans" style={{ color: 'rgba(245,242,238,0.7)' }}>
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Escazú · Santa Ana · Costa Rica</span>
              </div>
            </div>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <h4 className="font-serif text-lg mb-4" style={{ color: 'hsl(30 18% 90%)' }}>
              Propiedades
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: '/property', label: 'Todas las propiedades' },
                { href: '/property?status=for_sale', label: 'En venta' },
                { href: '/property?status=for_rent', label: 'En alquiler' },
                { href: '/desarrollos', label: 'Desarrollos & Preventa' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm font-sans transition-colors hover:opacity-100" style={{ color: 'rgba(245,242,238,0.7)' }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Services */}
          <div>
            <h4 className="font-serif text-lg mb-4" style={{ color: 'hsl(30 18% 90%)' }}>
              Servicios
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: '/servicios', label: 'Bienes Raíces' },
                { href: '/servicios', label: 'Legal & Migración' },
                { href: '/servicios', label: 'Diseño de Interiores' },
                { href: '/servicios', label: 'Administración' },
                { href: '/servicios', label: 'Family Affairs' },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm font-sans transition-colors hover:opacity-100" style={{ color: 'rgba(245,242,238,0.7)' }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Newsletter / CTA */}
          <div>
            <h4 className="font-serif text-lg mb-4" style={{ color: 'hsl(30 18% 90%)' }}>
              Manténgase Informado
            </h4>
            <p className="text-sm font-sans mb-4" style={{ color: 'rgba(245,242,238,0.6)' }}>
              Reciba alertas de nuevas propiedades y análisis del mercado.
            </p>
            {/* Newsletter form — exact classes from audit */}
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="su@email.com"
                className="flex-1 px-4 py-3 rounded text-sm font-sans focus:outline-none"
                style={{
                  background: 'rgba(245,242,238,0.1)',
                  border: '1px solid rgba(245,242,238,0.2)',
                  color: 'hsl(30 18% 90%)',
                }}
              />
              <button
                type="submit"
                className="px-4 py-3 rounded font-sans font-medium text-sm tracking-wide transition-colors hover:opacity-90"
                style={{ background: '#C9A96E', color: '#2C2C2C' }}
              >
                →
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar — border-t, flex justify-between */}
      <div style={{ borderTop: '1px solid rgba(245,242,238,0.1)' }}>
        <div className="container-wide py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-sans" style={{ color: 'rgba(245,242,238,0.6)' }}>
            © {new Date().getFullYear()} DR Housing. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            {[
              { href: '#', label: 'Privacidad' },
              { href: '#', label: 'Términos' },
              { href: '/admin', label: 'Admin' },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-sans transition-colors hover:opacity-100"
                style={{ color: 'rgba(245,242,238,0.7)' }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
