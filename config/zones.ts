export interface ZoneConfig {
  slug: string
  nameEs: string
  nameEn: string
  /** Value(s) stored in the `zone` column of the properties table — used for DB ilike query */
  dbZone: string
  descriptionEs: string
  descriptionEn: string
  whyLiveEs: string[]
  whyLiveEn: string[]
}

export const ZONE_CONFIG: Record<string, ZoneConfig> = {
  escazu: {
    slug: 'escazu',
    nameEs: 'Escazú',
    nameEn: 'Escazú',
    dbZone: 'escazu',
    descriptionEs:
      'Escazú es el destino residencial más codiciado de Costa Rica — una mezcla de modernidad, naturaleza y una comunidad internacional vibrante. Con una oferta culinaria de primer nivel, centros comerciales premium y acceso rápido al centro de San José, Escazú combina comodidad urbana con calidad de vida excepcional.',
    descriptionEn:
      'Escazú is Costa Rica\'s most sought-after residential destination — a blend of modernity, nature, and a vibrant international community. With world-class dining, premium shopping, and fast access to downtown San José, Escazú combines urban convenience with an exceptional quality of life.',
    whyLiveEs: [
      'Comunidad internacional consolidada con familias de más de 60 nacionalidades',
      'Los mejores restaurantes, cafés y tiendas gourmet del país',
      'Excelentes colegios bilingües e internacionales a pocos minutos',
      'Clínicas y hospitales de primer nivel a menos de 10 minutos',
      'Alta conectividad hacia La Sabana, el aeropuerto y zonas francas',
    ],
    whyLiveEn: [
      'Established international community with families from over 60 nationalities',
      'The country\'s finest restaurants, cafés, and gourmet shops',
      'Top bilingual and international schools within minutes',
      'World-class clinics and hospitals less than 10 minutes away',
      'Easy connectivity to La Sabana, the airport, and free-trade zones',
    ],
  },
  'santa-ana': {
    slug: 'santa-ana',
    nameEs: 'Santa Ana',
    nameEn: 'Santa Ana',
    dbZone: 'santa ana',
    descriptionEs:
      'Santa Ana ofrece un equilibrio perfecto entre tranquilidad residencial y conveniente acceso a toda la Gran Área Metropolitana. Con clima templado, amplias vías de acceso y un crecimiento inmobiliario sostenido, Santa Ana se ha convertido en la elección predilecta de familias que buscan espacio, seguridad y calidad de vida.',
    descriptionEn:
      'Santa Ana strikes a perfect balance between residential tranquility and convenient access throughout the Greater Metropolitan Area. With a temperate climate, wide access roads, and sustained real estate growth, Santa Ana has become the preferred choice for families seeking space, security, and quality of life.',
    whyLiveEs: [
      'Clima más cálido y soleado que el centro de San José',
      'Amplias opciones de casas con jardín y proyectos de condominio',
      'Zona franca City Mall y centros empresariales con empleo de calidad',
      'Acceso directo a la autopista Próspero Fernández (Ruta 27)',
      'Ambiente tranquilo con creciente infraestructura comercial y educativa',
    ],
    whyLiveEn: [
      'Warmer, sunnier climate than central San José',
      'Wide range of houses with gardens and condominium projects',
      'City Mall free-trade zone and business centers with quality employment',
      'Direct access to the Próspero Fernández Highway (Route 27)',
      'Peaceful atmosphere with growing commercial and educational infrastructure',
    ],
  },
  'la-guacima': {
    slug: 'la-guacima',
    nameEs: 'La Guácima',
    nameEn: 'La Guácima',
    dbZone: 'la guacima',
    descriptionEs:
      'La Guácima es uno de los secretos mejor guardados del Gran Área Metropolitana Oeste. Con proyectos residenciales cerrados de alto nivel, amplios terrenos y un entorno verde incomparable, esta zona atrae a familias que priorizan privacidad, exclusividad y acceso rápido al aeropuerto Juan Santamaría.',
    descriptionEn:
      'La Guácima is one of the best-kept secrets of the West Greater Metropolitan Area. With high-end gated residential projects, spacious lots, and unparalleled green surroundings, this zone attracts families who prioritize privacy, exclusivity, and quick access to Juan Santamaría International Airport.',
    whyLiveEs: [
      'Residencias y condominios privados de alta categoría',
      'Solo 10 minutos del Aeropuerto Internacional Juan Santamaría',
      'Grandes lotes y propiedades con privacidad y amplias áreas verdes',
      'Zona en crecimiento con valores de propiedad en alza constante',
      'Comunidad tranquila con acceso fácil a Santa Ana y Alajuela',
    ],
    whyLiveEn: [
      'High-end private residences and gated condominiums',
      'Only 10 minutes from Juan Santamaría International Airport',
      'Large lots and properties with privacy and ample green areas',
      'Growing area with consistently rising property values',
      'Quiet community with easy access to Santa Ana and Alajuela',
    ],
  },
  lindora: {
    slug: 'lindora',
    nameEs: 'Lindora',
    nameEn: 'Lindora',
    dbZone: 'lindora',
    descriptionEs:
      'Lindora, ubicada en el corazón de Santa Ana, es el epicentro del lifestyle moderno del Gran Área Metropolitana Oeste. Con un polo gastronómico en auge, acceso a las mejores zonas francas y una mezcla de condominios contemporáneos y casas en comunidades cerradas, Lindora es ideal para ejecutivos y familias internacionales.',
    descriptionEn:
      'Lindora, nestled in the heart of Santa Ana, is the lifestyle epicenter of the West Greater Metropolitan Area. With a booming gastronomic scene, access to top free-trade zones, and a mix of contemporary condominiums and homes in gated communities, Lindora is ideal for executives and international families.',
    whyLiveEs: [
      'Zona gastronómica premium con restaurantes de cocina internacional',
      'Acceso inmediato a las principales zonas francas del país (Forum, Ultrapark)',
      'Condominios modernos con amenidades de resort',
      'Ambiente cosmopolita con comunidad expat activa',
      'Excelente conectividad hacia el aeropuerto, Escazú y el centro',
    ],
    whyLiveEn: [
      'Premium gastronomic zone with international cuisine restaurants',
      'Immediate access to the country\'s top free-trade zones (Forum, Ultrapark)',
      'Modern condominiums with resort-style amenities',
      'Cosmopolitan atmosphere with an active expat community',
      'Excellent connectivity to the airport, Escazú, and downtown',
    ],
  },
}

/** All zone slugs in order */
export const ZONE_SLUGS = Object.keys(ZONE_CONFIG)
