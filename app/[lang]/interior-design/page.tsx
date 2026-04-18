import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  Hammer,
  Sofa,
  Lightbulb,
  Palette,
  Cpu,
  Building2,
  Check,
  ArrowRight,
  Mail,
} from 'lucide-react'
import WhatsAppCTA from '@/components/WhatsAppCTA'
import BeforeAfterSlider, { type BeforeAfterPair } from '@/components/interior-design/BeforeAfterSlider'
import ProjectGallery, { type GalleryImage } from '@/components/interior-design/ProjectGallery'
import InteriorFAQ, { type FAQItem } from '@/components/interior-design/InteriorFAQ'

// ── Content ──────────────────────────────────────────────────────────────────
// All copy lives in one dictionary so translators / admins can grep for a
// phrase and find it immediately. Keep it here until a `site_settings`
// interior-design key is added (Phase 2 — same pattern as service_cards).
const CONTENT = {
  es: {
    metaTitle: 'Diseño Interior de Lujo | DR Housing',
    metaDesc:
      'Estudio de interiorismo residencial de alta gama en Costa Rica. Renovaciones integrales, curaduría de mobiliario y staging para propiedades premium.',

    hero: {
      eyebrow: 'Estudio de Interiorismo',
      title:   'Interiorismo residencial\nde alta gama.',
      subtitle:
        'Espacios diseñados a medida para quienes valoran la privacidad, la artesanía y el detalle. Desde el primer concepto hasta la última pieza de iluminación.',
      ctaPrimary:   'Agendar consulta privada',
      ctaSecondary: 'Ver proyectos',
      whatsappMsg:
        'Hola DR Housing, me gustaría agendar una consulta privada sobre un proyecto de diseño interior.',
    },

    philosophy: {
      eyebrow: 'Nuestra filosofía',
      title:   'Los interiores no se ven, se sienten.',
      body:
        'Cada proyecto es una conversación sostenida entre la arquitectura, la luz natural, los materiales nobles y la vida íntima de quienes habitan el espacio. Trabajamos en silencio, con pocos clientes a la vez, para que cada decisión reciba el tiempo que merece.',
    },

    services: {
      eyebrow: 'Qué diseñamos',
      title:   'De una sala específica al proyecto llave en mano.',
      items: [
        { title: 'Renovaciones integrales',  desc: 'Reconstrucción llave en mano de residencias completas, desde demolición hasta puesta en marcha.' },
        { title: 'Curaduría de mobiliario',  desc: 'Selección exclusiva de piezas europeas, artesanales y contemporáneas para cada ambiente.' },
        { title: 'Diseño de iluminación',    desc: 'Planos lumínicos profesionales que modelan cada espacio con capas, temperatura y atmósfera.' },
        { title: 'Arte y objetos',           desc: 'Curaduría de arte contemporáneo y piezas de colección alineadas con el carácter del proyecto.' },
        { title: 'Integración domótica',     desc: 'Control de clima, audio, cortinas, persianas e iluminación en sistemas silenciosos y confiables.' },
        { title: 'Staging pre-venta',        desc: 'Puesta en escena de propiedades en venta para maximizar percepción y valor en el mercado premium.' },
      ],
    },

    beforeAfter: {
      eyebrow:  'Antes y después',
      title:    'Transformaciones reales, resultados medibles.',
      hint:     'Arrastre el deslizador para comparar',
      before:   'Antes',
      after:    'Después',
      captions: [
        'Residencia Villa Real — Santa Ana',
        'Penthouse Escazú — Trejos Montealegre',
        'Casa La Guácima — Alajuela',
      ],
    },

    gallery: {
      eyebrow:  'Proyectos destacados',
      title:    'Un cuaderno de referencias.',
      subtitle: 'Una selección de los proyectos recientes del estudio. Haga clic en cualquier imagen para ampliar.',
      close:    'Cerrar',
      prev:     'Anterior',
      next:     'Siguiente',
    },

    process: {
      eyebrow: 'Nuestro proceso',
      title:   'Un camino claro, de la primera conversación a la entrega final.',
      steps: [
        { name: 'Consulta',      duration: '1 semana',    desc: 'Conversación inicial para entender necesidades, estilo de vida y presupuesto.' },
        { name: 'Concepto',      duration: '2–3 semanas', desc: 'Moodboards, paletas y dirección arquitectónica.' },
        { name: 'Diseño',        duration: '4–6 semanas', desc: 'Planos técnicos, renders 3D y especificación de materiales.' },
        { name: 'Fuentes',       duration: '4–8 semanas', desc: 'Selección y adquisición de mobiliario, iluminación y piezas de arte.' },
        { name: 'Construcción',  duration: '3–6 meses',   desc: 'Ejecución con contratistas de confianza y supervisión semanal en obra.' },
        { name: 'Entrega',       duration: '1 semana',    desc: 'Instalación final, styling, puesta a punto y guía de uso.' },
      ],
    },

    partners: {
      eyebrow:  'Ateliers y marcas',
      title:    'Las casas con las que colaboramos.',
      subtitle: 'Mobiliario italiano, iluminación escandinava, y una red de artesanos costarricenses cuidadosamente seleccionada durante años.',
      brands: ['Minotti', 'Flos', 'Poliform', 'Molteni&C', 'Cassina', 'Baxter', 'Lema', 'Rimadesio', 'Living Divani', 'Gubi', 'Vitra', 'B&B Italia'],
    },

    testimonials: {
      eyebrow: 'Lo que dicen nuestros clientes',
      title:   'Proyectos que siguen siendo hogar años después.',
      items: [
        { quote: 'Paola entendió cómo vivimos antes de saber qué queríamos. La casa que diseñó para nosotros se siente habitada desde el primer día.', author: 'Andrea L.', project: 'Residencia Escazú' },
        { quote: 'Un proceso silencioso y disciplinado. Entregaron cinco semanas antes del plazo prometido y dentro del presupuesto.', author: 'Roberto M.', project: 'Renovación Santa Ana' },
        { quote: 'Nos mudamos a Costa Rica sin conocer a nadie. DR Housing convirtió un condominio en bruto en nuestro primer hogar costarricense.', author: 'Jennifer & David H.', project: 'Penthouse Ciudad Colón' },
      ],
    },

    pricing: {
      eyebrow: 'Paquetes',
      title:   'Tres formas de trabajar juntos.',
      subtitle: 'Los rangos son puntos de partida. Cada proyecto recibe una propuesta formal con alcance y cronograma detallados.',
      tiers: [
        {
          name: 'Refresh',
          price: 'Desde $45.000',
          desc:  'Actualización de ambientes seleccionados',
          featured: false,
          includes: [
            'Curaduría de mobiliario',
            'Textiles y arte',
            'Capa de iluminación complementaria',
            'Revisión de styling final',
          ],
        },
        {
          name: 'Renovación Integral',
          price: 'Desde $120.000',
          desc:  'Proyecto completo de interiorismo residencial',
          featured: true,
          includes: [
            'Demolición y reconstrucción',
            'Diseño arquitectónico interior',
            'Planos técnicos y renders 3D',
            'Gestión de contratistas',
            'Curaduría total de piezas',
            'Supervisión semanal en obra',
            'Entrega llave en mano',
          ],
        },
        {
          name: 'Turnkey Development',
          price: 'Consulta privada',
          desc:  'Proyectos multifamiliares y desarrollos completos',
          featured: false,
          includes: [
            'Interiores tipo hotel',
            'Unidad modelo',
            'Paquetes pre-venta',
            'Amenidades compartidas',
            'Coordinación con el desarrollador',
          ],
        },
      ],
    },

    faq: {
      eyebrow: 'Preguntas frecuentes',
      title:   'Lo que los clientes suelen preguntar.',
      items: [
        { question: '¿Qué zonas cubren?',
          answer: 'Trabajamos principalmente en el Valle Central (Escazú, Santa Ana, Rohrmoser, Ciudad Colón, La Guácima) y en destinos costeros (Guanacaste, Pacífico Sur). Viajamos para proyectos que lo justifiquen.' },
        { question: '¿Cuánto tarda un proyecto?',
          answer: 'Un refresh suele completarse en 3-4 meses. Una renovación integral toma entre 8 y 14 meses, dependiendo del alcance y los permisos. Comunicamos un cronograma detallado en la fase de concepto.' },
        { question: '¿Gestionan permisos municipales?',
          answer: 'Sí. Coordinamos con nuestro equipo legal y arquitectónico la obtención de permisos, planos aprobados por CFIA, inspecciones municipales y la bitácora de obra.' },
        { question: '¿Trabajan con presupuesto definido?',
          answer: 'Siempre. Presupuesto, alcance y calendario son los tres ejes del proyecto. Entregamos presupuestos granulares y actualizamos el reporte cada semana durante la ejecución.' },
        { question: '¿Pueden comprar mobiliario fuera de Costa Rica?',
          answer: 'Importamos regularmente de Italia, Dinamarca, España y Estados Unidos. Gestionamos aduanas, transporte especializado e instalación con nuestros propios equipos.' },
        { question: '¿Cómo se calcula la tarifa de diseño?',
          answer: 'La tarifa depende del alcance: un porcentaje sobre el presupuesto total de obra para renovaciones y un honorario fijo por paquete para refresh. Lo confirmamos en la propuesta formal.' },
        { question: '¿Puedo conservar piezas que ya tengo?',
          answer: 'Por supuesto. Parte de nuestro trabajo es curar el diálogo entre lo nuevo y lo existente. Frecuentemente restauramos piezas heredadas o re-tapizamos para integrarlas al nuevo diseño.' },
        { question: '¿Ofrecen staging para vender mi propiedad?',
          answer: 'Sí. Un programa de staging dura típicamente 2-3 semanas y, en nuestra experiencia, mejora el precio final entre 6% y 14% en propiedades premium.' },
      ] as FAQItem[],
    },

    closing: {
      eyebrow: 'Comience el proyecto',
      title:   'Hablemos del espacio que quiere habitar.',
      body:    'Cada consulta privada comienza con una conversación sin compromiso de 45 minutos, presencial en nuestro estudio de Escazú o por videollamada.',
      whatsapp:'Agendar por WhatsApp',
      email:   'Escribir un correo',
      emailAddr:'info@drhousing.net',
      whatsappMsg:
        'Hola DR Housing, me gustaría conversar sobre un proyecto de interiorismo.',
    },
  },

  en: {
    metaTitle: 'Luxury Interior Design | DR Housing',
    metaDesc:
      'High-end residential interior design studio in Costa Rica. Full renovations, furniture curation, and staging for premium properties.',

    hero: {
      eyebrow: 'Interior Design Studio',
      title:   'High-end residential\ninterior design.',
      subtitle:
        'Bespoke spaces for clients who value privacy, craft, and the details that go unseen. From first concept to the last piece of lighting.',
      ctaPrimary:   'Schedule private consultation',
      ctaSecondary: 'View projects',
      whatsappMsg:
        'Hi DR Housing, I would like to schedule a private consultation for an interior design project.',
    },

    philosophy: {
      eyebrow: 'Our philosophy',
      title:   "Great interiors aren't seen — they're felt.",
      body:
        'Every project is a sustained conversation between architecture, natural light, noble materials, and the private life of the people who live in the space. We work quietly, with few clients at a time, so that every decision receives the time it deserves.',
    },

    services: {
      eyebrow: 'What we design',
      title:   'From a single room to a turn-key project.',
      items: [
        { title: 'Full renovations',          desc: 'Turn-key reconstruction of complete residences, from demolition to handover.' },
        { title: 'Furniture curation',        desc: 'Bespoke selection of European, artisanal, and contemporary pieces for every room.' },
        { title: 'Lighting design',           desc: 'Professional lighting plans that shape each space through layers, temperature, and mood.' },
        { title: 'Art & objets',              desc: "Contemporary art curation and collectible pieces aligned to the project's character." },
        { title: 'Smart-home integration',    desc: 'Climate, audio, shading, and lighting control in quiet, dependable systems.' },
        { title: 'Pre-sale staging',          desc: 'Staging for listings to maximize perceived value in the premium market.' },
      ],
    },

    beforeAfter: {
      eyebrow:  'Before & after',
      title:    'Real transformations, measurable results.',
      hint:     'Drag the slider to compare',
      before:   'Before',
      after:    'After',
      captions: [
        'Villa Real Residence — Santa Ana',
        'Escazú Penthouse — Trejos Montealegre',
        'La Guácima House — Alajuela',
      ],
    },

    gallery: {
      eyebrow:  'Featured projects',
      title:    'A book of references.',
      subtitle: "A selection of the studio's recent work. Click any image to view in full.",
      close:    'Close',
      prev:     'Previous',
      next:     'Next',
    },

    process: {
      eyebrow: 'Our process',
      title:   'A clear path, from first conversation to final delivery.',
      steps: [
        { name: 'Consultation',  duration: '1 week',      desc: 'Initial conversation to understand needs, lifestyle, and budget.' },
        { name: 'Concept',       duration: '2–3 weeks',   desc: 'Moodboards, palettes, and architectural direction.' },
        { name: 'Design',        duration: '4–6 weeks',   desc: 'Technical drawings, 3D renders, and material specifications.' },
        { name: 'Sourcing',      duration: '4–8 weeks',   desc: 'Selection and acquisition of furniture, lighting, and art.' },
        { name: 'Construction',  duration: '3–6 months',  desc: 'Execution with trusted contractors and weekly on-site supervision.' },
        { name: 'Reveal',        duration: '1 week',      desc: 'Final install, styling, tuning, and user guide.' },
      ],
    },

    partners: {
      eyebrow:  'Ateliers & brands',
      title:    'The houses we collaborate with.',
      subtitle: 'Italian furniture, Scandinavian lighting, and a carefully-built network of Costa Rican artisans.',
      brands: ['Minotti', 'Flos', 'Poliform', 'Molteni&C', 'Cassina', 'Baxter', 'Lema', 'Rimadesio', 'Living Divani', 'Gubi', 'Vitra', 'B&B Italia'],
    },

    testimonials: {
      eyebrow: 'What our clients say',
      title:   'Projects that still feel like home years later.',
      items: [
        { quote: 'Paola understood how we lived before we knew what we wanted. The house she designed for us felt lived-in from day one.', author: 'Andrea L.', project: 'Escazú Residence' },
        { quote: 'A quiet, disciplined process. Delivered five weeks ahead of schedule and inside budget.', author: 'Roberto M.', project: 'Santa Ana Renovation' },
        { quote: 'We moved to Costa Rica not knowing anyone. DR Housing turned a raw condo into our first Costa Rican home.', author: 'Jennifer & David H.', project: 'Ciudad Colón Penthouse' },
      ],
    },

    pricing: {
      eyebrow: 'Packages',
      title:   'Three ways to work together.',
      subtitle: 'Ranges are starting points. Every project receives a formal proposal with detailed scope and schedule.',
      tiers: [
        {
          name: 'Refresh',
          price: 'From $45,000',
          desc:  'Update of selected rooms',
          featured: false,
          includes: [
            'Furniture curation',
            'Textiles & art',
            'Supplemental lighting layer',
            'Final styling revision',
          ],
        },
        {
          name: 'Full Renovation',
          price: 'From $120,000',
          desc:  'Complete residential interior project',
          featured: true,
          includes: [
            'Demolition & rebuild',
            'Interior architecture',
            'Technical & 3D drawings',
            'Contractor management',
            'Full piece curation',
            'Weekly on-site supervision',
            'Turn-key handover',
          ],
        },
        {
          name: 'Turnkey Development',
          price: 'Private quote',
          desc:  'Multi-family projects and full developments',
          featured: false,
          includes: [
            'Hotel-grade interiors',
            'Model unit',
            'Pre-sale packages',
            'Shared amenities',
            'Developer coordination',
          ],
        },
      ],
    },

    faq: {
      eyebrow: 'Frequently asked',
      title:   'What clients usually want to know.',
      items: [
        { question: 'What areas do you serve?',
          answer: 'We work primarily in the Central Valley (Escazú, Santa Ana, Rohrmoser, Ciudad Colón, La Guácima) and coastal destinations (Guanacaste, South Pacific). We travel for projects that warrant it.' },
        { question: 'How long does a project take?',
          answer: 'A refresh typically finishes in 3-4 months. A full renovation takes 8 to 14 months depending on scope and permits. We share a detailed schedule at concept phase.' },
        { question: 'Do you handle municipal permits?',
          answer: 'Yes. Our legal and architecture team handles permits, CFIA-approved drawings, municipal inspections, and the on-site log book.' },
        { question: 'Do you work to a fixed budget?',
          answer: 'Always. Budget, scope, and schedule are the three axes of every project. We deliver granular budgets and update the report weekly during execution.' },
        { question: 'Can you source furniture from abroad?',
          answer: 'We regularly import from Italy, Denmark, Spain, and the United States. We handle customs, specialized transport, and install with our own teams.' },
        { question: 'How is the design fee calculated?',
          answer: 'The fee depends on scope: a percentage of the total construction budget for renovations, and a flat package fee for refresh. We confirm in the formal proposal.' },
        { question: 'Can I keep pieces I already own?',
          answer: 'Of course. Part of our work is curating the dialogue between the new and the existing. We often restore inherited pieces or re-upholster them to fit the new design.' },
        { question: 'Do you offer staging to sell my property?',
          answer: 'Yes. A staging program typically takes 2-3 weeks and, in our experience, improves the final sale price by 6-14% on premium properties.' },
      ] as FAQItem[],
    },

    closing: {
      eyebrow: 'Start your project',
      title:   "Let's talk about the space you want to live in.",
      body:    'Every private consultation begins with a no-commitment 45-minute conversation, either in person at our Escazú studio or by video.',
      whatsapp:'Schedule via WhatsApp',
      email:   'Send an email',
      emailAddr:'info@drhousing.net',
      whatsappMsg:
        'Hi DR Housing, I would like to discuss an interior design project.',
    },
  },
} as const

