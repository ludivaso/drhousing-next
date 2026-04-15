/**
 * reassign-amenities.mjs
 * Remaps all dirty amenity/feature data in the DR Housing Supabase DB
 * to the 32-item canonical list with EN + ES columns.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co SUPABASE_KEY=eyJ... node scripts/reassign-amenities.mjs
 *
 * Or with a .env.local file in the project root:
 *   node scripts/reassign-amenities.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// ── Load env from .env.local if present ──────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '..', '.env.local')

if (existsSync(envPath)) {
  const lines = readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
  console.log('Loaded credentials from .env.local')
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
                  || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                  || process.env.SUPABASE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('ERROR: Missing SUPABASE_URL and/or SUPABASE_KEY.')
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── Canonical data ─────────────────────────────────────────────────────────────

const CANONICAL_EN = [
  'Pool','Jacuzzi','Gym','Spa','Sauna','Garden','Terrace',
  'BBQ Area','Walking Trails','Security','Gated Community',
  'Furnished','Pet Friendly','Concierge','Air Conditioning',
  'Smart Home','Solar Panels','Backup Generator','EV Charger',
  'Home Theater','Wine Cellar','Guest House','Golf Course',
  'Tennis Court','Paddle Court','Clubhouse','Playground',
  'Mountain Views','City Views','Valley Views','Ocean Views',
  'Forest Views',
]

const ES_MAP = {
  'Pool':             'Piscina',
  'Jacuzzi':          'Jacuzzi',
  'Gym':              'Gimnasio',
  'Spa':              'Spa',
  'Sauna':            'Sauna',
  'Garden':           'Jardín',
  'Terrace':          'Terraza',
  'BBQ Area':         'Área de BBQ',
  'Walking Trails':   'Senderos',
  'Security':         'Seguridad',
  'Gated Community':  'Comunidad Cerrada',
  'Furnished':        'Amueblado',
  'Pet Friendly':     'Acepta Mascotas',
  'Concierge':        'Conserje',
  'Air Conditioning': 'Aire Acondicionado',
  'Smart Home':       'Casa Inteligente',
  'Solar Panels':     'Paneles Solares',
  'Backup Generator': 'Planta Eléctrica',
  'EV Charger':       'Cargador Eléctrico',
  'Home Theater':     'Sala de Cine',
  'Wine Cellar':      'Bodega de Vinos',
  'Guest House':      'Casa de Huéspedes',
  'Golf Course':      'Campo de Golf',
  'Tennis Court':     'Cancha de Tenis',
  'Paddle Court':     'Cancha de Pádel',
  'Clubhouse':        'Casa Club',
  'Playground':       'Parque Infantil',
  'Mountain Views':   'Vistas a la Montaña',
  'City Views':       'Vistas a la Ciudad',
  'Valley Views':     'Vistas al Valle',
  'Ocean Views':      'Vistas al Mar',
  'Forest Views':     'Vistas al Bosque',
}

// COMMUNITY-LEVEL amenities for condos/apartments when present
const COMMUNITY_AMENITIES = new Set([
  'Gated Community','Gym','Pool','Spa','Concierge',
  'Walking Trails','Clubhouse','Playground','Sauna',
])

// KEYWORD_MAP: [patterns, canonical EN name]
// Patterns are lowercased substring matches
const KEYWORD_MAP = [
  [['pool','piscina','alberca'],                                               'Pool'],
  [['jacuzzi','tina caliente','bañera','whirlpool'],                           'Jacuzzi'],
  [['gym','gimnasio','fitness'],                                               'Gym'],
  [['sauna'],                                                                  'Sauna'],
  [['spa'],                                                                    'Spa'],
  [['garden','jardin','jardín'],                                               'Garden'],
  [['terrace','terraza','balcon','balcón','deck','porch','loggia'],            'Terrace'],
  [['bbq','barbecue','barbacoa','parrilla','rancho','grill','fire pit'],       'BBQ Area'],
  [['trail','sendero','walk'],                                                 'Walking Trails'],
  [['gated','comunidad cerrada','acceso control','controlled access','garita','portón'], 'Gated Community'],
  [['security','seguridad','camera','cámara','cctv','alarm','guardia','vigilancia','cerca electrica','electric fence'], 'Security'],
  [['furnished','amueblado','mueble'],                                         'Furnished'],
  [['pet','mascota','animal'],                                                 'Pet Friendly'],
  [['concierge','conserje','recepcion','recepción'],                           'Concierge'],
  [['air con','ac ','a/c ','aire acondicionado','acondicionado','split','minisplit','hvac','cooling'], 'Air Conditioning'],
  [['smart','lutron','crestron','domotica','domótica','automation','automated'], 'Smart Home'],
  [['solar'],                                                                  'Solar Panels'],
  [['generator','generador','planta electrica','planta eléctrica','ups','backup power'], 'Backup Generator'],
  [['ev ','electric car','cargador electrico','cargador eléctrico','charger','charging'], 'EV Charger'],
  [['theater','theatre','cinema','cine','screening'],                          'Home Theater'],
  [['wine','vino','cellar','bodega'],                                          'Wine Cellar'],
  [['guest house','casa huesped','casa de huesped'],                           'Guest House'],
  [['golf'],                                                                   'Golf Course'],
  [['tennis','tenis'],                                                         'Tennis Court'],
  [['paddle','padel','pádel','pickleball'],                                    'Paddle Court'],
  [['clubhouse','club house','casa club','salon comunal','salon de eventos'],  'Clubhouse'],
  [['playground','parque infantil','niños','juegos'],                          'Playground'],
  [['mountain view','vista montaña','vista a la montaña','vistas montaña'],   'Mountain Views'],
  [['city view','vista ciudad','vistas ciudad'],                               'City Views'],
  [['valley view','vista valle','vistas al valle'],                            'Valley Views'],
  [['ocean view','sea view','vista mar','vistas al mar'],                      'Ocean Views'],
  [['forest view','vista bosque','vistas bosque'],                             'Forest Views'],
]

// ── Mapping logic ─────────────────────────────────────────────────────────────

function mapToCanonical(str) {
  const lower = str.toLowerCase().trim()
  // First check if it's already a canonical EN name
  if (CANONICAL_EN.includes(str.trim())) return str.trim()
  // Check if it's a canonical ES name
  for (const [en, es] of Object.entries(ES_MAP)) {
    if (es.toLowerCase() === lower) return en
  }
  // Keyword matching
  for (const [keywords, canonical] of KEYWORD_MAP) {
    if (keywords.some(k => lower.includes(k))) return canonical
  }
  return null // discard
}

function processProperty(prop) {
  // Collect all existing strings from all 6 columns
  const allRaw = [
    ...(prop.features      ?? []),
    ...(prop.amenities     ?? []),
    ...(prop.features_en   ?? []),
    ...(prop.features_es   ?? []),
    ...(prop.amenities_en  ?? []),
    ...(prop.amenities_es  ?? []),
  ]

  // Map each to canonical EN name, deduplicate
  const mapped = new Set()
  for (const raw of allRaw) {
    if (!raw || typeof raw !== 'string') continue
    const canonical = mapToCanonical(raw)
    if (canonical) mapped.add(canonical)
  }

  const mappedArr = [...mapped]

  const isHouseLike = ['house','land','lot','finca','commercial'].includes(
    (prop.property_type || '').toLowerCase()
  )
  const isCondoLike = ['apartment','condo','penthouse','studio'].includes(
    (prop.property_type || '').toLowerCase()
  )

  let featuresEn, amenitiesEn

  if (isCondoLike) {
    amenitiesEn = mappedArr.filter(c => COMMUNITY_AMENITIES.has(c)).slice(0, 6)
    featuresEn  = mappedArr.filter(c => !COMMUNITY_AMENITIES.has(c)).slice(0, 8)
  } else {
    // Houses, land, commercial, unknown → everything in features
    amenitiesEn = []
    featuresEn  = mappedArr.slice(0, 8)
  }

  const featuresEs  = featuresEn.map(c => ES_MAP[c] ?? c)
  const amenitiesEs = amenitiesEn.map(c => ES_MAP[c] ?? c)

  return {
    features:     featuresEn,
    amenities:    amenitiesEn,
    features_en:  featuresEn,
    features_es:  featuresEs,
    amenities_en: amenitiesEn,
    amenities_es: amenitiesEs,
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching all properties…')

  const { data: properties, error: fetchErr } = await supabase
    .from('properties')
    .select('id, slug, property_type, title_en, title_es, features, amenities, features_en, features_es, amenities_en, amenities_es')

  if (fetchErr) {
    console.error('Fetch error:', fetchErr.message)
    process.exit(1)
  }

  console.log(`Found ${properties.length} properties. Starting remapping…\n`)

  const BATCH_SIZE = 10
  const DELAY_MS   = 500

  let totalProcessed  = 0
  let totalZero       = 0
  let totalFeatures   = 0
  const zeroProps     = []
  const targetSlug    = 'luxury-apartment-in-cortijo-laureles-escazu-barrio-los-laureles'
  let targetResult    = null

  for (let i = 0; i < properties.length; i += BATCH_SIZE) {
    const batch = properties.slice(i, i + BATCH_SIZE)

    const updates = batch.map(prop => {
      const update = processProperty(prop)
      return { id: prop.id, slug: prop.slug, update }
    })

    // Apply updates
    for (const { id, slug, update } of updates) {
      const { error: updateErr } = await supabase
        .from('properties')
        .update(update)
        .eq('id', id)

      if (updateErr) {
        console.error(`  ERROR updating ${id}: ${updateErr.message}`)
        continue
      }

      const total = update.features_en.length + update.amenities_en.length
      if (total === 0) {
        console.warn(`  WARNING: 0 amenities for property ${id} (${slug || 'no slug'})`)
        totalZero++
        zeroProps.push(slug || id)
      } else {
        console.log(`  Updated ${slug || id} → features: [${update.features_en.join(', ')}] amenities: [${update.amenities_en.join(', ')}]`)
      }

      if (slug === targetSlug) targetResult = update
      totalFeatures += update.features_en.length + update.amenities_en.length
      totalProcessed++
    }

    if (i + BATCH_SIZE < properties.length) {
      await new Promise(r => setTimeout(r, DELAY_MS))
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(60))
  console.log('SUMMARY')
  console.log('═'.repeat(60))
  console.log(`Total processed:          ${totalProcessed}`)
  console.log(`With 0 amenities (review): ${totalZero}`)
  console.log(`Total features assigned:   ${totalFeatures}`)
  console.log(`Average per property:      ${(totalFeatures / totalProcessed).toFixed(1)}`)

  if (totalZero > 0) {
    console.log('\nProperties needing manual review:')
    zeroProps.forEach(s => console.log(`  - ${s}`))
  }

  if (targetResult) {
    console.log('\n' + '─'.repeat(60))
    console.log('TARGET PROPERTY RESULT:')
    console.log(targetSlug)
    console.log('features_en: ', targetResult.features_en)
    console.log('features_es: ', targetResult.features_es)
    console.log('amenities_en:', targetResult.amenities_en)
    console.log('amenities_es:', targetResult.amenities_es)
  } else {
    console.log('\nTarget slug not found in result set (check slug spelling).')
  }
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
