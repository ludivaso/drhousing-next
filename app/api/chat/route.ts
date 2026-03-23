import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `Eres el asistente virtual de DR Housing, una firma de bienes raíces de lujo especializada en el Corredor Oeste de Costa Rica (Escazú, Santa Ana, Lindora y la Ruta 27).

Tu función es ayudar a compradores internacionales, inversionistas y familias que se relocalizan a Costa Rica.

REGLAS:
- Responde siempre en español (a menos que el usuario escriba en inglés — entonces responde en inglés)
- Sé conciso, profesional y cálido
- Para consultas específicas de propiedades o cotizaciones, invita al usuario a contactar directamente: +506 8654 0888 o info@drhousing.net
- No inventes precios ni disponibilidades específicas
- Puedes orientar sobre el mercado, zonas, proceso de compra, residencia, etc.
- Máximo 3-4 oraciones por respuesta

CONTEXTO DEL MERCADO:
- Zonas principales: Escazú, Santa Ana, Lindora, Ciudad Colón, Belén
- Rangos de precio: apartamentos $150K-$800K+, casas $350K-$3M+
- Tasa de apreciación histórica: 5-8% anual en propiedades de lujo
- El corredor oeste es la zona de mayor crecimiento de CR`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages } = body as {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 })
    }

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: messages.slice(-10), // Keep last 10 messages for context
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response type' }, { status: 500 })
    }

    return NextResponse.json({ message: content.text })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Error al procesar su consulta. Por favor intente de nuevo.' },
      { status: 500 }
    )
  }
}
