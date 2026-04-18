'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

type ContactMode = 'whatsapp' | 'email' | 'call'

interface Props {
  lang: 'en' | 'es'
  devName: string
}

// ── InquiryForm ──────────────────────────────────────────────────────────────
// Dark inquiry form for the detail page. Currently client-only — the submit
// handler just flips to a thank-you state. Wire to a backend endpoint (or
// Supabase function) in a later phase; the form data shape already matches
// the lead intake schema in use elsewhere on the site.
export default function InquiryForm({ lang, devName }: Props) {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [phone, setPhone]     = useState('')
  const [message, setMessage] = useState('')
  const [mode, setMode]       = useState<ContactMode>('whatsapp')
  const [sent, setSent]       = useState(false)

  const t = {
    eyebrow:       lang === 'es' ? 'Contacto' : 'Inquire',
    title:         lang === 'es' ? `Solicite información sobre ${devName}` : `Request information on ${devName}`,
    name:          lang === 'es' ? 'Nombre completo' : 'Full name',
    email:         lang === 'es' ? 'Correo electrónico' : 'Email',
    phone:         lang === 'es' ? 'Teléfono' : 'Phone',
    message:       lang === 'es' ? 'Mensaje' : 'Message',
    messagePh:     lang === 'es'
      ? 'Cuéntenos qué busca, plazos y preferencias de unidad.'
      : 'Tell us what you are looking for, your timeline, and unit preferences.',
    preference:    lang === 'es' ? 'Prefiero que me contacten por' : 'Preferred contact',
    whatsapp:      'WhatsApp',
    emailMode:     lang === 'es' ? 'Correo' : 'Email',
    call:          lang === 'es' ? 'Llamada' : 'Call',
    submit:        lang === 'es' ? 'Enviar solicitud' : 'Send request',
    thanksTitle:   lang === 'es' ? 'Gracias por su interés' : 'Thank you',
    thanksBody:    lang === 'es'
      ? 'Un asesor de DR Housing se pondrá en contacto dentro de las próximas 24 horas.'
      : 'A DR Housing advisor will be in touch within the next 24 hours.',
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: wire to backend — for now just flip to thanks state
    setSent(true)
  }

  if (sent) {
    return (
      <div className="bg-[#2C2C2C] text-white rounded-2xl p-10 md:p-14">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#C9A96E] flex items-center justify-center">
            <Check className="w-5 h-5 text-[#1A1A1A]" />
          </div>
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-[#C9A96E]">
            {t.eyebrow}
          </p>
        </div>
        <h3 className="font-serif text-3xl md:text-4xl font-light leading-tight">
          {t.thanksTitle}
        </h3>
        <p className="mt-4 font-sans text-white/80 leading-relaxed max-w-md">
          {t.thanksBody}
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#2C2C2C] text-white rounded-2xl p-8 md:p-12"
    >
      <p className="font-sans text-xs tracking-[0.3em] uppercase text-[#C9A96E] mb-4">
        {t.eyebrow}
      </p>
      <h3 className="font-serif text-2xl md:text-3xl font-light leading-tight mb-8">
        {t.title}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field
          id="dev-inq-name"
          label={t.name}
          value={name}
          onChange={setName}
          required
        />
        <Field
          id="dev-inq-email"
          label={t.email}
          value={email}
          onChange={setEmail}
          type="email"
          required
        />
        <Field
          id="dev-inq-phone"
          label={t.phone}
          value={phone}
          onChange={setPhone}
          type="tel"
          className="md:col-span-2"
        />
        <div className="md:col-span-2">
          <label
            htmlFor="dev-inq-msg"
            className="block font-sans text-xs tracking-widest uppercase text-white/60 mb-2"
          >
            {t.message}
          </label>
          <textarea
            id="dev-inq-msg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder={t.messagePh}
            className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-3 font-sans text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#C9A96E] focus-visible:ring-2 focus-visible:ring-[#C9A96E]"
          />
        </div>
      </div>

      <fieldset className="mt-8">
        <legend className="font-sans text-xs tracking-widest uppercase text-white/60 mb-3">
          {t.preference}
        </legend>
        <div className="flex flex-wrap gap-2">
          {([
            { v: 'whatsapp', label: t.whatsapp },
            { v: 'email',    label: t.emailMode },
            { v: 'call',     label: t.call },
          ] as const).map((opt) => {
            const active = mode === opt.v
            return (
              <button
                key={opt.v}
                type="button"
                onClick={() => setMode(opt.v)}
                className={`
                  px-4 py-2 rounded-full font-sans text-xs tracking-widest uppercase transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]
                  ${active
                    ? 'bg-[#C9A96E] text-[#1A1A1A]'
                    : 'border border-white/20 text-white/80 hover:border-[#C9A96E] hover:text-white'}
                `}
                aria-pressed={active}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </fieldset>

      <button
        type="submit"
        className="mt-10 w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-[#C9A96E] text-[#1A1A1A] font-sans text-sm font-medium tracking-widest uppercase hover:bg-[#B89558] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        {t.submit}
      </button>
    </form>
  )
}

interface FieldProps {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
  className?: string
}

function Field({ id, label, value, onChange, type = 'text', required, className = '' }: FieldProps) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block font-sans text-xs tracking-widest uppercase text-white/60 mb-2"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-3 font-sans text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#C9A96E] focus-visible:ring-2 focus-visible:ring-[#C9A96E]"
      />
    </div>
  )
}
