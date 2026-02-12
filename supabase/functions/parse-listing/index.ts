import { createClient } from "npm:@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Keywords for amenities and features (Spanish & English)
const AMENITY_KEYWORDS: Record<string, string[]> = {
  pool: ['pool', 'piscina', 'swimming'],
  garden: ['garden', 'jardín', 'jardin', 'landscaped'],
  security_system: ['security', 'seguridad', 'alarm', 'alarma', 'cameras', 'cámaras'],
  central_ac: ['ac', 'a/c', 'aire acondicionado', 'air conditioning', 'central air', 'climate'],
  smart_home: ['smart home', 'domótica', 'automation', 'smart'],
  gym: ['gym', 'gimnasio', 'fitness', 'workout'],
  sauna: ['sauna', 'steam', 'vapor'],
  home_theater: ['theater', 'teatro', 'cine', 'cinema', 'media room'],
  wine_cellar: ['wine', 'vino', 'cellar', 'bodega de vinos', 'cava'],
  staff_quarters: ['staff', 'empleada', 'service', 'maid', 'quarters'],
  solar_panels: ['solar', 'panels', 'paneles'],
  backup_generator: ['generator', 'generador', 'backup power', 'planta eléctrica'],
  gated_entry: ['gated', 'portón', 'gate', 'controlled access'],
  concierge: ['concierge', 'portería', 'doorman', 'reception'],
  rooftop_terrace: ['rooftop', 'azotea', 'roof terrace', 'terraza en techo'],
  outdoor_kitchen: ['outdoor kitchen', 'cocina exterior', 'bbq', 'barbecue', 'parrilla', 'rancho'],
  fire_pit: ['fire pit', 'fogata', 'fireplace', 'chimenea'],
  private_beach_access: ['beach access', 'acceso a playa', 'beachfront'],
  boat_dock: ['dock', 'muelle', 'marina', 'boat'],
  helipad: ['helipad', 'helipuerto'],
  infinity_pool: ['infinity pool', 'piscina infinita', 'infinity edge'],
  spa: ['spa', 'jacuzzi', 'hot tub', 'hidromasaje'],
  private_terrace: ['terrace', 'terraza', 'balcony', 'balcón'],
  business_center: ['business center', 'centro de negocios', 'coworking'],
  restaurant: ['restaurant', 'restaurante'],
  yoga_pavilion: ['yoga', 'meditation', 'meditación'],
  surf_equipment: ['surf', 'surfing', 'boards'],
  microwave: ['microwave', 'microondas'],
  dishwasher: ['dishwasher', 'lavavajillas', 'lavaplatos'],
  washer_dryer: ['washer', 'dryer', 'lavadora', 'secadora', 'laundry'],
  air_conditioning: ['air conditioning', 'aire acondicionado', 'ac', 'a/c', 'minisplit'],
  heating: ['heating', 'calefacción', 'heater'],
  elevator: ['elevator', 'ascensor', 'lift'],
  parking: ['parking', 'estacionamiento', 'garage', 'garaje', 'cochera'],
}

