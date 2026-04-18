// ── Developments data ────────────────────────────────────────────────────────
// Typed schema for the Developments microsite. Imagery comes from Unsplash
// (domain allow-listed in next.config.mjs); replace with real project
// photography once marketing delivers. `DEVS_BY_SLUG` keeps the detail page
// look-up O(1).

export type DevStatus = 'pre-sale' | 'under-construction' | 'ready' | 'sold-out'

export interface UnitType {
  labelEn: string
  labelEs: string
  beds: number
  baths: number
  sqm: number
  priceUsd: number
  available: number
}

export interface Amenity {
  en: string
  es: string
  /** lucide-react icon name — see AMENITY_ICONS map in detail client */
  icon: string
}

export interface Development {
  id: string
  slug: string
  nameEn: string
  nameEs: string
  subtitleEn: string
  subtitleEs: string
  /** 2–3 paragraphs separated by \n\n */
  descriptionEn: string
  descriptionEs: string
  status: DevStatus
  /** ISO date string, null for sold-out legacy projects with no data */
  deliveryDate: string | null
  locationName: string
  zone: string
  priceFromUsd: number
  priceToUsd: number | null
  unitCount: number
  unitTypes: UnitType[]
  amenities: Amenity[]
  heroImage: string
  /** 8–12 Unsplash URLs */
  gallery: string[]
  developerName: string
  /** '#' for mocks, real URL once brochures exist */
  brochureUrl?: string
  /** Optional youtube embed */
  videoUrl?: string
  coordinates?: { lat: number; lng: number }
  featuredOnHomepage: boolean
  displayOrder: number
}

