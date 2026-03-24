import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// ── Types ────────────────────────────────────────────────────────────────────

interface GenerateListingInput {
  /** Free-form raw notes from the agent (required) */
  raw_input: string
  /** Property type hint e.g. "casa", "apartamento", "terreno" */
  property_type?: string
  /** Location hint e.g. "Escazú, Costa Rica" */
  location?: string
  /** Target language: "es" | "en" | "both" */
  language?: 'es' | 'en' | 'both'
  /** Tone: "luxury" | "standard" | "affordable" */
  tone?: 'luxury' | 'standard' | 'affordable'
}

interface GenerateListingOutput {
  title_es:       string
  title_en:       string
  description_es: string
  description_en: string
  meta_title_es:       string
  meta_title_en:       string
  meta_description_es: string
  meta_description_en: string
  suggested_tags_es: string[]
  suggested_tags_en: string[]
}

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a professional bilingual real estate copywriter for DR Housing,
a premium real estate agency in Costa Rica specializing in San José, Escazú, Santa Ana,
Guachipelín, La Guácima, Ciudad Colón, and Belén.

Your job is to take raw agent notes about a property and produce polished, SEO-optimized
real estate listing copy in both Spanish and English.

Guidelines:
- Spanish is primary; English adapts tone for international buyers (North American / European)
- Match the requested tone: "luxury" = aspirational & upscale, "standard" = warm & professional, "affordable" = practical & value-focused
- Titles: max 80 chars, specific (include bedrooms/location when known), no ALL CAPS, no emojis
- Descriptions: 120–200 words, present tense, highlight lifestyle + location + key specs, end with subtle CTA
- Meta titles: max 60 chars, include property type + location
- Meta descriptions: max 155 chars, include price signal or key benefit
- Tags: 5–8 descriptive strings, no duplicates, title-case in English / sentence-case in Spanish
- Avoid clichés: "oasis", "paradise", "dream home", "nestled"
- Output ONLY valid JSON matching the specified schema — no prose, no markdown fences`

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // 1. Auth guard — only server-side calls (or logged-in admin via cookie)
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not configured on server' },
      { status: 503 }
    )
  }

  // 2. Parse body
  let body: GenerateListingInput
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { raw_input, property_type, location, language = 'both', tone = 'standard' } = body

  if (!raw_input?.trim()) {
    return NextResponse.json({ error: '`raw_input` is required' }, { status: 400 })
  }

  // 3. Build user prompt
  const userPrompt = `Generate listing copy for a property with these details:

AGENT NOTES:
${raw_input.trim()}

CONTEXT:
- Property type: ${property_type ?? 'unknown'}
- Location: ${location ?? 'Costa Rica'}
- Language: ${language}
- Tone: ${tone}

Return a single JSON object with these exact keys:
{
  "title_es": string,
  "title_en": string,
  "description_es": string,
  "description_en": string,
  "meta_title_es": string,
  "meta_title_en": string,
  "meta_description_es": string,
  "meta_description_en": string,
  "suggested_tags_es": string[],
  "suggested_tags_en": string[]
}`

  // 4. Call Anthropic
  const client = new Anthropic({ apiKey })

  try {
    const message = await client.messages.create({
      model:      'claude-opus-4-5',
      max_tokens: 1024,
      system:     SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    // Extract text content
    const raw = message.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('')
      .trim()

    // Parse JSON — strip any accidental markdown fences
    const jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
    const parsed: GenerateListingOutput = JSON.parse(jsonStr)

    // Validate required keys
    const required: (keyof GenerateListingOutput)[] = [
      'title_es', 'title_en', 'description_es', 'description_en',
      'meta_title_es', 'meta_title_en', 'meta_description_es', 'meta_description_en',
      'suggested_tags_es', 'suggested_tags_en',
    ]
    for (const key of required) {
      if (!(key in parsed)) {
        return NextResponse.json(
          { error: `AI response missing field: ${key}`, raw },
          { status: 502 }
        )
      }
    }

    return NextResponse.json({ data: parsed }, { status: 200 })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[generate-listing]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Disable edge runtime — Anthropic SDK requires Node.js
export const runtime = 'nodejs'
