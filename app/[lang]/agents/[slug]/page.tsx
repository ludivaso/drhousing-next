import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { MessageCircle, Phone, Mail, Download, Home, Instagram, Facebook, Linkedin } from 'lucide-react'
import { getAgentBySlug, getAgentActiveListingsCount, getTeamAgents } from '@/lib/agents/queries'
import { getSocialLinks, type SocialPlatform } from '@/lib/agents/social'
import { waLink } from '@/lib/utils/waLink'
import { buildPersonSchema } from '@/lib/seo/helpers'
import { t, type Lang } from '@/lib/i18n/dictionary'

export const revalidate = 3600
export const dynamicParams = true

const VALID_SPECIALTIES = [
  'luxury_residential',
  'investment_properties',
  'developments',
  'interior_design',
  'property_management',
  'relocation',
] as const

const SOCIAL_ICONS: Record<SocialPlatform, typeof Instagram> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
}

function resolveLang(lang: string): Lang {
  return lang === 'es' ? 'es' : 'en'
}

function withFallback(primary: string | null | undefined, fallback: string | null | undefined): string | null {
  if (primary && primary.trim()) return primary.trim()
  if (fallback && fallback.trim()) return fallback.trim()
  return null
}

export async function generateStaticParams() {
  const agents = await getTeamAgents()
  return agents.flatMap((a) => (a.slug ? [{ slug: a.slug }] : []))
}

export async function generateMetadata({ params }: { params: { lang: string; slug: string } }): Promise<Metadata> {
  const lang = resolveLang(params.lang)
  const agent = await getAgentBySlug(params.slug)
  if (!agent) return {}

  const role = withFallback(lang === 'es' ? agent.role_es : agent.role_en, agent.role)
  const intro = (lang === 'es' ? agent.intro_es : agent.intro_en)?.trim() || null
  const bio = withFallback(lang === 'es' ? agent.bio_es : agent.bio_en, agent.bio)

  const bioDescription = bio
    ? bio.length > 155
      ? bio.slice(0, 152).replace(/\s+\S*$/, '') + '...'
      : bio
    : ''

  const description = intro || bioDescription
  const title = role ? `${agent.full_name} · ${role} | DR Housing` : `${agent.full_name} | DR Housing`
  const url = `https://drhousing.net/${lang}/agents/${agent.slug}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'profile',
      siteName: 'DR Housing',
      images: agent.photo_url ? [{ url: agent.photo_url, width: 800, height: 1600, alt: agent.full_name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: agent.photo_url ? [agent.photo_url] : undefined,
    },
    alternates: {
      canonical: url,
      languages: {
        en: `https://drhousing.net/en/agents/${agent.slug}`,
        es: `https://drhousing.net/es/agents/${agent.slug}`,
        'x-default': `https://drhousing.net/en/agents/${agent.slug}`,
      },
    },
    robots: agent.is_team_member
      ? { index: true, follow: true }
      : { index: false, follow: false, googleBot: { index: false } },
  }
}

