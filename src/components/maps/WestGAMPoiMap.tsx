import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Building2, GraduationCap, ShoppingBag, MapPin, UtensilsCrossed, Hotel, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

type POICategory = 'hospital' | 'school' | 'shopping' | 'restaurant' | 'hotel' | 'corporate';

interface POI {
  id: string;
  name: string;
  nameEs?: string;
  category: POICategory;
  lat: number;
  lng: number;
  description?: string;
  descriptionEs?: string;
  area: string;
}

// West GAM Points of Interest Data - Comprehensive
const POI_DATA: POI[] = [
  // ============ HOSPITALS & HEALTHCARE ============
  // Escazú
  { id: 'h1', name: 'CIMA Hospital', category: 'hospital', lat: 9.9358, lng: -84.1498, area: 'Escazú', description: 'Premier private hospital with international standards, JCI accredited', descriptionEs: 'Hospital privado premier con estándares internacionales, acreditado JCI' },
  { id: 'h2', name: 'Clínica Bíblica Escazú', category: 'hospital', lat: 9.9289, lng: -84.1412, area: 'Escazú', description: 'Branch of leading private hospital', descriptionEs: 'Sucursal de hospital privado líder' },
  // San José / La Sabana
  { id: 'h3', name: 'Hospital Clínica Bíblica', category: 'hospital', lat: 9.9342, lng: -84.0856, area: 'San José', description: 'Leading healthcare center with specialized services', descriptionEs: 'Centro de salud líder con servicios especializados' },
  { id: 'h4', name: 'Hospital Metropolitano', category: 'hospital', lat: 9.9412, lng: -84.1012, area: 'La Sabana', description: 'Modern medical facility near Sabana Park', descriptionEs: 'Instalación médica moderna cerca del Parque La Sabana' },
  { id: 'h5', name: 'Hospital La Católica', category: 'hospital', lat: 9.9456, lng: -84.0523, area: 'Guadalupe', description: 'Renowned private hospital', descriptionEs: 'Reconocido hospital privado' },
  // Santa Ana
  { id: 'h6', name: 'Hospital Clínica Santa Ana', category: 'hospital', lat: 9.9318, lng: -84.1823, area: 'Santa Ana', description: 'Comprehensive private healthcare in Santa Ana', descriptionEs: 'Atención médica privada integral en Santa Ana' },
  { id: 'h7', name: 'Clínica de Lindora', category: 'hospital', lat: 9.9267, lng: -84.1956, area: 'Lindora', description: 'Medical services in Lindora area', descriptionEs: 'Servicios médicos en zona de Lindora' },
  // Belén / Heredia
  { id: 'h8', name: 'Hospital San Rafael de Alajuela', category: 'hospital', lat: 10.0156, lng: -84.2123, area: 'Alajuela', description: 'Regional public hospital', descriptionEs: 'Hospital público regional' },
  { id: 'h9', name: 'Clínica Belén', category: 'hospital', lat: 9.9789, lng: -84.1867, area: 'Belén', description: 'Quality healthcare in Belén area', descriptionEs: 'Atención médica de calidad en zona de Belén' },
  { id: 'h10', name: 'Hospital Hotel La Católica', category: 'hospital', lat: 9.9523, lng: -84.0734, area: 'San José', description: 'Medical tourism facility', descriptionEs: 'Centro de turismo médico' },
  // La Guácima
  { id: 'h11', name: 'Clínica La Guácima', category: 'hospital', lat: 9.9812, lng: -84.2345, area: 'La Guácima', description: 'Local healthcare services', descriptionEs: 'Servicios de salud locales' },
  { id: 'h12', name: 'Centro Médico San Rafael', category: 'hospital', lat: 10.0023, lng: -84.2267, area: 'San Rafael de Alajuela', description: 'Private medical center', descriptionEs: 'Centro médico privado' },

  // ============ SCHOOLS & UNIVERSITIES ============
  // La Guácima & San Rafael de Alajuela
  { id: 's1', name: 'Country Day School', category: 'school', lat: 9.9923, lng: -84.2234, area: 'San Rafael de Alajuela', description: 'Premier American curriculum K-12 school, IB certified', descriptionEs: 'Escuela K-12 premier con currículo americano, certificada IB' },
  { id: 's2', name: 'GSD - Global School for Development', category: 'school', lat: 9.9845, lng: -84.2389, area: 'La Guácima', description: 'Innovative bilingual education K-12', descriptionEs: 'Educación bilingüe innovadora K-12' },
  { id: 's3', name: 'Marian Baker School', category: 'school', lat: 9.9756, lng: -84.2178, area: 'La Guácima', description: 'American curriculum school', descriptionEs: 'Escuela con currículo americano' },
  { id: 's4', name: 'La Guácima Country School', category: 'school', lat: 9.9789, lng: -84.2456, area: 'La Guácima', description: 'Private bilingual school', descriptionEs: 'Escuela privada bilingüe' },
  // Escazú
  { id: 's5', name: 'Blue Valley School', category: 'school', lat: 9.9189, lng: -84.1534, area: 'Escazú', description: 'IB World School K-12', descriptionEs: 'Escuela del Mundo IB K-12' },
  { id: 's6', name: 'Pan-American School', category: 'school', lat: 9.9123, lng: -84.1456, area: 'San Rafael de Escazú', description: 'Bilingual education excellence since 1944', descriptionEs: 'Excelencia en educación bilingüe desde 1944' },
  { id: 's7', name: 'Saint Francis College', category: 'school', lat: 9.9345, lng: -84.1423, area: 'Guachipelín', description: 'Quality bilingual education K-11', descriptionEs: 'Educación bilingüe de calidad K-11' },
  { id: 's8', name: 'Colegio SEK Costa Rica', category: 'school', lat: 9.9234, lng: -84.1567, area: 'Escazú', description: 'Spanish international school network', descriptionEs: 'Red de colegios internacionales españoles' },
  // Santa Ana / Lindora
  { id: 's9', name: 'British School of Costa Rica', category: 'school', lat: 9.9234, lng: -84.1978, area: 'Santa Ana', description: 'British curriculum education', descriptionEs: 'Educación con currículo británico' },
  { id: 's10', name: 'Lighthouse International School', category: 'school', lat: 9.9189, lng: -84.1856, area: 'Santa Ana', description: 'American Christian education', descriptionEs: 'Educación cristiana americana' },
  // Rohrmoser / Sabana
  { id: 's11', name: 'Lincoln School', category: 'school', lat: 9.9634, lng: -84.1234, area: 'Rohrmoser', description: 'Prestigious American school since 1945', descriptionEs: 'Prestigiosa escuela americana desde 1945' },
  { id: 's12', name: 'Colegio Humboldt', category: 'school', lat: 9.9567, lng: -84.1156, area: 'Rohrmoser', description: 'German-Costa Rican school', descriptionEs: 'Colegio alemán-costarricense' },
  // Belén / Cariari
  { id: 's13', name: 'American International School', category: 'school', lat: 9.9789, lng: -84.2012, area: 'Cariari', description: 'American curriculum K-12', descriptionEs: 'Currículo americano K-12' },
  { id: 's14', name: 'European School', category: 'school', lat: 9.9678, lng: -84.1889, area: 'Heredia', description: 'European-style education', descriptionEs: 'Educación de estilo europeo' },
  { id: 's15', name: 'INCAE Business School', category: 'school', lat: 10.0012, lng: -84.2234, area: 'La Garita', description: 'Top Latin American MBA program', descriptionEs: 'Programa MBA líder en Latinoamérica' },
  // Universities
  { id: 's16', name: 'Universidad EARTH', category: 'school', lat: 9.9956, lng: -84.2389, area: 'La Guácima', description: 'Agricultural & sustainability university', descriptionEs: 'Universidad agrícola y de sostenibilidad' },
  { id: 's17', name: 'ULACIT Campus Sabana', category: 'school', lat: 9.9378, lng: -84.1023, area: 'La Sabana', description: 'Private university, business focus', descriptionEs: 'Universidad privada, enfoque en negocios' },
  { id: 's18', name: 'Universidad Veritas', category: 'school', lat: 9.9312, lng: -84.0923, area: 'San José', description: 'Design and architecture university', descriptionEs: 'Universidad de diseño y arquitectura' },

  // ============ SHOPPING CENTERS ============
  // Escazú
  { id: 'sh1', name: 'Multiplaza Escazú', category: 'shopping', lat: 9.9356, lng: -84.1456, area: 'Escazú', description: 'Premier luxury shopping destination', descriptionEs: 'Destino de compras de lujo premier' },
  { id: 'sh2', name: 'Avenida Escazú', category: 'shopping', lat: 9.9312, lng: -84.1389, area: 'Escazú', description: 'Mixed-use lifestyle center with dining', descriptionEs: 'Centro de estilo de vida con gastronomía' },
  { id: 'sh3', name: 'Plaza Tempo', category: 'shopping', lat: 9.9278, lng: -84.1534, area: 'Escazú', description: 'Modern retail and entertainment', descriptionEs: 'Comercio y entretenimiento moderno' },
  // Santa Ana / Lindora
  { id: 'sh4', name: 'City Place Santa Ana', category: 'shopping', lat: 9.9301, lng: -84.1823, area: 'Santa Ana', description: 'Premium shopping, dining and entertainment', descriptionEs: 'Compras, gastronomía y entretenimiento premium' },
  { id: 'sh5', name: 'Terrazas Lindora', category: 'shopping', lat: 9.9234, lng: -84.1934, area: 'Lindora', description: 'Modern shopping plaza with Target', descriptionEs: 'Plaza comercial moderna con Target' },
  { id: 'sh6', name: 'Forum I & II', category: 'shopping', lat: 9.9289, lng: -84.1756, area: 'Santa Ana', description: 'Business and retail complex', descriptionEs: 'Complejo comercial y de negocios' },
  // La Sabana / Rohrmoser
  { id: 'sh7', name: 'Oxígeno Human Playground', category: 'shopping', lat: 9.9567, lng: -84.1234, area: 'Heredia', description: 'Lifestyle and entertainment hub', descriptionEs: 'Centro de estilo de vida y entretenimiento' },
  { id: 'sh8', name: 'Plaza Rohrmoser', category: 'shopping', lat: 9.9589, lng: -84.1156, area: 'Rohrmoser', description: 'Neighborhood shopping center', descriptionEs: 'Centro comercial de barrio' },
  // Belén / Alajuela
  { id: 'sh9', name: 'City Mall Alajuela', category: 'shopping', lat: 9.9923, lng: -84.2134, area: 'Alajuela', description: 'Major regional shopping center', descriptionEs: 'Centro comercial regional importante' },
  { id: 'sh10', name: 'Plaza Real Cariari', category: 'shopping', lat: 9.9756, lng: -84.2089, area: 'Belén', description: 'Shopping and services near Cariari', descriptionEs: 'Comercio y servicios cerca de Cariari' },
  { id: 'sh11', name: 'Walmart Belén', category: 'shopping', lat: 9.9734, lng: -84.1945, area: 'Belén', description: 'Superstore and retail', descriptionEs: 'Supermercado y comercio' },
  // La Guácima
  { id: 'sh12', name: 'Plaza La Guácima', category: 'shopping', lat: 9.9823, lng: -84.2378, area: 'La Guácima', description: 'Local shopping and services', descriptionEs: 'Comercio y servicios locales' },
  { id: 'sh13', name: 'AutoMercado La Guácima', category: 'shopping', lat: 9.9789, lng: -84.2289, area: 'La Guácima', description: 'Premium supermarket', descriptionEs: 'Supermercado premium' },

  // ============ RESTAURANTS (Fine Dining & Notable) ============
  // Escazú
  { id: 'r1', name: 'Bacchus', category: 'restaurant', lat: 9.9334, lng: -84.1423, area: 'Escazú', description: 'Fine Italian dining with wine cellar', descriptionEs: 'Alta cocina italiana con cava de vinos' },
  { id: 'r2', name: 'La Luz at Alto Hotel', category: 'restaurant', lat: 9.9156, lng: -84.1567, area: 'San Rafael de Escazú', description: 'Farm-to-table fine dining with valley views', descriptionEs: 'Alta cocina de la granja a la mesa con vistas al valle' },
  { id: 'r3', name: 'Saga', category: 'restaurant', lat: 9.9312, lng: -84.1378, area: 'Escazú', description: 'Contemporary Costa Rican cuisine', descriptionEs: 'Cocina costarricense contemporánea' },
  { id: 'r4', name: 'Restaurante Grano de Oro', category: 'restaurant', lat: 9.9389, lng: -84.0934, area: 'San José', description: 'Award-winning French-inspired cuisine', descriptionEs: 'Cocina de inspiración francesa premiada' },
  { id: 'r5', name: 'Product C', category: 'restaurant', lat: 9.9345, lng: -84.1412, area: 'Escazú', description: 'Fresh seafood and ceviche bar', descriptionEs: 'Mariscos frescos y barra de ceviche' },
  // Santa Ana / Lindora
  { id: 'r6', name: 'La Terrasse', category: 'restaurant', lat: 9.9278, lng: -84.1823, area: 'Santa Ana', description: 'French cuisine in City Place', descriptionEs: 'Cocina francesa en City Place' },
  { id: 'r7', name: 'Isolina', category: 'restaurant', lat: 9.9289, lng: -84.1834, area: 'Santa Ana', description: 'Peruvian fine dining', descriptionEs: 'Alta cocina peruana' },
  { id: 'r8', name: 'Tierra y Fuego', category: 'restaurant', lat: 9.9234, lng: -84.1912, area: 'Lindora', description: 'Argentine steakhouse', descriptionEs: 'Parrilla argentina' },
  // La Sabana / Rohrmoser
  { id: 'r9', name: 'Park Café', category: 'restaurant', lat: 9.9423, lng: -84.0989, area: 'La Sabana', description: 'Michelin-recognized chef, antique setting', descriptionEs: 'Chef reconocido Michelin, ambiente de antigüedades' },
  { id: 'r10', name: 'Sikwa', category: 'restaurant', lat: 9.9378, lng: -84.0956, area: 'Barrio Escalante', description: 'Indigenous-inspired Costa Rican gastronomy', descriptionEs: 'Gastronomía costarricense de inspiración indígena' },
  { id: 'r11', name: 'Café Mundo', category: 'restaurant', lat: 9.9367, lng: -84.0823, area: 'San José', description: 'Historic mansion, international cuisine', descriptionEs: 'Mansión histórica, cocina internacional' },
  // Belén / La Guácima
  { id: 'r12', name: 'Costa Rica Beer Factory', category: 'restaurant', lat: 9.9734, lng: -84.1923, area: 'Belén', description: 'Craft brewery and gastropub', descriptionEs: 'Cervecería artesanal y gastropub' },
  { id: 'r13', name: 'La Garita Polo Club Restaurant', category: 'restaurant', lat: 9.9878, lng: -84.2456, area: 'La Guácima', description: 'Upscale dining at polo grounds', descriptionEs: 'Comida elegante en campos de polo' },
  { id: 'r14', name: 'Rancho del Valle', category: 'restaurant', lat: 9.9812, lng: -84.2312, area: 'La Guácima', description: 'Traditional Costa Rican cuisine', descriptionEs: 'Cocina tradicional costarricense' },

  // ============ HOTELS ============
  // Escazú
  { id: 'ht1', name: 'Marriott Escazú', category: 'hotel', lat: 9.9378, lng: -84.1434, area: 'Escazú', description: 'Luxury business hotel near Multiplaza', descriptionEs: 'Hotel de lujo para negocios cerca de Multiplaza' },
  { id: 'ht2', name: 'Intercontinental Costa Rica', category: 'hotel', lat: 9.9334, lng: -84.1456, area: 'Escazú', description: 'Five-star hotel at Multiplaza', descriptionEs: 'Hotel cinco estrellas en Multiplaza' },
  { id: 'ht3', name: 'Real InterContinental', category: 'hotel', lat: 9.9312, lng: -84.1389, area: 'Escazú', description: 'Premium business accommodations', descriptionEs: 'Alojamiento premium para negocios' },
  { id: 'ht4', name: 'Hotel Alta Las Palomas', category: 'hotel', lat: 9.9156, lng: -84.1578, area: 'San Rafael de Escazú', description: 'Boutique hotel with panoramic views', descriptionEs: 'Hotel boutique con vistas panorámicas' },
  // Santa Ana
  { id: 'ht5', name: 'Residence Inn Santa Ana', category: 'hotel', lat: 9.9289, lng: -84.1812, area: 'Santa Ana', description: 'Extended stay suites', descriptionEs: 'Suites para estadías prolongadas' },
  { id: 'ht6', name: 'Hampton Inn Santa Ana', category: 'hotel', lat: 9.9267, lng: -84.1845, area: 'Santa Ana', description: 'Business-friendly accommodations', descriptionEs: 'Alojamiento para negocios' },
  // La Sabana / Rohrmoser
  { id: 'ht7', name: 'Crowne Plaza Corobicí', category: 'hotel', lat: 9.9423, lng: -84.1012, area: 'La Sabana', description: 'Convention hotel near Sabana Park', descriptionEs: 'Hotel de convenciones cerca del Parque La Sabana' },
  { id: 'ht8', name: 'Tryp Sabana by Wyndham', category: 'hotel', lat: 9.9389, lng: -84.0978, area: 'La Sabana', description: 'Modern hotel facing the park', descriptionEs: 'Hotel moderno frente al parque' },
  { id: 'ht9', name: 'DoubleTree by Hilton Cariari', category: 'hotel', lat: 9.9756, lng: -84.2034, area: 'Cariari', description: 'Resort-style near airport', descriptionEs: 'Estilo resort cerca del aeropuerto' },
  // Belén / Airport area
  { id: 'ht10', name: 'Costa Rica Marriott Hacienda Belén', category: 'hotel', lat: 9.9834, lng: -84.1956, area: 'Belén', description: 'Hacienda-style luxury near airport', descriptionEs: 'Lujo estilo hacienda cerca del aeropuerto' },
  { id: 'ht11', name: 'Hilton Garden Inn Alajuela', category: 'hotel', lat: 10.0023, lng: -84.2089, area: 'Alajuela', description: 'Near airport, business amenities', descriptionEs: 'Cerca del aeropuerto, amenidades de negocios' },
  { id: 'ht12', name: 'Wyndham San José Herradura', category: 'hotel', lat: 9.9256, lng: -84.1723, area: 'Ciudad Cariari', description: 'Conference and golf resort', descriptionEs: 'Resort de conferencias y golf' },
  // La Guácima
  { id: 'ht13', name: 'Xandari Resort & Spa', category: 'hotel', lat: 10.0089, lng: -84.2234, area: 'Alajuela', description: 'Boutique eco-resort with coffee plantation', descriptionEs: 'Eco-resort boutique con plantación de café' },
  { id: 'ht14', name: 'Finca Rosa Blanca', category: 'hotel', lat: 10.0156, lng: -84.1823, area: 'Santa Bárbara', description: 'Luxury coffee plantation inn', descriptionEs: 'Posada de lujo en plantación de café' },

  // ============ CORPORATE / BUSINESS PARKS ============
  // Santa Ana
  { id: 'c1', name: 'Forum Business Park', category: 'corporate', lat: 9.9312, lng: -84.1789, area: 'Santa Ana', description: 'HQ for Amazon, Intel, Microsoft, P&G', descriptionEs: 'Sede de Amazon, Intel, Microsoft, P&G' },
  { id: 'c2', name: 'Lindora Business Center', category: 'corporate', lat: 9.9256, lng: -84.1912, area: 'Lindora', description: 'Modern office complex', descriptionEs: 'Complejo de oficinas moderno' },
  { id: 'c3', name: 'Escazú Corporate Center', category: 'corporate', lat: 9.9345, lng: -84.1489, area: 'Escazú', description: 'Class A office space', descriptionEs: 'Espacio de oficinas clase A' },
  // La Sabana / San José
  { id: 'c4', name: 'Ultrapark Sabana', category: 'corporate', lat: 9.9456, lng: -84.1023, area: 'La Sabana', description: 'Tech and shared services hub', descriptionEs: 'Centro de tecnología y servicios compartidos' },
  { id: 'c5', name: 'Oficentro La Sabana', category: 'corporate', lat: 9.9389, lng: -84.0989, area: 'La Sabana', description: 'Premium office tower', descriptionEs: 'Torre de oficinas premium' },
  { id: 'c6', name: 'Rohrmoser Corporate Center', category: 'corporate', lat: 9.9567, lng: -84.1145, area: 'Rohrmoser', description: 'Embassy row business district', descriptionEs: 'Distrito de negocios zona de embajadas' },
  // Belén / Heredia
  { id: 'c7', name: 'COYOL Free Trade Zone', category: 'corporate', lat: 10.0123, lng: -84.2189, area: 'Alajuela', description: 'Medical devices: Boston Scientific, Abbott, Baxter', descriptionEs: 'Dispositivos médicos: Boston Scientific, Abbott, Baxter' },
  { id: 'c8', name: 'Zona Franca America', category: 'corporate', lat: 9.9912, lng: -84.1234, area: 'Heredia', description: 'Tech operations: HP, Amazon, Intel', descriptionEs: 'Operaciones tech: HP, Amazon, Intel' },
  { id: 'c9', name: 'Global Park', category: 'corporate', lat: 9.9823, lng: -84.1156, area: 'Heredia', description: 'Multinational headquarters zone', descriptionEs: 'Zona de sedes multinacionales' },
  { id: 'c10', name: 'Ultrapark Heredia', category: 'corporate', lat: 9.9878, lng: -84.1089, area: 'Heredia', description: 'Shared services operations', descriptionEs: 'Operaciones de servicios compartidos' },
  // La Guácima
  { id: 'c11', name: 'INCAE Campus', category: 'corporate', lat: 10.0012, lng: -84.2234, area: 'La Garita', description: 'Executive education and conferences', descriptionEs: 'Educación ejecutiva y conferencias' },
  { id: 'c12', name: 'La Guácima Business Park', category: 'corporate', lat: 9.9789, lng: -84.2312, area: 'La Guácima', description: 'Emerging business zone', descriptionEs: 'Zona de negocios emergente' },
];

