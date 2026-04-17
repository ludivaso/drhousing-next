// Spanish translations for agent bios.
//
// The `agents` table stores a single `bio` column (English only) and the
// schema is read-only from the frontend. Until a `bio_es` column is added,
// we keep the ES prose here, keyed by agent ID so the lookup is stable
// against tiny DB inconsistencies like trailing spaces in `full_name`.
//
// Fallback: AgentesClient renders the English `bio` verbatim when an ID
// isn't in this map, so new agents never disappear — they just show up
// in English until a translation is added.
export const AGENT_BIO_ES: Record<string, string> = {
  // Diego Vargas — Founder, CEO & Broker of Record
  'fdf159c1-600f-4d90-a5b3-54e64bf63a05':
    'Diego Vargas lidera el equipo de DR Housing con más de 15 años de experiencia combinada en bienes raíces, finanzas y asesoría legal en Costa Rica. Su trabajo refleja la filosofía de DR Housing: orientación cuidadosa, discreción y un enfoque de largo plazo tanto en las decisiones de inversión como en las de estilo de vida.\n\nTrabajando de cerca con inversionistas y clientes en proceso de reubicación, Diego supervisa personalmente transacciones complejas, alineando la preservación del capital, la oportunidad de mercado y la calidad de vida. Su enfoque no es simplemente adquirir una propiedad, sino ayudar al cliente a establecer una presencia segura y refinada en Costa Rica, con confianza y claridad.',

  // Paola Morales — Co-Founder & Managing Director
  '7fce579d-aed4-434a-993c-bbe1a9f5dc67':
    'Paola es Cofundadora y Directora General de DR Housing, con más de 15 años de experiencia en bienes raíces, desarrollo inmobiliario, diseño de interiores y gestión de proyectos en Costa Rica, incluida la administración de propiedades totalmente amobladas, personalizadas y operadas bajo estándares hoteleros de alto nivel.\n\nSupervisa propiedades y portafolios inmobiliarios con un enfoque estratégico, discreto y altamente estructurado, guiando cada decisión con un sólido criterio de mercado, atención al detalle y una visión de largo plazo.\n\nCada proyecto bajo su dirección se gestiona de manera cuidadosa e individualizada, alineando valor, ejecución y presentación bajo estándares de alta gama, y cultivando relaciones duraderas construidas sobre la confianza, la continuidad y una visión patrimonial.',

  // Ricardo Marquez — Technical & Infrastructure Consultant
  '619269d0-e436-41d9-ad3e-d043fdf1b8ee':
    'Ricardo\nConsultor de Infraestructura y Factibilidad Técnica\n\nConsultor externo con sede en Nueva York, especializado en infraestructura y diseño electromecánico para proyectos residenciales y de inversión inmobiliaria. En Dr. Housing, Ricardo se encarga de validar la factibilidad técnica y funcional de cada proyecto, garantizando eficiencia, escalabilidad y la correcta ejecución de los sistemas eléctricos, mecánicos y de climatización.\n\nSu experiencia aporta solidez técnica, reduce el riesgo y respalda las decisiones de inversión con criterios reales y fundamentados, más allá de la estética.',

  // Jimena Morales — Client Relations & Sales Manager
  '9aa79544-4f33-48ba-bd90-6d7b9fa19714':
    'Jimena ha sido una pieza clave del equipo de DR Housing durante más de cinco años, desempeñando un rol integral en la gestión, preparación y presentación profesional de propiedades residenciales en venta y alquiler.\n\nAporta una sólida experiencia operativa en el manejo de listados, la coordinación de información de propiedades y la supervisión de la producción de material visual, asegurando que cada propiedad se presente con una estética consistente, refinada y sobria, alineada con la identidad de la marca.\n\nReconocida por su atención al detalle, organización y enfoque orientado a procesos, Jimena contribuye a presentar cada propiedad con claridad, estructura y credibilidad para propietarios y clientes, siempre bajo la dirección estratégica y los estándares de calidad de DR Housing.',

  // Sharon Masís — Marketing & Brand Director
  '737bdadb-1397-4a90-88b0-b9a90f75f727':
    'Sharon forma parte del equipo de DR Housing, apoyando la gestión y presentación profesional de propiedades residenciales en venta y alquiler.\n\nSe distingue por su atención al detalle, organización y trato cercano, acompañando el proceso de ingreso de nuevas propiedades, la coordinación de listados y la comunicación inicial con clientes, siempre en línea con los estándares profesionales y las guías de marca de la firma.\n\nSu trabajo se desarrolla bajo la supervisión directa de DR Housing, garantizando una comunicación clara y una experiencia estructurada y fluida tanto para propietarios como para clientes.',
}

export function translateBio(
  agentId: string,
  englishBio: string | null | undefined,
  lang: 'es' | 'en',
): string {
  if (!englishBio) return ''
  if (lang === 'en') return englishBio
  return AGENT_BIO_ES[agentId] ?? englishBio
}