const FEATURE_KEYWORDS: Record<string, string[]> = {
  ocean_views: ['ocean view', 'vista al mar', 'sea view', 'oceanfront', 'mar'],
  mountain_views: ['mountain view', 'vista a la montaña', 'mountain', 'montaña', 'cerro'],
  city_views: ['city view', 'vista ciudad', 'skyline', 'urban view'],
  park_views: ['park view', 'vista parque'],
  jungle_setting: ['jungle', 'selva', 'tropical', 'rainforest', 'bosque'],
  gated_community: ['gated community', 'condominio cerrado', 'residencial', 'comunidad cerrada'],
  near_international_schools: ['school', 'escuela', 'colegio', 'international school'],
  walking_distance_shops: ['shops', 'comercio', 'mall', 'centro comercial', 'walking distance'],
  pet_friendly: ['pet friendly', 'mascotas', 'pets allowed', 'se permiten mascotas'],
  furnished: ['furnished', 'amueblado', 'amoblado', 'con muebles'],
  high_ceilings: ['high ceiling', 'techos altos', 'doble altura', 'tall ceilings'],
  open_floor_plan: ['open floor', 'concepto abierto', 'open concept', 'open plan'],
  chefs_kitchen: ['chef kitchen', 'cocina gourmet', 'gourmet', 'professional kitchen'],
  premium_finishes: ['premium', 'luxury finish', 'acabados de lujo', 'high-end', 'marble', 'mármol'],
  eco_certified: ['eco', 'green', 'sustainable', 'sostenible', 'leed', 'certificado'],
  recently_renovated: ['renovated', 'remodelado', 'updated', 'nuevo', 'recent'],
  direct_ocean_views: ['direct ocean', 'frente al mar', 'oceanfront', 'primera línea'],
  tropical_gardens: ['tropical garden', 'jardín tropical'],
  road_access: ['road access', 'acceso', 'paved', 'pavimentado'],
  utilities_available: ['utilities', 'servicios', 'water', 'electricity', 'agua', 'electricidad'],
  beachfront: ['beachfront', 'frente a playa', 'beach', 'playa'],
  established_business: ['established', 'establecido', 'operating', 'en operación'],
  staff_housing: ['staff housing', 'vivienda empleados', 'caretaker'],
}

interface ParseRequest {
  title: string
  sandboxText: string
  existingData?: Record<string, any>
}

// Costa Rica areas for location detection
const COSTA_RICA_AREAS = [
  'Escazú', 'Santa Ana', 'San José', 'La Sabana', 'Rohrmoser', 'Heredia',
  'Alajuela', 'Cartago', 'Tamarindo', 'Nosara', 'Santa Teresa', 'Jacó',
  'Manuel Antonio', 'Dominical', 'Uvita', 'Puerto Viejo', 'La Fortuna',
  'Monteverde', 'Papagayo', 'Flamingo', 'La Guácima', 'Belén', 'Lindora',
  'Pozos', 'Río Oro', 'Guachipelín', 'San Rafael de Escazú', 'Los Laureles',
  'Nunciatura', 'Curridabat', 'Moravia', 'Tibás', 'San Pedro', 'Sabana',
  'Grecia', 'Atenas', 'San Ramón', 'Palmares', 'Naranjo', 'Ciudad Colón',
  'Puriscal', 'Turrialba', 'Liberia', 'Nicoya', 'Cañas', 'Tilarán',
  'Quepos', 'Ojochal', 'Pérez Zeledón', 'San Isidro', 'Tres Ríos',
  'La Unión', 'Desamparados', 'Coronado', 'Guadalupe', 'Barva',
  'San Joaquín', 'San Antonio', 'Brasil de Mora', 'Piedades',
  'Playa Hermosa', 'Playa del Coco', 'Playas del Coco', 'Potrero',
  'Brasilito', 'Conchal', 'Sámara', 'Mal País', 'Montezuma',
  'Cahuita', 'Tortuguero', 'Drake', 'Sierpe', 'Golfito', 'Osa',
  'Tambor', 'Paquera', 'Herradura', 'Los Sueños', 'Garabito',
  'Rohrmoser', 'Pavas', 'Escazu', 'Santa Ana', 'Multiplaza',
  'San Rafael', 'Barreal', 'La Asunción', 'Bello Horizonte',
]

interface ParsedData {
  // Core
  bedrooms?: number
  bathrooms?: number
  garageSpaces?: number
  propertyType?: string
  levels?: number
  
  // Areas
  constructionSizeSqm?: number
  landSizeSqm?: number
  terraceSqm?: number
  gardenSqm?: number
  storageSqm?: number
  
  // Identity
  buildingName?: string
  unitNumber?: string
  towerName?: string
  floorNumber?: number
  
  // Location
  locationName?: string
  
  // Financial
  priceSale?: number
  priceRentMonthly?: number
  status?: string  // for_sale, for_rent, both
  currency?: string
  hoaMonthly?: number
  
  // Dates & Condition
  yearBuilt?: number
  yearRenovated?: number
  propertyCondition?: string
  
  // Amenities & Features
  amenities?: string[]
  features?: string[]
  
  // Description
  cleanedDescription?: string
  
  // Confidence tracking
  confidence?: Record<string, 'high' | 'medium' | 'low'>
}

