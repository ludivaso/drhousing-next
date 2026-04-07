'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useI18n } from '@/lib/i18n/context'

const CARDS = [
  {
    titleEn: 'Portfolio',
    titleEs: 'Portafolio',
    subtitleEn: 'Luxury homes & investments',
    subtitleEs: 'Propiedades de lujo e inversión',
    href: '/propiedades',
    image:
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80&auto=format&fit=crop',
  },
  {
    titleEn: 'Developments',
    titleEs: 'Desarrollos',
    subtitleEn: 'New construction & pre-sales',
    subtitleEs: 'Construcción nueva y preventas',
    href: '/desarrollos',
    image:
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80&auto=format&fit=crop',
  },
  {
    titleEn: 'Interior Design',
    titleEs: 'Diseño Interior',
    subtitleEn: 'Curated living spaces',
    subtitleEs: 'Espacios diseñados a medida',
    href: '/servicios',
    image:
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80&auto=format&fit=crop',
  },
]

export default function ServicesPanels() {
  const { lang } = useI18n()

  return (
    <div className="flex flex-col md:grid md:grid-cols-3 w-full md:h-[520px]">
      {CARDS.map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className="group relative overflow-hidden h-72 md:h-full cursor-pointer block"
        >
          {/* Background image — grayscale by default, colour on hover */}
          <Image
            src={card.image}
            alt={lang === 'en' ? card.titleEn : card.titleEs}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-all duration-500 grayscale group-hover:grayscale-0"
            unoptimized
          />

          {/* Dark overlay — lightens on hover */}
          <div className="absolute inset-0 bg-black/55 group-hover:bg-black/30 transition-colors duration-500" />

          {/* Centered text content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            {/* Title — scales up on hover */}
            <h3
              className="font-serif text-[28px] font-semibold text-white leading-tight
                         transition-transform duration-500 group-hover:scale-105"
            >
              {lang === 'en' ? card.titleEn : card.titleEs}
            </h3>

            {/* Subtitle — fades in on hover */}
            <p
              className="mt-3 text-sm font-sans text-white/80
                         opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            >
              {lang === 'en' ? card.subtitleEn : card.subtitleEs}
            </p>

            {/* CTA — slides up + fades in on hover */}
            <span
              className="mt-5 text-xs font-sans font-medium tracking-widest uppercase text-white/90
                         opacity-0 group-hover:opacity-100
                         translate-y-4 group-hover:translate-y-0
                         transition-all duration-500"
            >
              {lang === 'en' ? 'Explore' : 'Explorar'} →
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
