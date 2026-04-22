// SHA-256 of the raw PIN. Adequate for a preview gate:
//   - hash is stored server-side only (never exposed to clients)
//   - rotating the PIN invalidates all existing cookies automatically
//   - brute force is limited by PIN length (min 4 digits, enforced in UI)
//
// Works on both Edge (middleware) and Node runtimes via Web Crypto API.

export async function hashPin(pin: string): Promise<string> {
  const bytes = new TextEncoder().encode(pin.trim())
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export const PREVIEW_COOKIE = 'dr_preview_pin'