// Category configuration
const CATEGORY_CONFIG: Record<POICategory, { 
  en: string; 
  es: string; 
  icon: typeof Building2;
  color: { bg: string; border: string };
  emoji: string;
  buttonClass: string;
}> = {
  hospital: { 
    en: 'Healthcare', 
    es: 'Salud', 
    icon: Building2,
    color: { bg: '#EF4444', border: '#DC2626' },
    emoji: '🏥',
    buttonClass: 'bg-red-500 hover:bg-red-600'
  },
  school: { 
    en: 'Education', 
    es: 'Educación', 
    icon: GraduationCap,
    color: { bg: '#3B82F6', border: '#2563EB' },
    emoji: '🎓',
    buttonClass: 'bg-blue-500 hover:bg-blue-600'
  },
  shopping: { 
    en: 'Shopping', 
    es: 'Comercio', 
    icon: ShoppingBag,
    color: { bg: '#8B5CF6', border: '#7C3AED' },
    emoji: '🛍️',
    buttonClass: 'bg-violet-500 hover:bg-violet-600'
  },
  restaurant: { 
    en: 'Dining', 
    es: 'Restaurantes', 
    icon: UtensilsCrossed,
    color: { bg: '#F59E0B', border: '#D97706' },
    emoji: '🍽️',
    buttonClass: 'bg-amber-500 hover:bg-amber-600'
  },
  hotel: { 
    en: 'Hotels', 
    es: 'Hoteles', 
    icon: Hotel,
    color: { bg: '#10B981', border: '#059669' },
    emoji: '🏨',
    buttonClass: 'bg-emerald-500 hover:bg-emerald-600'
  },
  corporate: { 
    en: 'Business', 
    es: 'Empresas', 
    icon: Briefcase,
    color: { bg: '#6366F1', border: '#4F46E5' },
    emoji: '🏢',
    buttonClass: 'bg-indigo-500 hover:bg-indigo-600'
  },
};

