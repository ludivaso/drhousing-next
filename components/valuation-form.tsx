'use client'

import { useState, type FormEvent } from 'react'
import { Loader2, CheckCircle } from 'lucide-react'

interface ValuationFormProps {
  lang: 'en' | 'es'
}

const LOCATIONS = [
  'Escazú',
  'Santa Ana',
  'La Guácima',
  'Lindora',
  'Other',
]

function formatPhone(raw: string): string {
  const stripped = raw.replace(/\s+/g, '')
  if (stripped.startsWith('+')) return stripped
  if (stripped.startsWith('506')) return `+${stripped}`
  return `+506${stripped}`
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export default function ValuationForm({ lang }: ValuationFormProps) {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [locationError, setLocationError] = useState(false)
  const [sizeSqm, setSizeSqm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEs = lang === 'es'

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!fullName.trim() || !phone.trim()) return

    // Validate location explicitly — empty string means placeholder not changed
    if (!location) {
      setLocationError(true)
      return
    }
    setLocationError(false)

    setSubmitting(true)
    setError(null)

    const formattedPhone = formatPhone(phone)
    const lookingFor = `Property valuation — ${location}${sizeSqm ? ` — ${sizeSqm}m²` : ''}`

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/submit-lead`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: fullName.trim(),
            email: '',
            phone: formattedPhone,
            message: lookingFor,
            lead_type: 'selling',
            preferred_contact_method: 'whatsapp',
            source_campaign: 'sellers_lp',
            country_of_origin: null,
            timeline: 'exploring',
            budget_min: null,
            budget_max: null,
            interested_areas: [location],
          }),
        }
      )

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error((json as { error?: string }).error ?? 'Error')
      }

      setSubmitted(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEs
          ? 'Error al enviar. Inténtalo de nuevo.'
          : 'Error sending. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const locationLabel = location || (isEs ? 'mi área' : 'my area')
  const waText = isEs
    ? `Hola, soy ${fullName}. Quiero una valoración gratuita de mi propiedad en ${locationLabel}${sizeSqm ? `, ${sizeSqm}m²` : ''}.`
    : `Hello, I'm ${fullName}. I'd like a free valuation for my property in ${locationLabel}${sizeSqm ? `, ${sizeSqm}m²` : ''}.`
  const waUrl = `https://wa.me/50686540888?text=${encodeURIComponent(waText)}`

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
          {isEs ? '¡Solicitud recibida!' : 'Request received!'}
        </h3>
        <p className="text-muted-foreground text-sm mb-6">
          {isEs
            ? 'Te contactaremos pronto para tu valoración gratuita.'
            : "We'll reach out shortly for your free valuation."}
        </p>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#25D366] text-white font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <WhatsAppIcon />
          {isEs ? 'Continuar por WhatsApp' : 'Continue on WhatsApp'}
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder={isEs ? 'Tu nombre completo' : 'Your full name'}
          required
          className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm min-h-[48px]"
        />
      </div>

      <div>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={isEs ? 'Tu WhatsApp (+506 o internacional)' : 'Your WhatsApp (+506 or intl.)'}
          required
          className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm min-h-[48px]"
        />
      </div>

      <div>
        <select
          value={location}
          onChange={(e) => { setLocation(e.target.value); setLocationError(false) }}
          required
          className={`w-full px-4 py-3 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm min-h-[48px] ${
            locationError ? 'border-red-500' : 'border-input'
          } ${!location ? 'text-muted-foreground' : ''}`}
        >
          <option value="" disabled>
            {isEs ? 'Selecciona la ubicación' : 'Select property location'}
          </option>
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc === 'Other' ? (isEs ? 'Otra' : 'Other') : loc}
            </option>
          ))}
        </select>
        {locationError && (
          <p className="text-red-600 text-xs mt-1">
            {isEs ? 'Por favor selecciona una ubicación' : 'Please select a location'}
          </p>
        )}
      </div>

      <div>
        <input
          type="number"
          value={sizeSqm}
          onChange={(e) => setSizeSqm(e.target.value)}
          placeholder={isEs ? 'Tamaño aprox. en m² (opcional)' : 'Approx. size in m² (optional)'}
          min={0}
          className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm min-h-[48px]"
        />
      </div>

      {error && (
        <div className="space-y-3">
          <p className="text-red-600 text-sm">{error}</p>
          <a
            href={`https://wa.me/50686540888?text=${encodeURIComponent(
              isEs ? 'Hola, quiero vender mi propiedad.' : 'Hello, I want to sell my property.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#25D366] text-white font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <WhatsAppIcon />
            {isEs ? 'Contactar por WhatsApp' : 'Contact via WhatsApp'}
          </a>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-[#C9A96E] text-[#1A1A1A] font-semibold text-sm min-h-[52px] hover:bg-[#b8945c] transition-colors disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {isEs ? 'Enviando...' : 'Sending...'}
          </>
        ) : isEs ? (
          'Solicitar valoración gratuita'
        ) : (
          'Request free valuation'
        )}
      </button>
    </form>
  )
}
