/** Returns a wa.me URL pointing to the lead's phone, or null if no valid phone. */
export function waLink(phone: string | null | undefined, text?: string): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (!digits) return null
  const base = `https://wa.me/${digits}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}
