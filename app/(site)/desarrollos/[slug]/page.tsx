import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import DesarrolloDetailClient from './DesarrolloDetailClient'

// Mirror the data from desarrollos/page.tsx — single source of truth
export const developments = [
  {
    id: 'proyecto-lindora-residences',
    slug: 'lindora-residences',
    name: 'Lindora Residences',
    nameEn: 'Lindora Residences',
    location: 'Lindora, Santa Ana',
    status: 'Preventa',
    statusEn: 'Pre-Sale',
    statusColor: 'bg-gold/20 text-foreground border border-gold/30',
    type: 'Casas de Lujo',
    typeEn: 'Luxury Homes',
    units: '12 unidades',
    unitsEn: '12 units',
    priceFrom: 450000,
    completion: '2026',
    description: 'Proyecto residencial exclusivo de 12 casas de lujo en Lindora, Santa Ana. Diseño arquitectónico contemporáneo con vistas a la montaña, acabados premium importados y amplios jardines privados.',
    descriptionEn: 'Exclusive residential project of 12 luxury homes in Lindora, Santa Ana. Contemporary architectural design with mountain views, imported premium finishes, and spacious private gardens.',
    features: [
      'Área de construcción: 280–420 m²',
      'Lotes individuales de 500–800 m²',
      'Acabados premium: mármol, maderas nobles',
      'Sistema domótico integrado',
      'Piscina privada opcional',
      'Seguridad 24/7 con acceso controlado',
    ],
    featuresEn: [
      'Construction area: 280–420 m²',
      'Individual lots of 500–800 m²',
      'Premium finishes: marble, noble woods',
      'Integrated home automation system',
      'Optional private pool',
      '24/7 security with controlled access',
    ],
    image: '/services/real-estate-brokerage.jpg',
    lat: 9.9500,
    lng: -84.1500,
    plusvalia: 'Lindora se encuentra en una de las zonas de mayor apreciación del Corredor Oeste, impulsada por la proximidad a Ruta 27, el aeropuerto Tobías Bolaños y la consolidación de centros empresariales. Los proyectos residenciales en esta zona han mostrado una apreciación promedio del 12–18% entre preventa y entrega en los últimos 5 años.',
    plusvaliaEn: 'Lindora is in one of the highest appreciation zones of the Western Corridor, driven by proximity to Ruta 27, Tobías Bolaños Airport, and the consolidation of business centers. Residential projects in this area have shown average appreciation of 12–18% between pre-sale and delivery over the past 5 years.',
  },
  {
    id: 'proyecto-escazu-torres',
    slug: 'escazu-skyline-condos',
    name: 'Escazú Skyline Condos',
    nameEn: 'Escazú Skyline Condos',
    location: 'Escazú Centro',
    status: 'En Construcción',
    statusEn: 'Under Construction',
    statusColor: 'bg-primary/10 text-primary border border-primary/20',
    type: 'Condominios',
    typeEn: 'Condominiums',
    units: '28 apartamentos',
    unitsEn: '28 apartments',
    priceFrom: 280000,
    completion: '2025',
    description: 'Torre residencial de lujo en el corazón de Escazú con amenidades de primer nivel. Apartamentos de 1, 2 y 3 habitaciones con vistas panorámicas al Valle Central.',
    descriptionEn: 'Luxury residential tower in the heart of Escazú with top-tier amenities. 1, 2, and 3-bedroom apartments with panoramic views of the Central Valley.',
    features: [
      'Pisos 4 al 12 con vistas panorámicas',
      'Amenidades: piscina, gym, coworking',
      'Estacionamiento doble techado',
      'Lobby con concierge 24/7',
      'Área de entretenimiento en rooftop',
      'Certificación EDGE en sostenibilidad',
    ],
    featuresEn: [
      'Floors 4–12 with panoramic views',
      'Amenities: pool, gym, co-working',
      'Covered double parking',
      'Lobby with 24/7 concierge',
      'Rooftop entertainment area',
      'EDGE sustainability certification',
    ],
    image: '/services/property-management.jpg',
    lat: 9.9188,
    lng: -84.1386,
    plusvalia: 'Escazú sigue siendo el distrito de mayor valor por metro cuadrado en Costa Rica. La torre se ubica a pasos de Multiplaza, Clínica Bíblica y el corredor financiero de la zona, factores que garantizan liquidez y demanda constante tanto para uso propio como inversión.',
    plusvaliaEn: 'Escazú remains the highest value-per-square-meter district in Costa Rica. The tower is steps from Multiplaza, Clínica Bíblica, and the financial corridor, factors that guarantee liquidity and constant demand both for own use and investment.',
  },
]

const DEVS_BY_SLUG = Object.fromEntries(developments.map((d) => [d.slug, d]))

export function generateStaticParams() {
  return developments.map((d) => ({ slug: d.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const dev = DEVS_BY_SLUG[params.slug]
  if (!dev) return {}
  return {
    title: `${dev.name} | DR Housing Desarrollos`,
    description: dev.description,
  }
}

export default function DesarrolloDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const dev = DEVS_BY_SLUG[params.slug]
  if (!dev) notFound()
  return <DesarrolloDetailClient development={dev} />
}

export type Development = (typeof developments)[number]
