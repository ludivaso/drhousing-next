import { NextRequest, NextResponse } from 'next/server'
import { getAgentBySlug } from '@/lib/agents/queries'

export const revalidate = 3600

/** Escapes a value for a vCard 3.0 text field per RFC 6350. */
function escapeVcard(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\r?\n/g, '\\n')
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { lang: string; slug: string } }
) {
  const agent = await getAgentBySlug(params.slug)
  if (!agent) {
    return new NextResponse('Not found', { status: 404 })
  }

  const lang = params.lang === 'es' ? 'es' : 'en'
  const role = (lang === 'es' ? agent.role_es : agent.role_en) || agent.role

  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${escapeVcard(agent.full_name)}`, 'ORG:DR Housing']

  if (role) lines.push(`TITLE:${escapeVcard(role)}`)
  if (agent.phone) lines.push(`TEL;TYPE=WORK,VOICE:${agent.phone}`)
  if (agent.email) lines.push(`EMAIL:${agent.email}`)
  lines.push(`URL:https://drhousing.net/${lang}/agents/${agent.slug}`)
  if (agent.service_areas && agent.service_areas.length > 0) {
    lines.push(`ADR;TYPE=WORK:;;${escapeVcard(agent.service_areas[0])};;;;Costa Rica`)
  }
  lines.push('END:VCARD')

  const body = lines.join('\r\n')

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${agent.slug}.vcf"`,
    },
  })
}