// ── Imagery ──────────────────────────────────────────────────────────────────
// All URLs go through Unsplash (domain already allow-listed in
// next.config.mjs). To replace with real project photography: upload to the
// `site-assets` Supabase bucket and swap the URLs here — no other changes
// needed. Every image is flagged with `unoptimized` to keep the build fast
// (Unsplash already serves auto-optimized variants).
const IMG = {
  hero:
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=2000&q=85&auto=format&fit=crop',

  beforeAfter: [
    {
      before: 'https://images.unsplash.com/photo-1580130379624-3a069adbffc2?w=1200&q=80&auto=format&fit=crop',
      after:  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80&auto=format&fit=crop',
    },
    {
      before: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=1200&q=80&auto=format&fit=crop',
      after:  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80&auto=format&fit=crop',
    },
    {
      before: 'https://images.unsplash.com/photo-1558882224-dda166733046?w=1200&q=80&auto=format&fit=crop',
      after:  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format&fit=crop',
    },
  ],

  gallery: [
    'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1616627781-8b35adb1d73c?w=1200&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1616593969747-4797dc75033e?w=1200&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618220179428-22790b461013?w=1200&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1200&q=80&auto=format&fit=crop',
  ],

  philosophy:
    'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1800&q=85&auto=format&fit=crop',
} as const