// Custom marker icons by category
const createCategoryIcon = (category: POICategory) => {
  const config = CATEGORY_CONFIG[category];
  const { bg, border } = config.color;
  
  return L.divIcon({
    className: 'custom-poi-marker',
    html: `
      <div style="
        background-color: ${bg};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid ${border};
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <div style="
          transform: rotate(45deg);
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        ">
          ${config.emoji}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Get icon component for popup
const getCategoryIcon = (category: POICategory) => {
  const Icon = CATEGORY_CONFIG[category].icon;
  return <Icon className="w-4 h-4" />;
};

// Get background class for popup icon
const getCategoryBgClass = (category: POICategory): string => {
  const classes: Record<POICategory, string> = {
    hospital: 'bg-red-500',
    school: 'bg-blue-500',
    shopping: 'bg-violet-500',
    restaurant: 'bg-amber-500',
    hotel: 'bg-emerald-500',
    corporate: 'bg-indigo-500',
  };
  return classes[category];
};

interface WestGAMPoiMapProps {
  className?: string;
}

export function WestGAMPoiMap({ className }: WestGAMPoiMapProps) {
  const { i18n } = useTranslation();
  const isSpanish = i18n.language === 'es';
  
  // Default: show hospitals, schools, shopping
  const [activeCategories, setActiveCategories] = useState<Set<POICategory>>(
    new Set(['hospital', 'school', 'shopping'])
  );

  const toggleCategory = (category: POICategory) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Center on West GAM (slightly west to include La Guácima)
  const center: [number, number] = [9.9600, -84.1800];

  const categories = Object.keys(CATEGORY_CONFIG) as POICategory[];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Category Filter Buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => {
          const config = CATEGORY_CONFIG[category];
          const Icon = config.icon;
          const isActive = activeCategories.has(category);
          const count = POI_DATA.filter(p => p.category === category).length;
          
          return (
            <Button
              key={category}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => toggleCategory(category)}
              className={cn(
                "gap-1.5 transition-all text-xs sm:text-sm",
                isActive && config.buttonClass,
                isActive && "text-white border-transparent"
              )}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{isSpanish ? config.es : config.en}</span>
              <span className="sm:hidden">{config.emoji}</span>
              <span className={cn(
                "ml-0.5 px-1.5 py-0.5 rounded-full text-xs",
                isActive ? "bg-white/20" : "bg-muted"
              )}>
                {count}
              </span>
            </Button>
          );
        })}
      </div>

      {/* Map Container */}
      <div className="rounded-xl overflow-hidden border border-border h-[500px] shadow-lg">
        <MapContainer
          center={center}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {POI_DATA.map((poi) => {
            const isActive = activeCategories.has(poi.category);
            if (!isActive) return null;
            
            return (
              <Marker
                key={poi.id}
                position={[poi.lat, poi.lng]}
                icon={createCategoryIcon(poi.category)}
              >
                <Popup className="poi-popup" minWidth={240} maxWidth={280}>
                  <div className="p-1">
                    <div className="flex items-start gap-2 mb-2">
                      <span className={cn(
                        "shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm",
                        getCategoryBgClass(poi.category)
                      )}>
                        {getCategoryIcon(poi.category)}
                      </span>
                      <div>
                        <h3 className="font-semibold text-foreground text-sm leading-tight">
                          {poi.name}
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {poi.area}
                        </p>
                      </div>
                    </div>
                    {(poi.description || poi.descriptionEs) && (
                      <p className="text-xs text-muted-foreground border-t border-border pt-2 mt-2">
                        {isSpanish ? (poi.descriptionEs || poi.description) : poi.description}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
        {categories.map((category) => {
          const config = CATEGORY_CONFIG[category];
          const count = POI_DATA.filter(p => p.category === category).length;
          const isActive = activeCategories.has(category);
          
          return (
            <span 
              key={category} 
              className={cn(
                "flex items-center gap-1.5 transition-opacity",
                !isActive && "opacity-40"
              )}
            >
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: config.color.bg }}
              />
              {isSpanish ? config.es : config.en} ({count})
            </span>
          );
        })}
      </div>
    </div>
  );
}
