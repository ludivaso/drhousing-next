import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const E24_API_KEY = process.env.E24_API_KEY!;
const E24_SLUG = process.env.E24_SLUG!;
const CRON_SECRET = process.env.CRON_SECRET!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Limpia el teléfono de E24: "00506 71868672" -> "+50671868672"
function normalizePhone(raw: string | null): string | null {
  if (!raw) return null;
  let p = raw.replace(/\s+/g, '').trim();
  if (p.startsWith('00')) p = '+' + p.slice(2);
  else if (!p.startsWith('+')) p = '+' + p;
  return p;
}

// Decodifica entidades HTML del mensaje de E24
function decodeEntities(s: string | null): string | null {
  if (!s) return null;
  return s
    .replace(/&quot;/g, '"')
    .replace(/&oacute;/g, 'ó')
    .replace(/&iacute;/g, 'í')
    .replace(/&aacute;/g, 'á')
    .replace(/&eacute;/g, 'é')
    .replace(/&uacute;/g, 'ú')
    .replace(/&ntilde;/g, 'ñ')
    .replace(/&amp;/g, '&');
}

export async function GET(req: NextRequest) {
  // Seguridad: solo corre con el token correcto
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // 1. Traer últimos leads de Encuentra24
  const url = `https://www.encuentra24.com/api.php/v1/crm/index?slug=${E24_SLUG}&limit=50`;
  let e24Data;
  try {
    const res = await fetch(url, {
      headers: {
        'x-api-key': E24_API_KEY,
        'User-Agent': BROWSER_UA,
        Accept: 'application/json',
      },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: 'E24 fetch failed', status: res.status },
        { status: 502 }
      );
    }
    e24Data = await res.json();
  } catch (err) {
    return NextResponse.json({ error: 'E24 unreachable', detail: String(err) }, { status: 502 });
  }

  // La API devuelve array directo o {data:[...]} según los parámetros
  const leads = Array.isArray(e24Data) ? e24Data : e24Data.data || [];

  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const lead of leads) {
    const e24LeadId = lead.id;
    if (!e24LeadId) continue;

    // 2. ¿Ya existe? (anti-duplicado)
    const { data: existing } = await supabase
      .from('leads')
      .select('id')
      .eq('e24_lead_id', e24LeadId)
      .maybeSingle();

    if (existing) {
      skipped++;
      continue;
    }

    // 3. Mapear E24 -> tu tabla leads
    const contact = lead.contact || {};
    const row = {
      e24_lead_id: e24LeadId,
      e24_ad_id: lead.adid || null,
      lead_type: 'general',
      full_name: contact.name || 'Sin nombre',
      email: contact.email || 'sincorreo@drhousing.net',
      phone: normalizePhone(contact.phone),
      preferred_contact_method: 'whatsapp',
      message: decodeEntities(lead.message) || decodeEntities(lead.preview),
      notes: `Anuncio: ${lead.title || 'N/D'} | Origen E24: ${lead.origin || 'N/D'}`,
      status: 'new',
      source_campaign: 'encuentra24',
      timeline: 'exploring',
      created_at: lead.created_at
        ? new Date(lead.created_at * 1000).toISOString()
        : new Date().toISOString(),
    };

    const { error } = await supabase.from('leads').insert(row);
    if (error) {
      errors.push(`Lead ${e24LeadId}: ${error.message}`);
    } else {
      inserted++;
    }
  }

  return NextResponse.json({
    ok: true,
    fetched: leads.length,
    inserted,
    skipped,
    errors,
    ranAt: new Date().toISOString(),
  });
}
