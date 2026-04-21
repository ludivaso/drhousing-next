'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LayoutDashboard } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()
  const lang = pathname.startsWith('/es') ? 'es' : 'en'
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
    setEmail('')
  }

  return (
    <footer className="bg-[#1A1A1A] text-white">
      {/* ── Main row ── */}
      <div className="container-wide py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 items-start">

          {/* Col 1 — Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo.png"
                alt="DR Housing"
                width={36}
                height={36}
                className="h-9 w-auto brightness-0 invert opacity-80"
              />
              <span className="font-serif text-base font-medium tracking-wide">DR Housing</span>
            </div>
            <p className="text-xs text-primary-foreground/40 tracking-widest uppercase">
              Escazú · Santa Ana · Costa Rica
            </p>
          </div>

          {/* Col 2 — Contact */}
          <div className="flex flex-col gap-3">
            <a
              href="tel:+50686540888"
              className="text-sm text-primary-foreground/60 hover:text-gold transition-colors duration-300"
            >
              +506 8654-0888
            </a>
            <a
              href="mailto:info@drhousing.net"
              className="text-sm text-primary-foreground/60 hover:text-gold transition-colors duration-300"
            >
              info@drhousing.net
            </a>
          </div>

          {/* Col 3 — Newsletter (inline, minimal) */}
          <div>
            <p className="text-xs text-primary-foreground/40 tracking-widest uppercase mb-4">
              {lang === 'en' ? 'Market Intelligence' : 'Inteligencia de Mercado'}
            </p>

            {submitted ? (
              <p className="text-sm text-gold/70 italic">
                {lang === 'en' ? 'Thank you.' : 'Gracias.'}
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-center border-b border-primary-foreground/20 focus-within:border-gold/50 transition-colors duration-300">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={lang === 'en' ? 'Your email' : 'Tu correo'}
                  className="flex-1 bg-transparent text-sm text-primary-foreground placeholder:text-primary-foreground/30 py-2 focus:outline-none min-w-0"
                />
                <button
                  type="submit"
                  className="pl-3 py-2 text-primary-foreground/40 hover:text-gold transition-colors duration-300 text-sm"
                  aria-label="Subscribe"
                >
                  →
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-primary-foreground/[0.07]">
        <div className="container-wide py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-primary-foreground/25">
          <p>© {new Date().getFullYear()} DR Housing</p>
          <div className="flex items-center gap-6">
            <Link href={`/${lang}/privacidad`} className="hover:text-primary-foreground/50 transition-colors">
              Privacy
            </Link>
            <Link href={`/${lang}/terminos`} className="hover:text-primary-foreground/50 transition-colors">
              Terms
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-1.5 hover:text-gold/40 transition-colors duration-300"
              title="Admin"
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
