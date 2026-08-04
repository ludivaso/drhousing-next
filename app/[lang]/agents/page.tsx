import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getTeamAgents } from '@/lib/agents/queries'
import { t, type Lang } from '@/lib/i18n/dictionary'

export const revalidate = 3600

function resolveLang(lang: string): Lang {
  return lang === 'es' ? 'es' : 'en'
}

function withFallback(primary: string | null | undefined, fallback: string | null | undefined): string | null {
  if (primary && primary.trim()) return primary.trim()
  if (fallback && fallback.trim()) return fallback.trim()
  return null
}

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const lang = resolveLang(params.lang)
  return {
    title: t(lang, 'agents.title'),
    description: t(lang, 'agents.description'),
    alternates: {
      canonical: `https://drhousing.net/${lang}/agents`,
      languages: {
        'en': 'https://drhousing.net/en/agents',
        'es': 'https://drhousing.net/es/agents',
        'x-default': 'https://drhousing.net/en/agents',
      },
    },
    robots: { index: true, follow: true },
  }
}

export default async function AgentsIndexPage({ params }: { params: { lang: string } }) {
  const lang = resolveLang(params.lang)
  const agents = await getTeamAgents()

  return (
    <div className="mx-auto w-full max-w-[700px] px-5 py-12 sm:py-16">
      <div className="text-center">
        <h1
          className="text-[28px] font-semibold leading-tight text-[#1F2023] sm:text-3xl"
          style={{ fontFamily: 'var(--font-agent-lora)' }}
        >
          {t(lang, 'agents.title')}
        </h1>
        <p className="mx-auto mt-3 max-w-[480px] text-[15px] leading-relaxed text-[#555555]">
          {t(lang, 'agents.description')}
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-6 sm:gap-8">
        {agents.map((agent) => {
          const role = withFallback(lang === 'es' ? agent.role_es : agent.role_en, agent.role)
          return (
            <Link
              key={agent.id}
              href={`/${lang}/agents/${agent.slug}`}
              className="group block"
            >
              <div
                className="relative w-full overflow-hidden bg-[#F7F5F2]"
                style={{ aspectRatio: '1 / 2' }}
              >
                {agent.photo_url && (
                  <Image
                    src={agent.photo_url}
                    alt={agent.full_name}
                    fill
                    sizes="(max-width: 700px) 40vw, 320px"
                    className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                )}
              </div>
              <div className="mt-3 text-center">
                <p
                  className="text-sm font-semibold text-[#1F2023]"
                  style={{ fontFamily: 'var(--font-agent-lora)' }}
                >
                  {agent.full_name}
                </p>
                {role && (
                  <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[#7D7D7D]">
                    {role}
                  </p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
