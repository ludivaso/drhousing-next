'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin, LayoutDashboard } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

export default function Footer() {
  const { lang } = useI18n()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setEmail('')
  }

  return (
    <footer className="bg-forest-dark text-primary-foreground">
      {/* Main body */}
      <div className="container-wide py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-10 items-start">

          {/* ── Brand + Contact ── */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <Image
                src="/logo.png"
                alt="DR Housing"
                width={44}
                height={44}
                className="h-11 w-auto brightness-0 invert"
              />
              <span className="font-serif text-xl font-semibold">DR Housing</span>
            </div>

            <div className="flex items-start gap-2 text-primary-foreground/50 text-sm mb-6">
              <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gold/50" />
              <span>Escazú · Santa Ana · Costa Rica</span>
            </div>

            <div className="space-y-2.5">
              <a
                href="tel:+50686540888"
                className="flex items-center gap-2.5 text-sm text-primary-foreground/60 hover:text-gold transition-colors duration-300"
              >
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                +506 8654-0888
              </a>
              <a
                href="mailto:info@drhousing.net"
                className="flex items-center gap-2.5 text-sm text-primary-foreground/60 hover:text-gold transition-colors duration-300"
              >
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                info@drhousing.net
              </a>
            </div>
          </div>

          {/* ── CTA ── */}
          <div className="flex flex-col items-center justify-center text-center md:pt-2">
            <p className="font-serif text-lg font-medium text-primary-foreground mb-2">
              {lang === 'en' ? 'Ready to Begin?' : '¿Listo para Empezar?'}
            </p>
            <p className="text-xs text-primary-foreground/40 mb-8 max-w-[200px] leading-relaxed">
              {lang === 'en'
                ? 'Private advisory. No commitment required.'
                : 'Asesoría privada. Sin compromiso.'}
            </p>
            <Link
              href="/contacto"
              className="inline-block px-8 py-3 border border-gold/40 text-gold/90 text-xs
                         tracking-widest uppercase hover:bg-gold hover:text-forest-dark
                         transition-all duration-300 font-medium"
            >
              {lang === 'en' ? 'Request Consultation' : 'Solicitar Consulta'}
            </Link>
          </div>

          {/* ── Newsletter ── */}
          <div>
            <p className="font-serif text-base font-medium text-primary-foreground mb-2">
              {lang === 'en' ? 'Market Intelligence' : 'Inteligencia de Mercado'}
            </p>
            <p className="text-xs text-primary-foreground/40 mb-5 leading-relaxed">
              {lang === 'en'
                ? 'Curated insights and exclusive listings — delivered privately.'
                : 'Análisis de mercado y propiedades exclusivas, en privado.'}
            </p>

            {submitted ? (
              <p className="text-sm text-gold/80 italic">
                {lang === 'en'
                  ? "Thank you — we'll be in touch."
                  : 'Gracias, estaremos en contacto.'}
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={
                    lang === 'en' ? 'Your email address' : 'Tu correo electrónico'
                  }
                  className="px-4 py-3 bg-primary-foreground/5 border border-primary-foreground/15
                             text-primary-foreground placeholder:text-primary-foreground/30
                             focus:outline-none focus:border-gold/40 text-sm transition-colors"
                />
                <button
                  type="submit"
                  className="px-4 py-3 bg-transparent border border-primary-foreground/20
                             text-primary-foreground/60 text-xs tracking-widest uppercase
                             hover:border-gold/40 hover:text-gold transition-all duration-300"
                >
                  {lang === 'en' ? 'Subscribe' : 'Suscribirse'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-primary-foreground/10">
        <div className="container-wide py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-primary-foreground/30">
          <p>© {new Date().getFullYear()} DR Housing. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacidad" className="hover:text-primary-foreground/60 transition-colors">
              Privacy
            </Link>
            <Link href="/terminos" className="hover:text-primary-foreground/60 transition-colors">
              Terms
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-primary-foreground/20
                         hover:text-gold/50 transition-all duration-300"
              title="Admin Dashboard"
            >
              <LayoutDashboard className="w-3 h-3" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