// Icon for each service tile — indexes align with CONTENT.services.items.
const SERVICE_ICONS = [Hammer, Sofa, Lightbulb, Palette, Cpu, Building2] as const

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const lang = params.lang === 'es' ? 'es' : 'en'
  const c = CONTENT[lang]
  return {
    title: c.metaTitle,
    description: c.metaDesc,
    openGraph: {
      title: c.metaTitle,
      description: c.metaDesc,
      images: [{ url: IMG.hero, width: 2000, height: 1333, alt: c.hero.title }],
      type: 'website',
      locale: lang === 'es' ? 'es_CR' : 'en_US',
      siteName: 'DR Housing',
    },
    twitter: {
      card: 'summary_large_image',
      title: c.metaTitle,
      description: c.metaDesc,
      images: [IMG.hero],
    },
    alternates: {
      canonical: `https://drhousing.net/${lang}/interior-design`,
      languages: {
        es: 'https://drhousing.net/es/interior-design',
        en: 'https://drhousing.net/en/interior-design',
      },
    },
  }
}

export default function InteriorDesignPage({ params }: { params: { lang: string } }) {
  const lang = params.lang === 'es' ? 'es' : 'en'
  const c = CONTENT[lang]

  // Pair up before/after images with their captions for the slider grid
  const beforeAfterPairs: BeforeAfterPair[] = IMG.beforeAfter.map((pair, i) => ({
    before:  pair.before,
    after:   pair.after,
    caption: c.beforeAfter.captions[i],
  }))

  const galleryImages: GalleryImage[] = IMG.gallery.map((src, i) => ({
    src,
    alt: `${c.gallery.title} — ${i + 1}`,
  }))

  // Schema.org JSON-LD — helps Google classify the page as a professional
  // service, useful for local SEO ("interior design Costa Rica").
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'DR Housing — Interior Design',
    description: c.metaDesc,
    url: `https://drhousing.net/${lang}/interior-design`,
    image: IMG.hero,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Escazú',
      addressRegion: 'San José',
      addressCountry: 'CR',
    },
    telephone: '+50686540888',
    priceRange: '$$$$',
    areaServed: 'Costa Rica',
    serviceType: [
      'Interior Design',
      'Home Renovation',
      'Furniture Curation',
      'Property Staging',
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] md:min-h-[92vh] flex items-center justify-center overflow-hidden">
        <Image
          src={IMG.hero}
          alt={c.hero.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          unoptimized
        />
        {/* Dark overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/70" />

        <div className="relative z-10 container-wide text-center text-white px-6">
          <p className="font-sans text-xs md:text-sm tracking-[0.3em] uppercase text-[#C9A96E] mb-6">
            {c.hero.eyebrow}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light leading-[1.05] max-w-4xl mx-auto whitespace-pre-line">
            {c.hero.title}
          </h1>
          <p className="mt-8 max-w-2xl mx-auto font-sans text-base md:text-lg text-white/85 leading-relaxed">
            {c.hero.subtitle}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <WhatsAppCTA
              message={c.hero.whatsappMsg}
              label={c.hero.ctaPrimary}
              variant="hero"
            />
            <a
              href="#gallery"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-lg border border-white/40 text-white text-base font-sans font-medium hover:bg-white/10 transition-colors min-h-[48px]"
            >
              {c.hero.ctaSecondary}
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── PHILOSOPHY ──────────────────────────────────────────────────── */}
      <section className="py-20 md:py-32 bg-[#F5F2EE]">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div>
              <p className="font-sans text-xs tracking-[0.3em] uppercase text-[#C9A96E] mb-6">
                {c.philosophy.eyebrow}
              </p>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-[#1A1A1A] leading-[1.15]">
                {c.philosophy.title}
              </h2>
              <p className="mt-8 font-sans text-base md:text-lg text-[#4A4A4A] leading-relaxed">
                {c.philosophy.body}
              </p>
            </div>
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-xl order-first md:order-last">
              <Image
                src={IMG.philosophy}
                alt={c.philosophy.title}
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT WE DESIGN ──────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container-wide">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-[#C9A96E] mb-4">
              {c.services.eyebrow}
            </p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-foreground leading-tight">
              {c.services.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {c.services.items.map((item, i) => {
              const Icon = SERVICE_ICONS[i]
              return (
                <div
                  key={i}
                  className="group p-8 rounded-xl border border-[#E8E3DC] hover:border-[#C9A96E] transition-all duration-300 bg-white"
                >
                  <div className="w-14 h-14 rounded-full bg-[#F5F2EE] flex items-center justify-center mb-6 group-hover:bg-[#C9A96E]/15 transition-colors">
                    <Icon className="w-6 h-6 text-[#C9A96E]" />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── BEFORE / AFTER ──────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-[#F5F2EE]">
        <div className="container-wide">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-[#C9A96E] mb-4">
              {c.beforeAfter.eyebrow}
            </p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-foreground leading-tight">
              {c.beforeAfter.title}
            </h2>
          </div>

          <BeforeAfterSlider
            pairs={beforeAfterPairs}
            beforeLabel={c.beforeAfter.before}
            afterLabel={c.beforeAfter.after}
            hint={c.beforeAfter.hint}
          />
        </div>
      </section>

      {/* ── GALLERY ─────────────────────────────────────────────────────── */}
      <section id="gallery" className="py-20 md:py-28 bg-background" style={{ scrollMarginTop: '96px' }}>
        <div className="container-wide">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-[#C9A96E] mb-4">
              {c.gallery.eyebrow}
            </p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-foreground leading-tight mb-4">
              {c.gallery.title}
            </h2>
            <p className="font-sans text-base text-muted-foreground">
              {c.gallery.subtitle}
            </p>
          </div>

          <ProjectGallery
            images={galleryImages}
            closeLabel={c.gallery.close}
            prevLabel={c.gallery.prev}
            nextLabel={c.gallery.next}
          />
        </div>
      </section>

      {/* ── PROCESS ─────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-[#2C2C2C] text-white">
        <div className="container-wide">
          <div className="max-w-2xl mb-16">
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-[#C9A96E] mb-4">
              {c.process.eyebrow}
            </p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light leading-tight">
              {c.process.title}
            </h2>
          </div>

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10 rounded-xl overflow-hidden">
            {c.process.steps.map((step, i) => (
              <li key={i} className="relative p-8 bg-[#2C2C2C] min-h-[220px]">
                <span className="font-serif text-5xl text-[#C9A96E]/40 font-light leading-none">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="mt-6">
                  <h3 className="font-serif text-xl font-medium mb-1">
                    {step.name}
                  </h3>
                  <p className="font-sans text-xs tracking-widest uppercase text-[#C9A96E] mb-4">
                    {step.duration}
                  </p>
                  <p className="font-sans text-sm text-white/70 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── PARTNERS / BRANDS ───────────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-background">
        <div className="container-wide">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-[#C9A96E] mb-4">
              {c.partners.eyebrow}
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground leading-tight mb-4">
              {c.partners.title}
            </h2>
            <p className="font-sans text-base text-muted-foreground">
              {c.partners.subtitle}
            </p>
          </div>

          {/* Brand names as typography rather than logos — elegant, and it
              avoids the trademark mess of showing real brand marks until the
              studio has formal partnership agreements to display. */}
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 max-w-4xl mx-auto">
            {c.partners.brands.map((brand) => (
              <span
                key={brand}
                className="font-serif text-xl md:text-2xl text-muted-foreground/70 tracking-wider hover:text-foreground transition-colors"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-[#F5F2EE]">
        <div className="container-wide">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-[#C9A96E] mb-4">
              {c.testimonials.eyebrow}
            </p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-foreground leading-tight">
              {c.testimonials.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {c.testimonials.items.map((t, i) => (
              <blockquote
                key={i}
                className="bg-white rounded-xl p-8 md:p-10 border border-[#E8E3DC] flex flex-col"
              >
                <svg
                  className="w-10 h-10 text-[#C9A96E]/60 mb-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M7.17 6.16c-3 1.76-5.26 5-5.26 9.62 0 2.72 1.85 4.22 4 4.22 1.88 0 3.43-1.36 3.43-3.22 0-1.82-1.32-3.07-3-3.07-.34 0-.82.07-.93.13.31-1.91 2.2-4.09 4.13-5.15L7.17 6.16zm9 0c-3 1.76-5.25 5-5.25 9.62 0 2.72 1.85 4.22 4 4.22 1.87 0 3.42-1.36 3.42-3.22 0-1.82-1.32-3.07-3-3.07-.34 0-.82.07-.94.13.31-1.91 2.2-4.09 4.13-5.15L16.17 6.16z" />
                </svg>
                <p className="font-serif text-[17px] md:text-lg text-foreground leading-relaxed flex-1 italic">
                  {t.quote}
                </p>
                <footer className="mt-8 pt-6 border-t border-[#E8E3DC]">
                  <p className="font-sans text-sm font-medium text-foreground">
                    {t.author}
                  </p>
                  <p className="font-sans text-xs text-muted-foreground tracking-wide uppercase mt-1">
                    {t.project}
                  </p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container-wide">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-[#C9A96E] mb-4">
              {c.pricing.eyebrow}
            </p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-foreground leading-tight mb-4">
              {c.pricing.title}
            </h2>
            <p className="font-sans text-base text-muted-foreground">
              {c.pricing.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {c.pricing.tiers.map((tier) => (
              <div
                key={tier.name}
                className={`
                  relative rounded-xl p-8 md:p-10 flex flex-col
                  ${tier.featured
                    ? 'bg-[#2C2C2C] text-white border-2 border-[#C9A96E] shadow-2xl md:-translate-y-4'
                    : 'bg-white border border-[#E8E3DC]'
                  }
                `}
              >
                {tier.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#C9A96E] text-white text-xs font-sans font-medium tracking-widest uppercase">
                    {lang === 'es' ? 'Más solicitado' : 'Most requested'}
                  </span>
                )}

                <div className={tier.featured ? 'text-white/70' : 'text-muted-foreground'}>
                  <p className="font-sans text-xs tracking-[0.3em] uppercase mb-3">
                    {tier.desc}
                  </p>
                </div>
                <h3 className={`font-serif text-2xl md:text-3xl font-medium mb-3 ${tier.featured ? 'text-white' : 'text-foreground'}`}>
                  {tier.name}
                </h3>
                <p className={`font-serif text-xl mb-8 ${tier.featured ? 'text-[#C9A96E]' : 'text-[#C9A96E]'}`}>
                  {tier.price}
                </p>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.includes.map((feature) => (
                    <li
                      key={feature}
                      className={`flex items-start gap-3 font-sans text-sm ${tier.featured ? 'text-white/85' : 'text-[#4A4A4A]'}`}
                    >
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${tier.featured ? 'text-[#C9A96E]' : 'text-[#C9A96E]'}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#closing"
                  className={`
                    block text-center py-3 rounded-lg font-sans text-sm font-medium transition-colors
                    ${tier.featured
                      ? 'bg-[#C9A96E] text-white hover:bg-[#B89558]'
                      : 'bg-foreground text-background hover:bg-foreground/90'
                    }
                  `}
                >
                  {lang === 'es' ? 'Conversemos' : "Let's talk"}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-[#F5F2EE]">
        <div className="container-wide max-w-4xl">
          <div className="text-center mb-12">
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-[#C9A96E] mb-4">
              {c.faq.eyebrow}
            </p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-foreground leading-tight">
              {c.faq.title}
            </h2>
          </div>

          <InteriorFAQ items={c.faq.items} />
        </div>
      </section>

      {/* ── CLOSING CTA ─────────────────────────────────────────────────── */}
      <section id="closing" className="py-24 md:py-32 bg-[#1A3A2A] text-white" style={{ scrollMarginTop: '96px' }}>
        <div className="container-wide max-w-3xl text-center">
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-[#C9A96E] mb-6">
            {c.closing.eyebrow}
          </p>
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-light leading-[1.1] mb-8">
            {c.closing.title}
          </h2>
          <p className="font-sans text-base md:text-lg text-white/80 leading-relaxed mb-10 max-w-2xl mx-auto">
            {c.closing.body}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <WhatsAppCTA
              message={c.closing.whatsappMsg}
              label={c.closing.whatsapp}
              variant="hero"
            />
            <Link
              href={`mailto:${c.closing.emailAddr}`}
              className="inline-flex items-center gap-2 px-6 py-4 rounded-lg border border-white/40 text-white text-base font-sans font-medium hover:bg-white/10 transition-colors min-h-[48px] w-full sm:w-auto justify-center"
            >
              <Mail className="w-4 h-4" />
              {c.closing.email}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