// ── Image helpers ────────────────────────────────────────────────────────────
const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`

// A curated pool of architecture-focused photos. Each project pulls 10 from
// this set in a rotation so each development has a visually distinct feel.
const POOL = [
  '1600596542815-ffad4c1539a9',
  '1600585154340-be6161a56a0c',
  '1600607687939-ce8a6c25118c',
  '1545324418-cc1a3fa10c00',
  '1512917774080-9991f1c4c750',
  '1613490493576-7fde63acd811',
  '1600566753190-17f0baa2a6c3',
  '1600210492486-724fe5c67fb0',
  '1600210491892-03d54c0aaf87',
  '1605114713019-8e4f6ec0eb4b',
  '1564013799919-ab600027ffc6',
  '1600121848594-d8644e57abab',
]

const galleryFrom = (start: number, count = 10): string[] => {
  const out: string[] = []
  for (let i = 0; i < count; i++) out.push(img(POOL[(start + i) % POOL.length]))
  return out
}

// ── Projects ─────────────────────────────────────────────────────────────────
export const developments: Development[] = [
  {
    id: 'dev-hacienda-del-bosque',
    slug: 'hacienda-del-bosque',
    nameEn: 'Hacienda del Bosque',
    nameEs: 'Hacienda del Bosque',
    subtitleEn: 'Seven forested residences above Escazú',
    subtitleEs: 'Siete residencias entre el bosque, sobre Escazú',
    descriptionEn:
      'Set on a forested ridge above Escazú, Hacienda del Bosque is a quiet collection of seven residences designed in dialogue with the cloud forest that surrounds them. Volumes of white stucco, local stone, and weathered teak fold into the topography, so that each house keeps its own horizon and its own silence.\n\nInterior architecture is stripped back and tactile — lime plaster walls, wide-plank oak floors, and floor-to-ceiling glazing that opens to private gardens. Each residence is delivered fully finished, with a discreet palette curated by the studio.\n\nA shared arrival court, gatehouse, and twenty-four-hour staffed security serve the community. The surrounding 3-hectare reserve is kept as permanent green area, protecting the views and ensuring the project never densifies.',
    descriptionEs:
      'En una cresta boscosa sobre Escazú, Hacienda del Bosque es una colección silenciosa de siete residencias diseñadas en diálogo con el bosque de neblina que las rodea. Volúmenes de estuco blanco, piedra local y teca envejecida se pliegan a la topografía, de modo que cada casa conserva su propio horizonte y su propio silencio.\n\nLa arquitectura interior es austera y táctil: muros en estuco de cal, pisos de roble en tabla ancha y cristal piso a techo que se abre hacia jardines privados. Cada residencia se entrega llave en mano, con una paleta discreta curada por el estudio.\n\nUn patio de llegada compartido, la casa de acceso y seguridad veinticuatro horas sirven a la comunidad. La reserva de 3 hectáreas circundante queda como área verde permanente, protegiendo las vistas y asegurando que el proyecto nunca se densifique.',
    status: 'pre-sale',
    deliveryDate: '2027-11-01',
    locationName: 'Escazú Hills',
    zone: 'Escazú',
    priceFromUsd: 2_400_000,
    priceToUsd: 4_200_000,
    unitCount: 7,
    unitTypes: [
      { labelEn: 'Garden Residence',   labelEs: 'Residencia Jardín',    beds: 3, baths: 3.5, sqm: 380, priceUsd: 2_400_000, available: 2 },
      { labelEn: 'Ridge Residence',    labelEs: 'Residencia Cresta',    beds: 4, baths: 4.5, sqm: 520, priceUsd: 3_200_000, available: 3 },
      { labelEn: 'Forest Villa',       labelEs: 'Villa Bosque',         beds: 5, baths: 5.5, sqm: 720, priceUsd: 4_200_000, available: 2 },
    ],
    amenities: [
      { en: 'Infinity Pool',      es: 'Piscina Infinita',       icon: 'Waves' },
      { en: '24/7 Security',      es: 'Seguridad 24/7',         icon: 'Shield' },
      { en: 'Clubhouse',          es: 'Casa Club',              icon: 'Home' },
      { en: 'Wellness Pavilion',  es: 'Pabellón de Bienestar',  icon: 'Flower2' },
      { en: 'Concierge',          es: 'Conserjería',            icon: 'BellRing' },
      { en: 'EV Charging',        es: 'Carga Eléctrica',        icon: 'Zap' },
      { en: 'Fiber Internet',     es: 'Internet Fibra',         icon: 'Wifi' },
      { en: 'Wine Cellar',        es: 'Cava',                   icon: 'Wine' },
    ],
    heroImage: img(POOL[0]),
    gallery: galleryFrom(0, 10),
    developerName: 'Grupo Atelier',
    brochureUrl: '#',
    coordinates: { lat: 9.9290, lng: -84.1510 },
    featuredOnHomepage: true,
    displayOrder: 1,
  },

  {
    id: 'dev-casa-atelier',
    slug: 'casa-atelier',
    nameEn: 'Casa Atelier',
    nameEs: 'Casa Atelier',
    subtitleEn: 'Twelve residences in Santa Ana Centro',
    subtitleEs: 'Doce residencias en Santa Ana Centro',
    descriptionEn:
      'Casa Atelier is a low-rise residential composition of twelve homes arranged around two intimate courtyards in the quiet center of Santa Ana. The architecture takes its cues from the old agricultural structures of the valley — whitewashed masonry, exposed wood beams, clay tile roofs — reinterpreted with contemporary proportions and a restrained material palette.\n\nEach residence enjoys private outdoor space and direct access to a shared garden, pool, and amenity pavilion. Interiors are delivered with European cabinetry, natural stone surfaces, and a heating-ready hydronic floor system on the principal level.\n\nThe project sits a short walk from the Boulevard de Santa Ana, with the tranquility of a walled courtyard community and the convenience of a village location.',
    descriptionEs:
      'Casa Atelier es una composición residencial de baja altura, doce hogares dispuestos alrededor de dos patios íntimos en el centro silencioso de Santa Ana. La arquitectura toma pistas de las antiguas estructuras agrícolas del valle — mampostería encalada, vigas de madera vista, tejas de barro — reinterpretadas con proporciones contemporáneas y una paleta material contenida.\n\nCada residencia disfruta de espacio exterior privado y acceso directo al jardín compartido, la piscina y el pabellón de amenidades. Los interiores se entregan con cocinas europeas, superficies en piedra natural y un sistema hidrónico de piso listo para calefacción en el nivel principal.\n\nEl proyecto se encuentra a pocos pasos del Boulevard de Santa Ana, con la tranquilidad de una comunidad de patio amurallado y la conveniencia de un emplazamiento de pueblo.',
    status: 'under-construction',
    deliveryDate: '2026-09-01',
    locationName: 'Santa Ana Centro',
    zone: 'Santa Ana',
    priceFromUsd: 680_000,
    priceToUsd: 1_850_000,
    unitCount: 12,
    unitTypes: [
      { labelEn: 'Patio Residence',   labelEs: 'Residencia Patio',    beds: 2, baths: 2.5, sqm: 180, priceUsd: 680_000,   available: 4 },
      { labelEn: 'Courtyard House',   labelEs: 'Casa Atrio',          beds: 3, baths: 3.5, sqm: 260, priceUsd: 1_150_000, available: 5 },
      { labelEn: 'Garden Townhouse',  labelEs: 'Townhouse Jardín',    beds: 4, baths: 4.5, sqm: 340, priceUsd: 1_850_000, available: 3 },
    ],
    amenities: [
      { en: 'Pool',              es: 'Piscina',             icon: 'Waves' },
      { en: '24/7 Security',     es: 'Seguridad 24/7',      icon: 'Shield' },
      { en: 'Clubhouse',         es: 'Casa Club',           icon: 'Home' },
      { en: 'Gym',               es: 'Gimnasio',            icon: 'Dumbbell' },
      { en: 'Concierge',         es: 'Conserjería',         icon: 'BellRing' },
      { en: 'Pet Park',          es: 'Parque para Mascotas', icon: 'PawPrint' },
      { en: 'EV Charging',       es: 'Carga Eléctrica',     icon: 'Zap' },
      { en: 'Fiber Internet',    es: 'Internet Fibra',      icon: 'Wifi' },
      { en: 'Guest Suites',      es: 'Suites de Huéspedes', icon: 'BedDouble' },
    ],
    heroImage: img(POOL[2]),
    gallery: galleryFrom(2, 10),
    developerName: 'Atelier Desarrollos',
    brochureUrl: '#',
    coordinates: { lat: 9.9320, lng: -84.1850 },
    featuredOnHomepage: true,
    displayOrder: 2,
  },

  {
    id: 'dev-terrazas-de-escazu',
    slug: 'terrazas-de-escazu',
    nameEn: 'Terrazas de Escazú',
    nameEs: 'Terrazas de Escazú',
    subtitleEn: 'Twenty-eight residences in Trejos Montealegre',
    subtitleEs: 'Veintiocho residencias en Trejos Montealegre',
    descriptionEn:
      'Terrazas de Escazú is a six-story residential project in the heart of Trejos Montealegre, offering twenty-eight apartments with private terraces framed by the Central Valley panorama. The architecture layers cantilevered planes and deep overhangs to shade the glazing and create an outdoor room from every principal space.\n\nApartments range from one-bedroom pied-à-terres to four-bedroom penthouses, each with at least one private terrace of no less than twenty-two square meters. Interior finishes include wide-plank engineered oak, porcelain slab bathrooms, and custom European cabinetry throughout.\n\nAmenities are placed across two levels — rooftop pool, gym, and entertainment kitchen above, and a lobby level with co-working, screening room, and a concierge desk staffed twenty-four hours a day.',
    descriptionEs:
      'Terrazas de Escazú es un proyecto residencial de seis niveles en el corazón de Trejos Montealegre, con veintiocho apartamentos y terrazas privadas enmarcadas por el panorama del Valle Central. La arquitectura dispone planos en voladizo y aleros profundos para sombrear el cristal y convertir cada espacio principal en una habitación al aire libre.\n\nLos apartamentos van desde pied-à-terres de una habitación hasta penthouses de cuatro, cada uno con al menos una terraza privada de no menos de veintidós metros cuadrados. Los acabados incluyen piso de roble ingenierizado en tabla ancha, baños en losa de porcelana y cocinas europeas a medida.\n\nLas amenidades se distribuyen en dos niveles — piscina rooftop, gimnasio y cocina de entretenimiento arriba, y un nivel de lobby con coworking, sala de proyección y un puesto de conserjería atendido veinticuatro horas.',
    status: 'under-construction',
    deliveryDate: '2026-03-01',
    locationName: 'Trejos Montealegre',
    zone: 'Escazú',
    priceFromUsd: 540_000,
    priceToUsd: 2_900_000,
    unitCount: 28,
    unitTypes: [
      { labelEn: 'One Bedroom',   labelEs: 'Una Habitación',   beds: 1, baths: 1.5, sqm: 85,  priceUsd: 540_000,   available: 6 },
      { labelEn: 'Two Bedroom',   labelEs: 'Dos Habitaciones', beds: 2, baths: 2.5, sqm: 140, priceUsd: 890_000,   available: 10 },
      { labelEn: 'Three Bedroom', labelEs: 'Tres Habitaciones', beds: 3, baths: 3.5, sqm: 210, priceUsd: 1_450_000, available: 8 },
      { labelEn: 'Penthouse',     labelEs: 'Penthouse',        beds: 4, baths: 4.5, sqm: 360, priceUsd: 2_900_000, available: 4 },
    ],
    amenities: [
      { en: 'Rooftop Pool',    es: 'Piscina Rooftop',     icon: 'Sun' },
      { en: '24/7 Security',   es: 'Seguridad 24/7',      icon: 'Shield' },
      { en: 'Gym',             es: 'Gimnasio',            icon: 'Dumbbell' },
      { en: 'Spa',             es: 'Spa',                 icon: 'Flower2' },
      { en: 'Clubhouse',       es: 'Casa Club',           icon: 'Home' },
      { en: 'Concierge',       es: 'Conserjería',         icon: 'BellRing' },
      { en: 'EV Charging',     es: 'Carga Eléctrica',     icon: 'Zap' },
      { en: 'Fiber Internet',  es: 'Internet Fibra',      icon: 'Wifi' },
      { en: 'Guest Suites',    es: 'Suites de Huéspedes', icon: 'BedDouble' },
      { en: 'Pet Park',        es: 'Parque para Mascotas', icon: 'PawPrint' },
    ],
    heroImage: img(POOL[4]),
    gallery: galleryFrom(4, 10),
    developerName: 'Montealegre Group',
    brochureUrl: '#',
    coordinates: { lat: 9.9140, lng: -84.1320 },
    featuredOnHomepage: false,
    displayOrder: 3,
  },

  {
    id: 'dev-finca-santa-ana',
    slug: 'finca-santa-ana',
    nameEn: 'Finca Santa Ana',
    nameEs: 'Finca Santa Ana',
    subtitleEn: 'Nine country residences in Piedades',
    subtitleEs: 'Nueve residencias de campo en Piedades',
    descriptionEn:
      'Finca Santa Ana reimagines the coffee finca as a residential community — nine country residences set on four hectares of preserved farmland in Piedades, with mature guarumo trees, orchards, and walking paths that follow the original property lines.\n\nEach residence is designed as a contemporary pavilion that sits lightly on the land, with operable timber louvers, deep verandas, and a clear separation between the living pavilion and the sleeping quarters. The finish schedule is restrained — lime plaster, chiseled travertine, oiled oak — leaving the landscape to dominate.\n\nShared amenities include an organic garden, equestrian stables, a saltwater pool and a restored farmhouse that serves as the community clubhouse. The development is a forty-five-minute drive to San José and fifteen minutes to the Santa Ana village.',
    descriptionEs:
      'Finca Santa Ana reimagina la finca cafetalera como una comunidad residencial — nueve residencias de campo sobre cuatro hectáreas de tierra conservada en Piedades, con árboles de guarumo maduros, huertos y senderos que siguen las líneas originales de la finca.\n\nCada residencia se diseña como un pabellón contemporáneo que se posa ligero sobre la tierra, con celosías operables de madera, verandas profundas y una separación clara entre el pabellón de estar y el área de dormitorios. El programa de acabados es contenido — estuco de cal, travertino cincelado, roble aceitado — dejando que el paisaje domine.\n\nLas amenidades compartidas incluyen una huerta orgánica, caballerizas, una piscina de agua salada y una casa de hacienda restaurada que sirve como casa club de la comunidad. El proyecto está a cuarenta y cinco minutos de San José y quince de la villa de Santa Ana.',
    status: 'pre-sale',
    deliveryDate: '2027-04-01',
    locationName: 'Piedades, Santa Ana',
    zone: 'Santa Ana',
    priceFromUsd: 1_650_000,
    priceToUsd: 3_400_000,
    unitCount: 9,
    unitTypes: [
      { labelEn: 'Pavilion Residence', labelEs: 'Residencia Pabellón', beds: 3, baths: 3.5, sqm: 340, priceUsd: 1_650_000, available: 3 },
      { labelEn: 'Grove Residence',    labelEs: 'Residencia Arboleda', beds: 4, baths: 4.5, sqm: 480, priceUsd: 2_400_000, available: 4 },
      { labelEn: 'Estate Residence',   labelEs: 'Residencia Hacienda', beds: 5, baths: 5.5, sqm: 640, priceUsd: 3_400_000, available: 2 },
    ],
    amenities: [
      { en: 'Saltwater Pool',    es: 'Piscina Salina',       icon: 'Waves' },
      { en: '24/7 Security',     es: 'Seguridad 24/7',       icon: 'Shield' },
      { en: 'Historic Clubhouse', es: 'Casa Club Histórica', icon: 'Home' },
      { en: 'Wellness Pavilion', es: 'Pabellón de Bienestar', icon: 'Flower2' },
      { en: 'Concierge',         es: 'Conserjería',          icon: 'BellRing' },
      { en: 'Fiber Internet',    es: 'Internet Fibra',       icon: 'Wifi' },
      { en: 'EV Charging',       es: 'Carga Eléctrica',      icon: 'Zap' },
      { en: 'Guest Suites',      es: 'Suites de Huéspedes',  icon: 'BedDouble' },
    ],
    heroImage: img(POOL[6]),
    gallery: galleryFrom(6, 10),
    developerName: 'Hacienda Partners',
    brochureUrl: '#',
    coordinates: { lat: 9.9010, lng: -84.2200 },
    featuredOnHomepage: true,
    displayOrder: 4,
  },

  {
    id: 'dev-mirador-del-valle',
    slug: 'mirador-del-valle',
    nameEn: 'Mirador del Valle',
    nameEs: 'Mirador del Valle',
    subtitleEn: 'Eighteen delivered residences in La Guácima',
    subtitleEs: 'Dieciocho residencias entregadas en La Guácima',
    descriptionEn:
      'Mirador del Valle is a delivered community of eighteen residences on a high plateau in La Guácima, with unbroken views east over the Central Valley and west to the Carpintera range. The project was completed in late 2024 and is now fully inhabited, with three resales currently available through the developer.\n\nArchitecture is quiet and horizontal — single-story volumes clad in local stone, with glass walls that disappear into pocket cavities to extend the living rooms into covered terraces and pools. Every residence sits on a private lot of no less than one thousand square meters.\n\nThe community includes a members-only clubhouse with gym and spa, equestrian facilities, and a 2-kilometer walking loop within the boundary. Located twenty minutes from Juan Santamaría International Airport.',
    descriptionEs:
      'Mirador del Valle es una comunidad entregada de dieciocho residencias sobre una meseta alta en La Guácima, con vistas ininterrumpidas al oriente del Valle Central y al occidente de la Carpintera. El proyecto se completó a finales de 2024 y está hoy totalmente habitado; hay tres reventas disponibles a través del desarrollador.\n\nLa arquitectura es silenciosa y horizontal — volúmenes de una sola planta revestidos en piedra local, con muros de cristal que desaparecen dentro de cavidades de bolsillo para extender las salas hacia terrazas techadas y piscinas. Cada residencia se encuentra sobre un lote privado no menor de mil metros cuadrados.\n\nLa comunidad incluye una casa club exclusiva para miembros con gimnasio y spa, instalaciones ecuestres y un circuito peatonal de 2 kilómetros dentro del perímetro. Ubicada a veinte minutos del Aeropuerto Internacional Juan Santamaría.',
    status: 'ready',
    deliveryDate: '2024-11-01',
    locationName: 'La Guácima',
    zone: 'Alajuela',
    priceFromUsd: 720_000,
    priceToUsd: 1_450_000,
    unitCount: 18,
    unitTypes: [
      { labelEn: 'Mirador Residence', labelEs: 'Residencia Mirador', beds: 3, baths: 3.5, sqm: 280, priceUsd: 720_000,   available: 1 },
      { labelEn: 'Vista Residence',   labelEs: 'Residencia Vista',   beds: 4, baths: 4.5, sqm: 380, priceUsd: 1_050_000, available: 1 },
      { labelEn: 'Horizon Villa',     labelEs: 'Villa Horizonte',    beds: 5, baths: 5.5, sqm: 520, priceUsd: 1_450_000, available: 1 },
    ],
    amenities: [
      { en: 'Pool',              es: 'Piscina',             icon: 'Waves' },
      { en: '24/7 Security',     es: 'Seguridad 24/7',      icon: 'Shield' },
      { en: 'Clubhouse',         es: 'Casa Club',           icon: 'Home' },
      { en: 'Gym',               es: 'Gimnasio',            icon: 'Dumbbell' },
      { en: 'Spa',               es: 'Spa',                 icon: 'Flower2' },
      { en: 'Concierge',         es: 'Conserjería',         icon: 'BellRing' },
      { en: 'Fiber Internet',    es: 'Internet Fibra',      icon: 'Wifi' },
      { en: 'EV Charging',       es: 'Carga Eléctrica',     icon: 'Zap' },
    ],
    heroImage: img(POOL[8]),
    gallery: galleryFrom(8, 10),
    developerName: 'Valle Group',
    brochureUrl: '#',
    coordinates: { lat: 9.9670, lng: -84.2170 },
    featuredOnHomepage: false,
    displayOrder: 5,
  },

  {
    id: 'dev-villa-nogal',
    slug: 'villa-nogal',
    nameEn: 'Villa Nogal',
    nameEs: 'Villa Nogal',
    subtitleEn: 'Six delivered villas in Pozos, Santa Ana',
    subtitleEs: 'Seis villas entregadas en Pozos, Santa Ana',
    descriptionEn:
      'Villa Nogal is a boutique community of six villas in Pozos, Santa Ana, completed and fully sold in mid-2025. The project is now a reference in small-footprint residential development in the valley — an intimate courtyard model, tightly planted mature trees, and shared open space in what would have otherwise been surface parking.\n\nThough no units remain for sale, the developer maintains a waitlist for future resales. Interested parties may register for notification when a resale becomes available.\n\nThe architecture is characterized by its use of walnut timber — in cabinetry, in ceiling beams, in the window frames — from which the community takes its name. A rare example in the Central Valley of residential architecture that ages with its material choices.',
    descriptionEs:
      'Villa Nogal es una comunidad boutique de seis villas en Pozos, Santa Ana, completada y totalmente vendida a mediados de 2025. El proyecto es hoy una referencia en el desarrollo residencial de pequeña huella en el valle — un modelo íntimo de patio, árboles maduros sembrados en cercanía y espacio abierto compartido en lo que de otra manera habría sido parqueo de superficie.\n\nAunque no quedan unidades a la venta, el desarrollador mantiene una lista de espera para futuras reventas. Los interesados pueden registrarse para ser notificados cuando una reventa esté disponible.\n\nLa arquitectura se caracteriza por su uso de madera de nogal — en cocinas, en vigas de techo, en marcos de ventana — de donde la comunidad toma su nombre. Un raro ejemplo en el Valle Central de arquitectura residencial que envejece con sus elecciones de material.',
    status: 'sold-out',
    deliveryDate: '2025-08-01',
    locationName: 'Pozos, Santa Ana',
    zone: 'Santa Ana',
    priceFromUsd: 450_000,
    priceToUsd: 980_000,
    unitCount: 6,
    unitTypes: [
      { labelEn: 'Courtyard Villa', labelEs: 'Villa Patio',      beds: 2, baths: 2.5, sqm: 160, priceUsd: 450_000, available: 0 },
      { labelEn: 'Garden Villa',    labelEs: 'Villa Jardín',     beds: 3, baths: 3.5, sqm: 240, priceUsd: 720_000, available: 0 },
      { labelEn: 'Grand Villa',     labelEs: 'Villa Principal',  beds: 4, baths: 4.5, sqm: 320, priceUsd: 980_000, available: 0 },
    ],
    amenities: [
      { en: 'Pool',              es: 'Piscina',             icon: 'Waves' },
      { en: '24/7 Security',     es: 'Seguridad 24/7',      icon: 'Shield' },
      { en: 'Clubhouse',         es: 'Casa Club',           icon: 'Home' },
      { en: 'Gym',               es: 'Gimnasio',            icon: 'Dumbbell' },
      { en: 'Concierge',         es: 'Conserjería',         icon: 'BellRing' },
      { en: 'Fiber Internet',    es: 'Internet Fibra',      icon: 'Wifi' },
    ],
    heroImage: img(POOL[10]),
    gallery: galleryFrom(10, 10),
    developerName: 'Nogal Partners',
    brochureUrl: '#',
    coordinates: { lat: 9.9370, lng: -84.1760 },
    featuredOnHomepage: false,
    displayOrder: 6,
  },
]

export const DEVS_BY_SLUG: Record<string, Development> = Object.fromEntries(
  developments.map((d) => [d.slug, d]),
)

// ── Display helpers shared across the microsite ──────────────────────────────

export const STATUS_LABEL: Record<DevStatus, { en: string; es: string }> = {
  'pre-sale':           { en: 'Pre-Sale',           es: 'Preventa' },
  'under-construction': { en: 'Under Construction', es: 'En Construcción' },
  'ready':              { en: 'Ready',              es: 'Listo' },
  'sold-out':           { en: 'Sold Out',           es: 'Agotado' },
}

export const STATUS_STYLE: Record<DevStatus, string> = {
  'pre-sale':           'bg-[#C9A96E] text-[#1A1A1A]',
  'under-construction': 'bg-[#1A3A2A] text-white',
  'ready':              'bg-[#1A1A1A] text-white',
  'sold-out':           'bg-[#6B6158] text-white',
}

/** Format a USD number in the editorial "$X.XM" / "$XXK" shorthand. */
export const formatPrice = (n: number): string => {
  if (n >= 1_000_000) {
    const m = n / 1_000_000
    return `$${m.toFixed(n % 1_000_000 === 0 ? 1 : 2)}M`
  }
  return `$${Math.round(n / 1000)}K`
}