function extractNumber(text: string, patterns: RegExp[]): number | undefined {
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const num = parseFloat(match[1].replace(/,/g, ''))
      if (!isNaN(num)) return num
    }
  }
  return undefined
}

function extractText(text: string, patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }
  return undefined
}

function detectAmenities(text: string): string[] {
  const textLower = text.toLowerCase()
  const detected: string[] = []
  
  for (const [amenity, keywords] of Object.entries(AMENITY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (textLower.includes(keyword.toLowerCase())) {
        if (!detected.includes(amenity)) {
          detected.push(amenity)
        }
        break
      }
    }
  }
  
  return detected
}

function detectFeatures(text: string): string[] {
  const textLower = text.toLowerCase()
  const detected: string[] = []
  
  for (const [feature, keywords] of Object.entries(FEATURE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (textLower.includes(keyword.toLowerCase())) {
        if (!detected.includes(feature)) {
          detected.push(feature)
        }
        break
      }
    }
  }
  
  return detected
}

function parseListingText(title: string, sandboxText: string): ParsedData {
  const fullText = `${title} ${sandboxText}`
  const textLower = fullText.toLowerCase()
  const confidence: Record<string, 'high' | 'medium' | 'low'> = {}
  
  const result: ParsedData = {}
  
  // Bedrooms
  const bedroomPatterns = [
    /(\d+)\s*(?:bed(?:room)?s?|hab(?:itaci[oó]n)?(?:es)?|rec[aá]maras?|dormitorios?)/i,
    /(?:bed(?:room)?s?|hab(?:itaci[oó]n)?(?:es)?|rec[aá]maras?|dormitorios?)[\s:]*(\d+)/i,
  ]
  result.bedrooms = extractNumber(fullText, bedroomPatterns)
  if (result.bedrooms) confidence['bedrooms'] = 'high'
  
  // Bathrooms (allow decimals)
  const bathroomPatterns = [
    /(\d+(?:\.\d+)?)\s*(?:bath(?:room)?s?|ba[ñn]os?|wc|servicios)/i,
    /(?:bath(?:room)?s?|ba[ñn]os?)[\s:]*(\d+(?:\.\d+)?)/i,
  ]
  result.bathrooms = extractNumber(fullText, bathroomPatterns)
  if (result.bathrooms) confidence['bathrooms'] = 'high'
  
  // Garage / Parking
  const garagePatterns = [
    /(\d+)\s*(?:garage|garaje|parking|estacionamiento|cochera)s?/i,
    /(?:garage|garaje|parking|estacionamiento)[\s:]*(\d+)/i,
  ]
  result.garageSpaces = extractNumber(fullText, garagePatterns)
  if (result.garageSpaces) confidence['garageSpaces'] = 'high'
  
  // Levels / Floors
  const levelPatterns = [
    /(\d+)\s*(?:level|nivele?s?|piso|planta|stor(?:y|ies)|floors?)/i,
    /(?:level|nivele?s?|floors?)[\s:]*(\d+)/i,
  ]
  result.levels = extractNumber(fullText, levelPatterns)
  if (result.levels) confidence['levels'] = 'medium'
  
  // Property type
  if (/\b(casa|house|home|residencia)\b/i.test(fullText)) {
    result.propertyType = 'house'
    confidence['propertyType'] = 'high'
  } else if (/\b(apartamento|apartment|condo(?:minio)?|flat|piso)\b/i.test(fullText)) {
    result.propertyType = 'condo'
    confidence['propertyType'] = 'high'
  } else if (/\b(lote|lot|terreno|land|finca)\b/i.test(fullText)) {
    result.propertyType = 'land'
    confidence['propertyType'] = 'high'
  } else if (/\b(comercial|commercial|office|oficina|local|bodega|warehouse)\b/i.test(fullText)) {
    result.propertyType = 'commercial'
    confidence['propertyType'] = 'high'
  }
  
  // Construction area - improved patterns
  const constructionPatterns = [
    /(\d+(?:[,\.]\d+)?)\s*(?:m2|m²|sqm|metros?\s*(?:cuadrados?)?)\s*(?:de\s*)?(?:construcci[oó]n|built|construction|construidos?)/i,
    /(?:construcci[oó]n|built|construction|area\s*construida|construido)[\s:]*(\d+(?:[,\.]\d+)?)\s*(?:m2|m²|sqm)?/i,
    /(\d+(?:[,\.]\d+)?)\s*(?:m2|m²|sqm)\s*(?:const\.?|construidos?)/i,
    // More flexible: "450m2 de construcción" or "construcción: 450m2"
    /area[\s:]*(\d+(?:[,\.]\d+)?)\s*(?:m2|m²)/i,
    // Labeled patterns like "Const: 450m²"
    /(?:const|constr)\.?[\s:]*(\d+(?:[,\.]\d+)?)\s*(?:m2|m²)?/i,
  ]
  result.constructionSizeSqm = extractNumber(fullText, constructionPatterns)
  if (result.constructionSizeSqm) confidence['constructionSizeSqm'] = 'high'
  
  // Land area - comprehensive patterns
  const landPatterns = [
    /(\d+(?:[,\.]\d+)?)\s*(?:m2|m²|sqm|metros?\s*(?:cuadrados?)?)\s*(?:de\s*)?(?:terreno|lote|land|lot|finca|tierra)/i,
    /(?:terreno|lote|land|lot|parcela|tierra)[\s:]*(?:de\s*)?(\d+(?:[,\.]\d+)?)\s*(?:m2|m²|sqm|metros?\s*cuadrados?)?/i,
    /lote\s*(?:de\s*)?(\d+(?:[,\.]\d+)?)\s*(?:m2|m²|sqm)?/i,
    /en\s+(?:lote|terreno)\s+(?:de\s+)?(\d+(?:[,\.]\d+)?)\s*(?:m2|m²)/i,
    /sobre\s+(\d+(?:[,\.]\d+)?)\s*(?:m2|m²)\s*(?:de\s*)?(?:terreno|lote)/i,
    /(\d+(?:[,\.]\d+)?)\s*(?:m2|m²)\s+(?:lot|lote|terreno)/i,
    // "land square met(er|re)s" variants
    /(?:land\s*(?:area|size|square\s*met(?:er|re)s?))[\s:]*(\d+(?:[,\.]\d+)?)/i,
    /(\d+(?:[,\.]\d+)?)\s*(?:land\s*(?:square\s*)?(?:met(?:er|re)s?|m2|m²))/i,
    // "area del terreno: 500"
    /[aá]rea\s*(?:del?\s*)?(?:terreno|lote)[\s:]*(\d+(?:[,\.]\d+)?)/i,
    // "500 sqm land"
    /(\d+(?:[,\.]\d+)?)\s*(?:sqm|sq\.?\s*m|square\s*met(?:er|re)s?)\s*(?:of\s*)?(?:land|lot|terreno)/i,
    // "Total area: 800m²" (when no construction label)
    /(?:total\s*area|[aá]rea\s*total)[\s:]*(\d+(?:[,\.]\d+)?)\s*(?:m2|m²|sqm)?/i,
  ]
  result.landSizeSqm = extractNumber(fullText, landPatterns)
  if (result.landSizeSqm) confidence['landSizeSqm'] = 'high'
  
  // If we found construction but not land, try to find standalone m² values
  // that are larger (likely land size)
  if (result.constructionSizeSqm && !result.landSizeSqm) {
    const allM2Matches = fullText.matchAll(/(\d+(?:[,\.]\d+)?)\s*(?:m2|m²)/gi)
    for (const match of allM2Matches) {
      const area = parseFloat(match[1].replace(/,/g, ''))
      if (!isNaN(area) && area > result.constructionSizeSqm && area > 200) {
        result.landSizeSqm = area
        confidence['landSizeSqm'] = 'low'
        break
      }
    }
  }
  
  // If only one m² value found and property is land type, assign to land
  if (!result.landSizeSqm && !result.constructionSizeSqm && result.propertyType === 'land') {
    const anyM2 = fullText.match(/(\d+(?:[,\.]\d+)?)\s*(?:m2|m²|sqm|square\s*met(?:er|re)s?|metros?\s*cuadrados?)/i)
    if (anyM2) {
      const val = parseFloat(anyM2[1].replace(/,/g, ''))
      if (!isNaN(val) && val > 0) {
        result.landSizeSqm = val
        confidence['landSizeSqm'] = 'medium'
      }
    }
  }
  
  // Terrace area
  const terracePatterns = [
    /(\d+(?:[,\.]\d+)?)\s*(?:m2|m²|sqm)\s*(?:de\s*)?(?:terraza|terrace|balc[oó]n|balcony)/i,
    /(?:terraza|terrace|balc[oó]n)[\s:]*(\d+(?:[,\.]\d+)?)/i,
  ]
  result.terraceSqm = extractNumber(fullText, terracePatterns)
  if (result.terraceSqm) confidence['terraceSqm'] = 'medium'
  
  // Garden area
  const gardenPatterns = [
    /(\d+(?:[,\.]\d+)?)\s*(?:m2|m²|sqm)\s*(?:de\s*)?(?:jard[ií]n|garden)/i,
    /(?:jard[ií]n|garden)[\s:]*(\d+(?:[,\.]\d+)?)/i,
  ]
  result.gardenSqm = extractNumber(fullText, gardenPatterns)
  if (result.gardenSqm) confidence['gardenSqm'] = 'medium'
  
  // ========== PRICE DETECTION WITH SMART CLASSIFICATION ==========
  // First, detect explicit rent indicators
  const hasRentIndicator = /\b(alquiler|rent(?:a)?|mensual(?:idad)?|monthly|per\s*month|\/\s*mes)\b/i.test(fullText)
  const hasSaleIndicator = /\b(venta|sale|selling|for\s*sale|se\s*vende)\b/i.test(fullText)
  
  // Extract all prices from text
  const priceMatches: { value: number, isRent: boolean, confidence: 'high' | 'medium' | 'low' }[] = []
  
  // Pattern for explicit rent prices
  const explicitRentPatterns = [
    /(?:alquiler|rent(?:a)?|mensual(?:idad)?)[\s:]*\$?\s*(\d+(?:,\d+)*)/i,
    /\$\s*(\d+(?:,\d+)*)\s*(?:\/\s*mes|monthly|mensual|per\s*month)/i,
    /(\d+(?:,\d+)*)\s*(?:USD|usd|\$)?\s*(?:\/\s*mes|monthly|mensual)/i,
  ]
  for (const pattern of explicitRentPatterns) {
    const match = fullText.match(pattern)
    if (match) {
      const val = parseFloat(match[1].replace(/,/g, ''))
      if (!isNaN(val)) {
        priceMatches.push({ value: val, isRent: true, confidence: 'high' })
      }
    }
  }
  
  // Pattern for explicit sale prices
  const explicitSalePatterns = [
    /(?:precio|price|venta|sale|asking)[\s:]*\$?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:k|K|mil(?:l(?:on(?:es)?)?)?|M)?/i,
    /(?:se\s*vende|for\s*sale)[\s:]*\$?\s*(\d+(?:,\d+)*)/i,
  ]
  for (const pattern of explicitSalePatterns) {
    const match = fullText.match(pattern)
    if (match) {
      let val = parseFloat(match[1].replace(/,/g, ''))
      // Handle K/M notation
      if (/k|K|mil\b/.test(match[0])) val *= 1000
      if (/M|mill[oó]n/i.test(match[0])) val *= 1000000
      if (!isNaN(val)) {
        priceMatches.push({ value: val, isRent: false, confidence: 'high' })
      }
    }
  }
  
  // Generic price patterns (needs classification)
  const genericPricePattern = /\$\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:k|K|mil(?:l(?:on(?:es)?)?)?|M)?(?:\s*(?:USD|usd|dolares?))?/gi
  const genericMatches = [...fullText.matchAll(genericPricePattern)]
  for (const match of genericMatches) {
    let val = parseFloat(match[1].replace(/,/g, ''))
    // Handle K/M notation
    if (/k|K|mil\b/.test(match[0])) val *= 1000
    if (/M|mill[oó]n/i.test(match[0])) val *= 1000000
    if (!isNaN(val)) {
      // Smart classification: < $40,000 likely rent, >= $40,000 likely sale
      const isRent = val < 40000
      priceMatches.push({ value: val, isRent, confidence: 'medium' })
    }
  }
  
  // Dedupe and assign prices
  const rentPrices = priceMatches.filter(p => p.isRent).sort((a, b) => b.confidence.localeCompare(a.confidence))
  const salePrices = priceMatches.filter(p => !p.isRent).sort((a, b) => b.confidence.localeCompare(a.confidence))
  
  if (rentPrices.length > 0) {
    result.priceRentMonthly = rentPrices[0].value
    confidence['priceRentMonthly'] = rentPrices[0].confidence
  }
  
  if (salePrices.length > 0) {
    result.priceSale = salePrices[0].value
    confidence['priceSale'] = salePrices[0].confidence
  }
  
  result.currency = 'USD'
  
  // Determine status based on prices found
  if (result.priceSale && result.priceRentMonthly) {
    result.status = 'both'
    confidence['status'] = 'high'
  } else if (result.priceRentMonthly && !result.priceSale) {
    result.status = 'for_rent'
    confidence['status'] = hasRentIndicator ? 'high' : 'medium'
  } else if (result.priceSale && !result.priceRentMonthly) {
    result.status = 'for_sale'
    confidence['status'] = hasSaleIndicator ? 'high' : 'medium'
  }
  
  // HOA
  const hoaPatterns = [
    /(?:hoa|cuota|mantenimiento|maintenance)[\s:]*\$?\s*(\d+(?:,\d+)*)/i,
  ]
  result.hoaMonthly = extractNumber(fullText, hoaPatterns)
  if (result.hoaMonthly) confidence['hoaMonthly'] = 'low'
  
  // Year built
  const yearPatterns = [
    /(?:built|construido?|año|year)[\s:]*(?:en\s*)?(\d{4})/i,
    /(\d{4})\s*(?:construction|construcci[oó]n)/i,
  ]
  const year = extractNumber(fullText, yearPatterns)
  if (year && year > 1900 && year <= new Date().getFullYear()) {
    result.yearBuilt = year
    confidence['yearBuilt'] = 'medium'
  }
  
  // Building / Condo name - improved patterns
  const buildingPatterns = [
    // "Condominio Torres del Sol" / "Residencial Monte Verde"
    /(?:condominio|condo|residencial|edificio|building|torre|towers?|proyecto|project)\s+([A-Za-zÀ-ÿ0-9][\w\sÀ-ÿ'.-]{2,40}?)(?:\s*[,\.\-–—]|\s+(?:en|in|unit|torre|apt|apartment|piso|floor|ubicado|located|\d))/i,
    // "Condo: Torres del Sol"
    /(?:condominio|condo|residencial|edificio|building|torre|proyecto)[\s:]+([A-Za-zÀ-ÿ0-9][\w\sÀ-ÿ'.-]{2,40}?)(?:\s*$|\s*[,\.\n])/im,
    // Quoted building name: "Torres del Sol"
    /(?:condominio|condo|residencial|edificio|building|torre|proyecto)\s+["']([^"']+)["']/i,
    // "in Condominio X" at end of phrase
    /(?:en\s+(?:el\s+)?)?(?:condominio|condo|residencial|edificio)\s+([A-Za-zÀ-ÿ][\w\sÀ-ÿ'.-]{2,40}?)$/im,
  ]
  result.buildingName = extractText(fullText, buildingPatterns)
  if (result.buildingName) {
    // Clean up trailing whitespace and common stopwords
    result.buildingName = result.buildingName.replace(/\s+(en|in|de|del|con|the|with)\s*$/i, '').trim()
    confidence['buildingName'] = 'medium'
  }
  
  // Location / Area detection - match against known Costa Rica areas
  const textForLocation = fullText
  let bestLocation: { name: string, confidence: 'high' | 'medium' | 'low' } | null = null
  
  // First try explicit location patterns
  const locationPatterns = [
    /(?:ubicado?|located|ubicaci[oó]n|location|direcci[oó]n|address|zona|area|[aá]rea|sector)\s*(?:en|in|:)\s*([A-Za-zÀ-ÿ\s]{3,40}?)(?:\s*[,\.\n]|$)/im,
    /(?:en\s+)([A-Za-zÀ-ÿ\s]{3,30}?),\s*(?:Costa\s*Rica|CR|San\s*José|Guanacaste|Puntarenas|Limón|Heredia|Alajuela|Cartago)/i,
  ]
  const explicitLocation = extractText(textForLocation, locationPatterns)
  if (explicitLocation) {
    // Try to match against known areas
    const normalized = explicitLocation.toLowerCase().trim()
    const matched = COSTA_RICA_AREAS.find(a => normalized.includes(a.toLowerCase()))
    if (matched) {
      bestLocation = { name: matched, confidence: 'high' }
    } else {
      bestLocation = { name: explicitLocation.trim(), confidence: 'medium' }
    }
  }
  
  // Fallback: scan text for known area names (longest match first)
  if (!bestLocation) {
    const sortedAreas = [...COSTA_RICA_AREAS].sort((a, b) => b.length - a.length)
    for (const area of sortedAreas) {
      // Use word boundary-ish matching for short names, contains for longer
      const escaped = area.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = area.length <= 5 
        ? new RegExp(`\\b${escaped}\\b`, 'i')
        : new RegExp(escaped, 'i')
      if (regex.test(textForLocation)) {
        bestLocation = { name: area, confidence: 'medium' }
        break
      }
    }
  }
  
  if (bestLocation) {
    result.locationName = bestLocation.name
    confidence['locationName'] = bestLocation.confidence
  }
  
  // Floor number
  const floorPatterns = [
    /(?:piso|floor|nivel)\s*(?:#|no\.?)?\s*(\d+)/i,
    /(\d+)(?:st|nd|rd|th)?\s*(?:piso|floor)/i,
  ]
  result.floorNumber = extractNumber(fullText, floorPatterns)
  if (result.floorNumber) confidence['floorNumber'] = 'medium'
  
  // Condition
  if (/\b(nuevo|brand\s*new|new\s*construction|recién\s*construido)\b/i.test(fullText)) {
    result.propertyCondition = 'new'
    confidence['propertyCondition'] = 'high'
  } else if (/\b(excelente|excellent|impecable|pristine|mint)\b/i.test(fullText)) {
    result.propertyCondition = 'excellent'
    confidence['propertyCondition'] = 'medium'
  } else if (/\b(necesita\s*(?:trabajo|reparaci[oó]n)|needs\s*work|fixer|para\s*remodelar)\b/i.test(fullText)) {
    result.propertyCondition = 'needs_updates'
    confidence['propertyCondition'] = 'high'
  }
  
  // Detect amenities and features
  result.amenities = detectAmenities(fullText)
  result.features = detectFeatures(fullText)
  
  // Preserve the original description formatting
  // Clean up but maintain line breaks and structure
  result.cleanedDescription = sandboxText
    .replace(/\r\n/g, '\n')           // Normalize line endings
    .replace(/\t/g, '  ')             // Convert tabs to spaces
    .replace(/[ ]{3,}/g, '  ')        // Reduce multiple spaces (keep double for indentation)
    .replace(/\n{4,}/g, '\n\n\n')     // Max 3 consecutive line breaks
    .trim()
  
  result.confidence = confidence
  
  return result
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { title, sandboxText, existingData }: ParseRequest = await req.json()

    if (!sandboxText || sandboxText.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: 'Sandbox text is too short to parse' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse the text
    const parsed = parseListingText(title || '', sandboxText)

    // Mark fields that would overwrite existing data
    const conflicts: string[] = []
    if (existingData) {
      for (const [key, value] of Object.entries(parsed)) {
        if (key === 'confidence' || key === 'amenities' || key === 'features') continue
        if (value !== undefined && existingData[key] !== undefined && existingData[key] !== '' && existingData[key] !== 0) {
          conflicts.push(key)
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        parsed,
        conflicts,
        message: `Extracted ${Object.keys(parsed).filter(k => k !== 'confidence' && parsed[k as keyof ParsedData] !== undefined).length} fields`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Parse listing error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to parse listing text' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
