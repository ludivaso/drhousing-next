'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

export default function Footer() {
  const { t } = useI18n()
  const [email, setEmail] = useState('')

  const quickLinks = [
    { nameKey: 'header.properties', href: '/propiedades' },
    { nameKey: 'header.agents',     href: '/agentes' },
    { nameKey: 'header.services',   href: '/servicios' },
    { name: 'Blog & Market Insights', href: '/blog' },
    { name: 'Desarrollos & Preventa', href: '/desarrollos' },
    { nameKey: 'header.toolsInsights', href: '/herramientas' },
    { name: 'West GAM Guide',         href: '/guia-west-gam' },
    { nameKey: 'header.contact',      href: '/contacto' },
  ]

  const services = [
    { nameKey: 'footer.buySell',             href: '/servicios#brokerage' },
    { nameKey: 'footer.propertyManagement',  href: '/servicios#management' },
    { nameKey: 'footer.legalImmigration',    href: '/servicios#legal' },
    { nameKey: 'footer.development',         href: '/servicios#development' },
    { nameKey: 'header.familyAffairs',       href: '/family-affairs' },
  ]

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    setEmail('')
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
              {t('footer.description')}
            </p>
            <div className="flex flex-col gap-3 text-sm">
              <a
                href="tel:+50660775000"
                className="flex items-center gap-3 text-primary-foreground/80 hover:text-gold transition-colors"
              >
                <Phone className="w-4 h-4" />
                +506 6077-5000
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
                <span>{t('footer.location')}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-medium mb-4">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-gold transition-colors"
                  >
                    {link.nameKey ? t(link.nameKey) : link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-serif text-lg font-medium mb-4">
              {t('footer.ourServices')}
            </h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.href}>
                  <Link
                    href={service.href}
                    className="text-sm text-primary-foreground/70 hover:text-gold transition-colors"
                  >
                    {t(service.nameKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-serif text-lg font-medium mb-4">
              {t('footer.stayInformed')}
            </h4>
            <p className="text-sm text-primary-foreground/70 mb-4">
              {t('footer.newsletterText')}
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('common.yourEmail')}
                className="px-4 py-3 rounded bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:border-gold text-sm"
              />
              <button
                type="submit"
                className="px-4 py-3 rounded bg-gold text-forest-dark font-medium text-sm tracking-wide hover:bg-gold/90 transition-colors"
              >
                {t('common.subscribe')}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container-wide py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/60">
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
          <div className="flex items-center gap-6">
            <Link href="/privacidad" className="hover:text-gold transition-colors">
              {t('footer.privacyPolicy')}
            </Link>
            <Link href="/terminos" className="hover:text-gold transition-colors">
              {t('footer.termsOfService')}
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
