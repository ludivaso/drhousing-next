/** Returns a wa.me URL pointing to the lead's phone, or null if no valid phone. */
export function waLink(phone: string | null | undefined, text?: string): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (!digits) return null
  const base = `https://wa.me/${digits}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}

/**
 * Builds the personalised WhatsApp opening message for a lead.
 * Extracts first name and the Encuentra24 ad title from `notes`.
 */
export function buildLeadMessage(
  fullName: string | null | undefined,
  notes: string | null | undefined,
): string {
  const firstName = fullName?.trim().split(/\s+/)[0] ?? ''
  const greeting = firstName ? `Hola ${firstName}` : 'Hola'

  let anuncio = 'una de nuestras propiedades'
  if (notes) {
    const match = notes.match(/Anuncio:\s*(.+?)\s*\|\s*Origen E24:/)
    if (match?.[1]?.trim()) anuncio = match[1].trim()
  }

  return `${greeting}, soy Diego Vargas de DR Housing. Vi que te interesó ${anuncio} y con gusto te ayudo personalmente. Para mostrarte justo lo que buscás: ¿qué fue lo que más te llamó la atención de esta propiedad?`
}
