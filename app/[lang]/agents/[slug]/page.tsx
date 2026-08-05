import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import {
  MessageCircle, Phone, Mail, User, Home,
  TrendingUp, Building2, Sofa, Landmark, Globe,
  Instagram, Facebook, Linkedin,
  type LucideIcon,
} from 'lucide-react'
import { getAgentBySlug, getAgentActiveListingsCount, getTeamAgents } from '@/lib/agents/queries'
import { getSocialLinks, type SocialPlatform } from '@/lib/agents/social'
import { waLink } from '@/lib/utils/waLink'
import { buildPersonSchema } from '@/lib/seo/helpers'
import { t, type Lang } from '@/lib/i18n/dictionary'

export const revalidate = 3600
export const dynamicParams = true

// Doubles as the whitelist of valid specialty keys — a stray value in the DB
// is dropped rather than rendered as a raw key.
const SPECIALTY_ICONS = {
  luxury_residential:    Home,
  investment_properties: TrendingUp,
  developments:          Building2,
  interior_design:       Sofa,
  property_management:   Landmark,
  relocation:            Globe,
} satisfies Record<string, LucideIcon>

type SpecialtyKey = keyof typeof SPECIALTY_ICONS

const SOCIAL_ICONS: Record<SocialPlatform, LucideIcon> = {
  instagram: Instagram,
  facebook:  Facebook,
  linkedin:  Linkedin,
}

function resolveLang(lang: string): Lang {
  return lang === 'es' ? 'es' : 'en'
}

function withFallback(primary: string | null | undefined, fallback: string | null | undefined): string | null {
  if (primary && primary.trim()) return primary.trim()
  if (fallback && fallback.trim()) return fallback.trim()
  return null
}

