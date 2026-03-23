'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Home, Scale, Building2, Briefcase, ArrowRight, Phone, Palette } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

const SERVICE_DEFS = [
  { id: 'brokerage',     icon: Home,      image: '/services/real-estate-brokerage.jpg', featureCount: 5 },
  { id: 'legal',         icon: Scale,     image: '/services/legal-immigration.jpg',     featureCount: 5 },
  { id: 'development',   icon: Building2, image: '/services/development-remodeling.jpg',featureCount: 5 },
  { id: 'interiorDesign',icon: Palette,   image: '/services/interior-design.jpg',       featureCount: 6 },
  { id: 'management',    icon: Briefcase, image: '/services/property-management.jpg',   featureCount: 5 },
]

export default function ServiciosPage() {
  const { t } = useI18n()

  const services = SERVICE_DEFS.map((s) => ({
    ...s,
    subtitle:    t(`services.${s.id}.subtitle`),
    title:       t(`services.${s.id}.title`),
    description: t(`services.${s.id}.description`),
    features:    Array.from({ length: s.featureCount }, (_, i) => t(`services.${s.id}.feature${i + 1}`)),
  }))

  return (
    <>
      {/* Hero */}
      <section className="bg-forest-dark text-primary-foreground py-16">
        <div className="container-wide">
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold mb-4">
            {t('services.title')}
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">
            {t('services.description')}
          </p>
        </div>
      </section>

      {/* Services — alternating 2-col layout */}
      <section className="section-padding bg-background">
        <div className="container-wide space-y-20">
          {services.map((service, index) => (
            <div
              key={service.id}
              id={service.id}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              {/* Text */}
              <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded bg-primary/10 flex items-center justify-center">
                    <service.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground tracking-wide">
                      {service.subtitle}
                    </p>
                    <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground">
                      {service.title}
                    </h2>
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed mb-8">
                  {service.description}
                </p>

                <ul className="space-y-4 mb-8">
                  {service.features.map((feature, fi) => (
                    <li key={fi} className="flex items-start gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold mt-2.5 flex-shrink-0" />
                      <span className="text-muted-foreground leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contacto"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  {t('services.inquire')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Image */}
              <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                <div className="aspect-[4/3] rounded overflow-hidden shadow-lg">
                  <Image
                    src={service.image}
                    alt={service.title}
                    width={800}
                    height={600}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Family Affairs strip */}
      <section className="bg-secondary py-12">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                {t('services.privateAdvisory')}
              </h3>
              <p className="text-muted-foreground">
                {t('services.privateAdvisoryDesc')}
              </p>
            </div>
            <Link
              href="/family-affairs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded border border-border text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              {t('header.familyAffairs')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-serif text-2xl font-semibold mb-2">
                {t('services.readyStart')}
              </h3>
              <p className="text-primary-foreground/80">
                {t('services.readyStartDesc')}
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contacto"
                className="inline-flex items-center px-6 py-3 rounded bg-gold text-forest-dark font-medium text-sm hover:bg-gold/90 transition-colors"
              >
                {t('common.scheduleConsultation')}
              </Link>
              <a
                href="tel:+50660775000"
                className="inline-flex items-center gap-2 px-6 py-3 rounded border border-primary-foreground/30 text-primary-foreground text-sm font-medium hover:bg-primary-foreground/10 transition-colors"
              >
                <Phone className="w-4 h-4" />
                {t('common.callNow')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
