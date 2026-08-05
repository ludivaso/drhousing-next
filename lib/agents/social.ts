export type SocialPlatform = 'instagram' | 'facebook' | 'x' | 'linkedin'

/**
 * The only keys read from the `social` jsonb column, in the fixed order they
 * render. The object's own key order is never used. Note the X slot is `x`,
 * not `twitter`.
 */
const SOCIAL_PLATFORMS: SocialPlatform[] = ['instagram', 'facebook', 'x', 'linkedin']

/** Brand names — proper nouns, so they are never translated. */
export const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  facebook:  'Facebook',
  x:         'X',
  linkedin:  'LinkedIn',
}

const SOCIAL_HOSTS: Record<SocialPlatform, string> = {
  instagram: 'instagram.com',
  facebook:  'facebook.com',
  x:         'x.com',
  linkedin:  'linkedin.com',
}

/**
 * Accepts either a full URL or a bare username. A stored URL is used verbatim,
 * so query strings (?igsh=, ?mibextid=) survive untouched; only a bare handle
 * gets a domain prepended.
 */
export function resolveSocialUrl(platform: SocialPlatform, value: string): string {
  const v = value.trim()
  if (/^https?:\/\//i.test(v)) return v

  const handle = v.replace(/^@/, '').replace(/^\/+/, '').replace(/\/+$/, '')
  if (platform === 'linkedin') {
    // A bare handle is a person; anything already carrying a segment
    // (company/…, school/…) is preserved as given.
    return handle.includes('/')
      ? `https://linkedin.com/${handle}`
      : `https://linkedin.com/in/${handle}`
  }
  return `https://${SOCIAL_HOSTS[platform]}/${handle}`
}

export interface SocialLink {
  platform: SocialPlatform
  url: string
}

/**
 * Non-empty social links from the `social` jsonb column, always in
 * SOCIAL_PLATFORMS order. Unknown keys are ignored; a null column or one with
 * no populated key yields an empty array so the caller can skip the block
 * entirely.
 */
export function getSocialLinks(social: unknown): SocialLink[] {
  if (!social || typeof social !== 'object' || Array.isArray(social)) return []
  const obj = social as Record<string, unknown>

  return SOCIAL_PLATFORMS.flatMap((platform) => {
    const raw = obj[platform]
    if (typeof raw !== 'string' || raw.trim().length === 0) return []
    return [{ platform, url: resolveSocialUrl(platform, raw) }]
  })
}
