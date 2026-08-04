export type SocialPlatform = 'instagram' | 'facebook' | 'linkedin'

const SOCIAL_PLATFORMS: SocialPlatform[] = ['instagram', 'facebook', 'linkedin']

/** Accepts either a full URL or a bare handle (with or without a leading @) in the `social` jsonb column. */
export function resolveSocialUrl(platform: SocialPlatform, value: string): string {
  const v = value.trim()
  if (/^https?:\/\//i.test(v)) return v

  const handle = v.replace(/^@/, '').replace(/\/+$/, '')
  if (platform === 'linkedin') {
    return handle.includes('/') ? `https://linkedin.com/${handle}` : `https://linkedin.com/in/${handle}`
  }
  return `https://${platform}.com/${handle}`
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
    const raw = obj[platform]
    if (typeof raw !== 'string' || raw.trim().length === 0) return []
    return [{ platform, url: resolveSocialUrl(platform, raw) }]
  })
}
