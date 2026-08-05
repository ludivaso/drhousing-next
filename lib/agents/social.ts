export type SocialPlatform = 'facebook' | 'instagram' | 'x' | 'linkedin'

/** Display order on the profile. */
const SOCIAL_PLATFORMS: SocialPlatform[] = ['facebook', 'instagram', 'x', 'linkedin']

/**
 * Keys accepted from the `social` jsonb column, in priority order. Aliases let
 * the admin store either the current or the legacy name without the profile
 * silently dropping the link.
 */
const SOCIAL_KEYS: Record<SocialPlatform, string[]> = {
  facebook:  ['facebook', 'fb'],
  instagram: ['instagram', 'ig'],
  x:         ['x', 'twitter'],
  linkedin:  ['linkedin'],
}

/** Brand names — proper nouns, so they are never translated. */
export const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  facebook:  'Facebook',
  instagram: 'Instagram',
  x:         'X',
  linkedin:  'LinkedIn',
}

const SOCIAL_HOSTS: Record<SocialPlatform, string> = {
  facebook:  'facebook.com',
  instagram: 'instagram.com',
  x:         'x.com',
  linkedin:  'linkedin.com',
}

/** Accepts either a full URL or a bare handle (with or without a leading @) in the `social` jsonb column. */
export function resolveSocialUrl(platform: SocialPlatform, value: string): string {
  const v = value.trim()
  if (/^https?:\/\//i.test(v)) return v

  const handle = v.replace(/^@/, '').replace(/\/+$/, '')
  if (platform === 'linkedin') {
    // Bare handles are people; anything already containing a segment (company/…)
    // is passed through untouched.
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

/** Extracts non-empty social links from the `social` jsonb column, skipping unknown keys. */
export function getSocialLinks(social: unknown): SocialLink[] {
  if (!social || typeof social !== 'object') return []
  const obj = social as Record<string, unknown>

  return SOCIAL_PLATFORMS.flatMap((platform) => {
    for (const key of SOCIAL_KEYS[platform]) {
      const raw = obj[key]
      if (typeof raw === 'string' && raw.trim().length > 0) {
        return [{ platform, url: resolveSocialUrl(platform, raw) }]
      }
    }
    return []
  })
}