/** Section label: uppercase, letterspaced, with the short gold rule beneath. */
function Eyebrow({
  children,
  tone = 'gray',
  center = false,
}: {
  children: React.ReactNode
  tone?: 'gray' | 'ink'
  center?: boolean
}) {
  return (
    <p
      className={`text-[9px] font-medium uppercase tracking-[0.2em] after:mt-[9px] after:block after:h-[1.5px] after:w-[26px] after:bg-[#A48B4F] after:content-[''] ${
        tone === 'ink' ? 'text-[#1F2023]' : 'text-[#7D7D7D]'
      } ${center ? 'after:mx-auto' : ''}`}
    >
      {children}
    </p>
  )
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

  const specialties = (agent.specialties ?? []).filter(
    (key): key is SpecialtyKey => key in SPECIALTY_ICONS
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

  // How many of the three info blocks carry data — a lone block spans the full
  // width instead of sitting in a half-empty two-column row.
  const infoBlocks = [specialties.length, serviceAreas.length, languages.length].filter(Boolean).length

  const schema = buildPersonSchema(
    agent,
    role,
    socialLinks.map((l) => l.url),
    agent.slug!,
    lang
  )

  const btnBase =
    'flex items-center gap-[10px] rounded-sm px-[18px] py-[13px] text-[10.5px] font-medium uppercase tracking-[0.14em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A48B4F]'
  const btnQuiet = `${btnBase} border border-[#E7E2DA] bg-white text-[#444444] hover:bg-[#F7F5F2]`
  const rule = 'my-[34px] h-px bg-[#E7E2DA]'

  return (
    <div className="mx-auto w-full max-w-[700px] px-5 py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* ── Header: portrait left, text right ─────────────────────────── */}
      <div className="flex flex-col gap-5 min-[520px]:flex-row min-[520px]:items-start min-[520px]:gap-[26px]">
        {/* Portrait — 1:2 vertical. Empty surface-colored frame when no photo. */}
        <div
          className="relative w-[150px] flex-none overflow-hidden bg-[#F7F5F2] min-[520px]:w-[186px]"
          style={{ aspectRatio: '1 / 2' }}
        >
          {agent.photo_url && (
            <Image
              src={agent.photo_url}
              alt={agent.full_name}
              fill
              priority
              sizes="(max-width: 520px) 150px, 186px"
              className="object-cover object-center"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h1
            className="mb-3 text-[31px] font-semibold leading-[1.08] tracking-[-0.015em] text-[#1F2023] min-[520px]:text-[38px]"
            style={{ fontFamily: 'var(--font-agent-lora)', textWrap: 'balance' }}
          >
            {agent.full_name}
          </h1>

          {role && (
            <p className="mb-[18px] text-[9.5px] font-medium uppercase tracking-[0.18em] text-[#7D7D7D]">
              {role}
            </p>
          )}

          {/* No fallback for intro — the paragraph is dropped, not left blank. */}
          {intro && (
            <p className="mb-[22px] text-[13.5px] leading-[1.62] text-[#555555]">{intro}</p>
          )}

          <div className="flex flex-col gap-[9px]">
            {waHref && (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`${btnBase} bg-[#1F2023] text-white hover:bg-[#34363B]`}
              >
                <MessageCircle className="h-[14px] w-[14px] flex-none" aria-hidden="true" />
                {t(lang, 'agents.profile.whatsapp')}
              </a>
            )}
            {telHref && (
              <a href={telHref} className={`${btnBase} bg-[#A48B4F] text-[#1F2023] hover:bg-[#B89B5D]`}>
                <Phone className="h-[14px] w-[14px] flex-none" aria-hidden="true" />
                {t(lang, 'agents.profile.call')}
              </a>
            )}
            {mailHref && (
              <a href={mailHref} className={btnQuiet}>
                <Mail className="h-[14px] w-[14px] flex-none" aria-hidden="true" />
                {t(lang, 'agents.profile.email')}
              </a>
            )}
            <a href={vcardHref} className={btnQuiet}>
              <User className="h-[14px] w-[14px] flex-none" aria-hidden="true" />
              {t(lang, 'agents.profile.saveContact')}
            </a>
            {propertiesHref && (
              <a href={propertiesHref} className={btnQuiet}>
                <Home className="h-[14px] w-[14px] flex-none" aria-hidden="true" />
                {t(lang, 'agents.profile.viewProperties')}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Specialties · Areas · Languages ───────────────────────────── */}
      {infoBlocks > 0 && (
        <>
          <div className={rule} />
          <div className={infoBlocks > 1 ? 'grid gap-[30px] sm:grid-cols-2' : ''}>
            {specialties.length > 0 && (
              <div>
                <Eyebrow>{t(lang, 'agents.profile.specialtiesHeading')}</Eyebrow>
                <ul className="mt-4 flex flex-col gap-[11px]">
                  {specialties.map((key) => {
                    const Icon = SPECIALTY_ICONS[key]
                    return (
                      <li key={key} className="flex items-center gap-[10px] text-[12.5px] text-[#555555]">
                        <Icon className="h-[15px] w-[15px] flex-none text-[#A48B4F]" aria-hidden="true" />
                        {t(lang, `agents.specialties.${key}`)}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {serviceAreas.length > 0 && (
              <div>
                <Eyebrow>{t(lang, 'agents.profile.areasHeading')}</Eyebrow>
                <div className="mt-4 flex flex-wrap gap-[7px]">
                  {serviceAreas.map((area) => (
                    <span
                      key={area}
                      className="rounded-full bg-[#F7F5F2] px-3 py-1.5 text-[11px] text-[#555555] transition-colors hover:bg-[#A48B4F] hover:text-white"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {languages.length > 0 && (
              <div>
                <Eyebrow>{t(lang, 'agents.profile.languagesHeading')}</Eyebrow>
                <p className="mt-4 text-[12.5px] text-[#555555]">{languages.join(' · ')}</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Bio ───────────────────────────────────────────────────────── */}
      {bio && (
        <>
          <div className={rule} />
          <div>
            <Eyebrow>{t(lang, 'agents.profile.aboutHeading')}</Eyebrow>
            <p className="mt-4 whitespace-pre-line text-[13px] leading-[1.72] text-[#555555]">{bio}</p>
          </div>
        </>
      )}

      {/* ── Institutional block ───────────────────────────────────────── */}
      <div className="mt-[34px] bg-[#F7F5F2] p-[26px]">
        <Eyebrow tone="ink">DR Housing</Eyebrow>
        <p className="mt-4 text-[12.5px] leading-[1.72] text-[#555555]">
          {t(lang, 'agents.profile.orgDescription')}
        </p>
      </div>

      {/* ── Social ────────────────────────────────────────────────────── */}
      {socialLinks.length > 0 && (
        <>
          <div className={rule} />
          <div className="text-center">
            <div className="inline-block">
              <Eyebrow center>{t(lang, 'agents.profile.socialHeading')}</Eyebrow>
            </div>
            <div className="mt-5 flex justify-center gap-8 sm:gap-11">
              {socialLinks.map(({ platform, url }) => {
                const Icon = SOCIAL_ICONS[platform]
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-[9px] text-[#7D7D7D] transition-colors hover:text-[#A48B4F]"
                  >
                    <Icon className="h-[17px] w-[17px]" aria-hidden="true" />
                    <span className="text-[8px] uppercase tracking-[0.16em]">{platform}</span>
                  </a>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
