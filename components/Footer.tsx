'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin } from 'lucide-react'

const quickLinks = [
  { name: 'Propiedades', href: '/property' },
  { name: 'Agentes', href: '/agentes' },
  { name: 'Servicios', href: '/servicios' },
  { name: 'Blog & Market Insights', href: '/blog' },
  { name: 'Desarrollos & Preventa', href: '/desarrollos' },
  { name: 'Herramientas e Insights', href: '/herramientas' },
  { name: 'West GAM Luxury Guide', href: '/guia-west-gam' },
  { name: 'Contacto', href: '/contacto' },
]

const services = [
  { name: 'Compra y Venta', href: '/servicios#brokerage' },
  { name: 'Administración de Propiedades', href: '/servicios#management' },
  { name: 'Legal e Inmigración', href: '/servicios#legal' },
  { name: 'Desarrollos', href: '/servicios#development' },
  { name: 'Family Affairs', href: '/family-affairs' },
]

export default function Footer() {
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    // Newsletter subscription handler
  }

  return (
    <footer className="bg-forest-dark text-primary-foreground">
      {/* Main footer */}
      <div className="container-wide py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <Image
                src="/logo.png"
                alt="DR Housing"
                width={48}
                height={48}
                className="h-12 w-auto brightness-0 invert"
              />
              <span className="font-serif text-xl font-semibold">DR Housing</span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-6">
              Asesoría experta en bienes raíces de lujo en Escazú, Santa Ana y el Corredor Ruta 27. Su socio de confianza en Costa Rica.
            </p>
            <div className="flex flex-col gap-3 text-sm">
              <a
                href="tel:+50686540888"
                className="flex items-center gap-3 text-primary-foreground/80 hover:text-gold transition-colors"
              >
                <Phone className="w-4 h-4" />
                +506 8654 0888
              </a>
              <a
                href="mailto:info@drhousing.net"
                className="flex items-center gap-3 text-primary-foreground/80 hover:text-gold transition-colors"
              >
                <Mail className="w-4 h-4" />
                info@drhousing.net
              </a>
              <div className="flex items-start gap-3 text-primary-foreground/80">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>Escazú, San José, Costa Rica</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-medium mb-4">
              Enlaces Rápidos
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-serif text-lg font-medium mb-4">
              Nuestros Servicios
            </h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.name}>
                  <Link
                    href={service.href}
                    className="text-sm text-primary-foreground/70 hover:text-gold transition-colors"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-serif text-lg font-medium mb-4">
              Manténgase Informado
            </h4>
            <p className="text-sm text-primary-foreground/70 mb-4">
              Reciba actualizaciones de mercado y nuevas propiedades exclusivas.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="su@email.com"
                className="px-4 py-3 rounded bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:border-gold text-sm"
              />
              <button
                type="submit"
                className="px-4 py-3 rounded bg-gold text-forest-dark font-medium text-sm tracking-wide hover:bg-gold/90 transition-colors"
              >
                Suscribirse
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container-wide py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/60">
          <p>© {new Date().getFullYear()} DR Housing. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacidad" className="hover:text-gold transition-colors">
              Política de Privacidad
            </Link>
            <Link href="/terminos" className="hover:text-gold transition-colors">
              Términos de Servicio
            </Link>
            <Link href="/admin/login" className="hover:text-gold transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
