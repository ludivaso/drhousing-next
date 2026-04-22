import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

const SYSTEM = `You are an expert at extracting real estate development project information.
Extract all available information and return ONLY a valid JSON object with these fields (omit fields with no clear data):

{
  "name_en": "Project name in English",
  "name_es": "Project name in Spanish (if bilingual, otherwise same as English)",
  "subtitle_en": "Short subtitle / tagline in English (1 sentence)",
  "subtitle_es": "Short subtitle in Spanish",
  "description_en": "2-4 paragraph project description in English",
  "description_es": "2-4 paragraph project description in Spanish",
  "slug": "url-safe-slug-from-name",
  "location": "Neighborhood / area name",
  "zone": "One of: Escazu, Santa Ana, La Guacima, Ciudad Colon, Rohrmoser, Alajuela, Guanacaste, Pacifico Sur",
  "status": "One of: pre_sale, in_construction, delivered, sold_out",
  "delivery_date": "YYYY-MM-DD or null",
  "price_from": 000000,
  "price_to": 000000,
  "unit_count": 0,
  "amenities": ["Amenity 1", "Amenity 2"],
  "developer_name": "Developer company name",
  "brochure_url": "https://... or null",
  "video_url": "https://youtube.com/embed/... or null"
}

Rules:
- Return ONLY the JSON object, no markdown, no explanation
- status must be exactly one of the four values above
- amenities should be concise English names (Pool, 24/7 Security, Gym, etc.)
- slug should be lowercase, hyphens only, no accents
- If content is in Spanish only, still produce English fields by translating
- price_from and price_to should be numbers (USD), not strings`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { type: 'text' | 'url'; content: string }

    let textContent = ''

    if (body.type === 'url') {
      // Server-side fetch to avoid CORS; extract readable text
      const res = await fetch(body.content, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DRHousing-Bot/1.0)' },
        signal: AbortSignal.timeout(10_000),
      })
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
      const html = await res.text()
      // Strip HTML tags and collapse whitespace
      textContent = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s{2,}/g, ' ')
        .trim()
        .slice(0, 15_000) // stay within token budget
    } else {
      textContent = body.content
    }

    const msg = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 2048,
      system: SYSTEM,
      messages: [{ role: 'user', content: textContent }],
    })

    const raw = (msg.content[0] as { type: string; text: string }).text.trim()

    // Pull the JSON out even if model adds any surrounding text
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON in response')
    const data = JSON.parse(match[0])

    return NextResponse.json({ ok: true, data })
  } catch (err) {
    console.error('[dev-extract]', err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}

// ── Document (PDF / text file) extraction ─────────────────────────────────────
// Sent as multipart form: field "file" with the document.
export async function PUT(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ ok: false, error: 'No file' }, { status: 400 })

    const arrayBuf = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuf).toString('base64')
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')

    // Claude supports PDF as a document block; plain text files go as text.
    const userContent: Anthropic.MessageParam['content'] = isPdf
      ? [
          {
            type: 'document' as const,
            source: {
              type: 'base64' as const,
              media_type: 'application/pdf' as const,
              data: base64,
            },
          },
          {
            type: 'text' as const,
            text: 'Extract all real estate development information from this document and return the JSON object.',
          },
        ]
      : Buffer.from(arrayBuf).toString('utf-8').slice(0, 15_000)

    const msg = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 2048,
      system: SYSTEM,
      messages: [{ role: 'user', content: userContent }],
    })

    const raw = (msg.content[0] as { type: string; text: string }).text.trim()
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON in response')
    const data = JSON.parse(match[0])

    return NextResponse.json({ ok: true, data })
  } catch (err) {
    console.error('[dev-extract-doc]', err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
