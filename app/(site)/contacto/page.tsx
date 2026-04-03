'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Phone, Mail, MapPin, MessageSquare, Send, Loader2 } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

const COSTA_RICA_AREAS = [
  'Escazú', 'Santa Ana', 'Lindora', 'Ciudad Colón', 'Belén',
  'La Guácima', 'Alajuela', 'Heredia', 'Sabana', 'Rohrmoser',
  'Guanacaste', 'Jacó',
]

const contactFormSchema = z.object({
  fullName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(1).max(30),
  preferredContactMethod: z.enum(['email', 'phone', 'whatsapp'] as const),
  leadType: z.enum(['general', 'buying', 'selling', 'relocation', 'legal_immigration', 'property_management'] as const),
  countryOfOrigin: z.string().trim().max(100).optional().or(z.literal('')),
  timeline: z.enum(['exploring', 'within_3_months', 'within_6_months', 'within_year', 'over_year']).optional(),
  budgetMin: z.string().optional(),
  budgetMax: z.string().optional(),
  interestedAreas: z.array(z.string()).default([]),
  message: z.string().trim().max(2000).optional().or(z.literal('')),
})

type ContactFormData = z.infer<typeof contactFormSchema>

export default function ContactoPage() {
  const { t, lang } = useI18n()
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { interestedAreas: [] },
  })

  const interestedAreas = watch('interestedAreas')

  const handleAreaToggle = (area: string) => {
    const current = interestedAreas ?? []
    const updated = current.includes(area)
      ? current.filter((a) => a !== area)
      : [...current, area]
    setValue('interestedAreas', updated)
  }

  const onSubmit = async (data: ContactFormData) => {
    setSubmitError(null)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/submit-lead`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: data.fullName,
            email: data.email,
            phone: data.phone,
            message: data.message || '',
            lead_type: data.leadType,
            preferred_contact_method: data.preferredContactMethod,
            source_campaign: 'contact-page',
            country_of_origin: data.countryOfOrigin || null,
            timeline: data.timeline ?? 'exploring',
            budget_min: data.budgetMin ? parseInt(data.budgetMin, 10) : null,
            budget_max: data.budgetMax ? parseInt(data.budgetMax, 10) : null,
            interested_areas: data.interestedAreas,
          }),
        }
      )
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error((json as { error?: string }).error ?? 'Error al enviar')
      }
      setSubmitted(true)
      reset()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (lang === 'en' ? 'Error sending. Please try again.' : 'Error al enviar. Inténtelo de nuevo.')
      setSubmitError(msg)
    }
  }

  const LEAD_TYPE_OPTIONS: Record<string, string> = {
    general:             lang === 'en' ? 'General Inquiry'         : 'Consulta General',
    buying:              lang === 'en' ? 'Buy Property'            : 'Comprar Propiedad',
    selling:             lang === 'en' ? 'Sell Property'           : 'Vender Propiedad',
    relocation:          lang === 'en' ? 'Relocation'              : 'Relocalización',
    legal_immigration:   lang === 'en' ? 'Legal / Immigration'     : 'Legal / Inmigración',
    property_management: lang === 'en' ? 'Property Management'     : 'Administración de Propiedad',
  }

  const TIMELINE_OPTIONS: Record<string, string> = {
    exploring:       lang === 'en' ? 'Just exploring'         : 'Solo explorando',
    within_3_months: lang === 'en' ? 'Within 3 months'        : 'En los próximos 3 meses',
    within_6_months: lang === 'en' ? 'Within 6 months'        : 'En los próximos 6 meses',
    within_year:     lang === 'en' ? 'Within a year'          : 'En el próximo año',
    over_year:       lang === 'en' ? 'More than a year'       : 'Más de un año',
  }

  const CONTACT_METHOD_OPTIONS: Record<string, string> = {
    email:    lang === 'en' ? 'Email'    : 'Correo Electrónico',
    phone:    lang === 'en' ? 'Phone'    : 'Teléfono',
    whatsapp: 'WhatsApp',
  }

  return (
    <>
      {/* Header */}
      <section className="bg-forest-dark text-primary-foreground py-16">
        <div className="container-wide">
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold mb-4">
            {t('contactPage.title')}
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">
            {t('contactPage.description')}
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-8">
                {t('contactPage.getInTouch')}
              </h2>

              <div className="space-y-8 mb-10">
                <a href="tel:+50686540888" className="flex items-start gap-4 group">
                  <div className="w-14 h-14 rounded bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{t('contactPage.phone')}</h4>
                    <p className="text-muted-foreground">+506 8654-0888</p>
                    <p className="text-sm text-muted-foreground/70">{t('contactPage.phoneHours')}</p>
                  </div>
                </a>

                <a href="mailto:info@drhousing.net" className="flex items-start gap-4 group">
                  <div className="w-14 h-14 rounded bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{t('contactPage.email')}</h4>
                    <p className="text-muted-foreground">info@drhousing.net</p>
                    <p className="text-sm text-muted-foreground/70">{t('contactPage.emailResponse')}</p>
                  </div>
                </a>

                <a
                  href="https://wa.me/50686540888"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 group"
                >
                  <div className="w-14 h-14 rounded bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{t('contactPage.whatsapp')}</h4>
                    <p className="text-muted-foreground">+506 8654-0888</p>
                    <p className="text-sm text-muted-foreground/70">{t('contactPage.whatsappResponse')}</p>
                  </div>
                </a>

                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{t('contactPage.office')}</h4>
                    <p className="text-muted-foreground">Escazú, San José</p>
                    <p className="text-sm text-muted-foreground/70">Costa Rica</p>
                  </div>
                </div>
              </div>

              {/* Google Maps embed */}
              <div className="rounded overflow-hidden border border-border mb-10">
                <iframe
                  title="DR Housing Office Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15719.847392214!2d-84.14842!3d9.9277!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa0fb6c0f4c3c5f%3A0x3c8c51e9c45e6c2d!2sEscaz%C3%BA%2C%20San%20Jos%C3%A9%20Province%2C%20Costa%20Rica!5e0!3m2!1sen!2sus!4v1709712000000!5m2!1sen!2sus"
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="space-y-3">
                <a
                  href="tel:+50686540888"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {t('common.callNow')}
                </a>
                <a
                  href="https://wa.me/50686540888"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded border border-border text-foreground text-sm font-medium hover:bg-secondary transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="card-elevated p-8 sm:p-10">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                      <Send className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">
                      {t('contactPage.successTitle')}
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      {t('contactPage.successDesc')}
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="text-sm text-primary hover:underline"
                    >
                      {t('contact.sendAnother')}
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">
                      {t('contactPage.sendMessage')}
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      {t('contactPage.sendMessageDesc')}
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      {/* Basic Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">
                            {t('contactPage.fullName')} *
                          </label>
                          <input
                            {...register('fullName')}
                            placeholder={lang === 'en' ? 'John Smith' : 'Juan García'}
                            className="w-full px-4 py-2.5 rounded border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                          />
                          {errors.fullName && (
                            <p className="text-destructive text-xs mt-1">{errors.fullName.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">
                            {t('contactPage.emailLabel')} *
                          </label>
                          <input
                            {...register('email')}
                            type="email"
                            placeholder={lang === 'en' ? 'john@example.com' : 'juan@ejemplo.com'}
                            className="w-full px-4 py-2.5 rounded border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                          />
                          {errors.email && (
                            <p className="text-destructive text-xs mt-1">{errors.email.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">
                            {t('contactPage.phoneLabel')} *
                          </label>
                          <input
                            {...register('phone')}
                            placeholder="+1 555-123-4567"
                            className="w-full px-4 py-2.5 rounded border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                          />
                          {errors.phone && (
                            <p className="text-destructive text-xs mt-1">{errors.phone.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">
                            {t('contactPage.preferredContact')} *
                          </label>
                          <select
                            {...register('preferredContactMethod')}
                            className="w-full px-4 py-2.5 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                          >
                            <option value="">{t('contactPage.select')}</option>
                            {Object.entries(CONTACT_METHOD_OPTIONS).map(([v, l]) => (
                              <option key={v} value={v}>{l}</option>
                            ))}
                          </select>
                          {errors.preferredContactMethod && (
                            <p className="text-destructive text-xs mt-1">{errors.preferredContactMethod.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">
                            {t('contactPage.interestedIn')} *
                          </label>
                          <select
                            {...register('leadType')}
                            className="w-full px-4 py-2.5 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                          >
                            <option value="">{t('contactPage.select')}</option>
                            {Object.entries(LEAD_TYPE_OPTIONS).map(([v, l]) => (
                              <option key={v} value={v}>{l}</option>
                            ))}
                          </select>
                          {errors.leadType && (
                            <p className="text-destructive text-xs mt-1">{errors.leadType.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">
                            {t('contactPage.countryOfOrigin')}
                          </label>
                          <input
                            {...register('countryOfOrigin')}
                            placeholder={lang === 'en' ? 'United States' : 'Estados Unidos'}
                            className="w-full px-4 py-2.5 rounded border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                          />
                        </div>
                      </div>

                      {/* Timeline & Budget */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">
                            {t('contactPage.timeline')}
                          </label>
                          <select
                            {...register('timeline')}
                            className="w-full px-4 py-2.5 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                          >
                            <option value="">{t('contactPage.select')}</option>
                            {Object.entries(TIMELINE_OPTIONS).map(([v, l]) => (
                              <option key={v} value={v}>{l}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">
                            {t('contactPage.minBudget')}
                          </label>
                          <input
                            {...register('budgetMin')}
                            type="number"
                            placeholder="$200,000"
                            className="w-full px-4 py-2.5 rounded border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">
                            {t('contactPage.maxBudget')}
                          </label>
                          <input
                            {...register('budgetMax')}
                            type="number"
                            placeholder="$500,000"
                            className="w-full px-4 py-2.5 rounded border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                          />
                        </div>
                      </div>

                      {/* Areas */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          {t('contactPage.areasOfInterest')}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {COSTA_RICA_AREAS.map((area) => (
                            <button
                              key={area}
                              type="button"
                              onClick={() => handleAreaToggle(area)}
                              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                                interestedAreas?.includes(area)
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                              }`}
                            >
                              {area}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Message */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                          {t('contactPage.message')}
                        </label>
                        <textarea
                          {...register('message')}
                          rows={4}
                          placeholder={t('contactPage.messagePlaceholder')}
                          className="w-full px-4 py-2.5 rounded border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
                        />
                      </div>

                      {submitError && (
                        <p className="text-destructive text-sm">{submitError}</p>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t('contactPage.sending')}
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            {t('contactPage.sendBtn')}
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