export default async function AgentProfilePage({ params }: { params: { lang: string; slug: string } }) {
  const lang = resolveLang(params.lang)
  const agent = await getAgentBySlug(params.slug)
  if (!agent) notFound()

  const role = withFallback(lang === 'es' ? agent.role_es : agent.role_en, agent.role)
  const intro = (lang === 'es' ? agent.intro_es : agent.intro_en)?.trim() || null
  const bio = withFallback(lang === 'es' ? agent.bio_es : agent.bio_en, agent.bio)

  const specialties = (agent.specialties ?? []).filter((key): key is (typeof VALID_SPECIALTIES)[number] =>
    (VALID_SPECIALTIES as readonly string[]).includes(key)
  )
  const serviceAreas = agent.service_areas ?? []
  const languages = agent.languages ?? []
  const socialLinks = getSocialLinks(agent.social)

  const activeListingsCount = await getAgentActiveListingsCount(agent.id)

  const waHref = agent.whatsapp ? waLink(agent.whatsapp, t(lang, 'agents.profile.whatsappMessage')) : null
  const telHref = agent.phone ? `tel:${agent.phone.replace(/[\s-]/g, '')}` : null
  const mailHref = agent.email ? `mailto:${agent.email}` : null
  const vcardHref = `/${lang}/agents/${agent.slug}/vcard`
  const propertiesHref = activeListingsCount > 0 ? `/${lang}/properties?agent=${agent.id}` : null

  const schema = buildPersonSchema(
    agent,
    role,
    socialLinks.map((l) => l.url),
    agent.slug!,
    lang
  )

  return (
    <div className="mx-auto w-full max-w-[700px] px-5 py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Portrait — 1:2 vertical frame, empty surface-colored when no photo */}
      <div
        className="relative mx-auto w-full max-w-[280px] overflow-hidden bg-[#F7F5F2]"
        style={{ aspectRatio: '1 / 2' }}
      >
        {agent.photo_url && (
          <Image
            src={agent.photo_url}
            alt={agent.full_name}
            fill
            priority
            sizes="(max-width: 700px) 60vw, 280px"
            className="object-cover object-center"
          />
        )}
      </div>

      {/* Name + role */}
      <div className="mt-7 text-center">
        <h1
          className="text-[28px] font-semibold leading-tight text-[#1F2023] sm:text-3xl"
          style={{ fontFamily: 'var(--font-agent-lora)' }}
        >
          {agent.full_name}
        </h1>
        {role && (
          <p className="mt-2 text-xs font-medium uppercase tracking-[0.15em] text-[#7D7D7D]">
            {role}
          </p>
        )}
      </div>

      {/* Intro — omitted entirely when missing, never a blank paragraph */}
      {intro && (
        <p className="mx-auto mt-6 max-w-[520px] text-center text-[15px] leading-relaxed text-[#555555]">
          {intro}
        </p>
      )}

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3">
        {waHref && (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-sm bg-[#1F2023] px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#34363B]"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            {t(lang, 'agents.profile.whatsapp')}
          </a>
        )}
        {telHref && (
          <a
            href={telHref}
            className="flex items-center justify-center gap-2 rounded-sm bg-[#A48B4F] px-6 py-3.5 text-sm font-medium text-[#1F2023] transition-colors hover:bg-[#B89B5D]"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {t(lang, 'agents.profile.call')}
          </a>
        )}

        {(mailHref || vcardHref || propertiesHref) && (
          <div className="flex flex-wrap gap-3">
            {mailHref && (
              <a
                href={mailHref}
                className="flex min-w-[140px] flex-1 items-center justify-center gap-2 rounded-sm border border-[#E7E2DA] bg-white px-4 py-3 text-sm text-[#444444] transition-colors hover:bg-[#F7F5F2]"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                {t(lang, 'agents.profile.email')}
              </a>
            )}
            <a
              href={vcardHref}
              className="flex min-w-[140px] flex-1 items-center justify-center gap-2 rounded-sm border border-[#E7E2DA] bg-white px-4 py-3 text-sm text-[#444444] transition-colors hover:bg-[#F7F5F2]"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              {t(lang, 'agents.profile.saveContact')}
            </a>
            {propertiesHref && (
              <a
                href={propertiesHref}
                className="flex min-w-[140px] flex-1 items-center justify-center gap-2 rounded-sm border border-[#E7E2DA] bg-white px-4 py-3 text-sm text-[#444444] transition-colors hover:bg-[#F7F5F2]"
              >
                <Home className="h-4 w-4" aria-hidden="true" />
                {t(lang, 'agents.profile.viewProperties')}
              </a>
            )}
          </div>
        )}
      </div>

      {/* Bio */}
      {bio && (
        <div className="mt-10 border-t border-[#E7E2DA] pt-8">
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-[#555555]">{bio}</p>
        </div>
      )}

      {/* Specialties + Areas served */}
      {(specialties.length > 0 || serviceAreas.length > 0) && (
        <div className="mt-10 grid grid-cols-1 gap-8 border-t border-[#E7E2DA] pt-8 sm:grid-cols-2">
          {specialties.length > 0 && (
            <div>
              <h2
                className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1F2023]"
                style={{ fontFamily: 'var(--font-agent-lora)' }}
              >
                {t(lang, 'agents.profile.specialtiesHeading')}
              </h2>
              <ul className="mt-4 space-y-2">
                {specialties.map((key) => (
                  <li key={key} className="text-sm text-[#555555]">
                    {t(lang, `agents.specialties.${key}`)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {serviceAreas.length > 0 && (
            <div>
              <h2
                className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1F2023]"
                style={{ fontFamily: 'var(--font-agent-lora)' }}
              >
                {t(lang, 'agents.profile.areasHeading')}
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {serviceAreas.map((area) => (
                  <span
                    key={area}
                    className="rounded-full bg-[#F7F5F2] px-3 py-1 text-xs text-[#555555] transition-colors hover:bg-[#A48B4F] hover:text-white"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <p className="mt-8 text-center text-xs text-[#7D7D7D]">{languages.join(' · ')}</p>
      )}

      {/* Social */}
      {socialLinks.length > 0 && (
        <div className="mt-8 flex justify-center gap-5 border-t border-[#E7E2DA] pt-8">
          {socialLinks.map(({ platform, url }) => {
            const Icon = SOCIAL_ICONS[platform]
            return (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={platform}
                className="text-[#7D7D7D] transition-colors hover:text-[#A48B4F]"
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </a>
            )
          })}
        </div>
      )}

      {/* Institutional footer */}
      <div className="mt-12 rounded-sm bg-[#F7F5F2] p-6 text-center">
        <p
          className="text-lg font-semibold text-[#1F2023]"
          style={{ fontFamily: 'var(--font-agent-lora)' }}
        >
          DR Housing
        </p>
        <p className="mt-1 text-xs text-[#7D7D7D]">{t(lang, 'agents.profile.orgTagline')}</p>
        {mailHref && (
          <a
            href={mailHref}
            className="mt-3 inline-block text-xs text-[#A48B4F] transition-colors hover:underline"
          >
            {agent.email}
          </a>
        )}
      </div>
    </div>
  )
}
