import type { Metadata } from 'next'
import WhatsAppCTA from '@/components/WhatsAppCTA'

export const metadata: Metadata = {
  title: 'Servicios | DR Housing',
  description: 'Servicios integrales de bienes raíces, legal, diseño y administración de propiedades en Costa Rica.',
}

const SERVICES = [
  {
    icon: '🏡',
    title: 'Bienes Raíces',
    desc: 'Asesoría personalizada para compra, venta y alquiler de propiedades de lujo en el corredor occidental. Acceso a listados exclusivos fuera del mercado.',
    cta: 'Consultar sobre una propiedad',
    msg: 'Hola, me gustaría recibir asesoría sobre bienes raíces en Costa Rica.',
  },
  {
    icon: '⚖️',
    title: 'Legal & Migración',
    desc: 'Acompañamiento legal completo: due diligence, escrituración, gestión de cierres y asesoría migratoria para residentes extranjeros en Costa Rica.',
    cta: 'Consultar servicios legales',
    msg: 'Hola, necesito asesoría legal y/o migratoria para una propiedad en Costa Rica.',
  },
  {
    icon: '🏗️',
    title: 'Desarrollos & Preventa',
    desc: 'Acceso exclusivo a proyectos en preventa y desarrollo de alto potencial de valorización en Escazú, Santa Ana y La Guácima.',
    cta: 'Ver proyectos en preventa',
    msg: 'Hola, me interesa conocer proyectos de preventa y desarrollo en Costa Rica.',
  },
  {
    icon: '🛋️',
    title: 'Diseño de Interiores',
    desc: 'Transformamos propiedades en hogares de lujo con diseño funcional y estética de primer nivel. Desde remodelaciones hasta staging para venta.',
    cta: 'Solicitar cotización',
    msg: 'Hola, me interesa el servicio de diseño de interiores para mi propiedad.',
  },
  {
    icon: '🔑',
    title: 'Administración de Propiedades',
    desc: 'Gestión integral para propietarios no residentes: mantenimiento, cobranza de alquiler, coordinación de reparaciones y reportes mensuales.',
    cta: 'Administrar mi propiedad',
    msg: 'Hola, me interesa el servicio de administración de propiedades.',
  },
  {
    icon: '👨‍👩‍👧',
    title: 'Family Affairs & Relocalización',
    desc: 'Servicios integrales para familias que se mudan a Costa Rica: colegios, comunidades, apertura de cuentas bancarias y estilo de vida en el GAM.',
    cta: 'Planificar mi relocalización',
    msg: 'Hola, necesito ayuda para relocalizar a mi familia a Costa Rica.',
  },
]

export default function ServiciosPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-[#2C2C2C] pt-12 pb-10">
        <div className="container-wide">
          <p className="font-sans text-[#C9A96E] text-sm tracking-widest uppercase mb-2">
            Lo que hacemos
          </p>
          <h1 className="font-serif text-white text-3xl sm:text-4xl font-semibold">
            Servicios
          </h1>
        </div>
      </section>

      {/* Services grid */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s) => (
              <div
                key={s.title}
                className="bg-white rounded-[10px] p-7 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-shadow flex flex-col gap-4"
              >
                <div className="text-3xl">{s.icon}</div>
                <div>
                  <h2 className="font-serif text-[#1A1A1A] text-xl font-semibold mb-2">{s.title}</h2>
                  <p className="font-sans text-[#6B6B6B] text-sm leading-relaxed">{s.desc}</p>
                </div>
                <div className="mt-auto pt-2">
                  <WhatsAppCTA
                    message={s.msg}
                    label={s.cta}
                    variant="sidebar"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="bg-[#2C2C2C] py-16">
        <div className="container-narrow text-center">
          <h2 className="font-serif text-white text-2xl sm:text-3xl font-semibold mb-3">
            ¿No encontró lo que busca?
          </h2>
          <p className="font-sans text-[#E8E3DC] text-base mb-8">
            Contáctenos directamente. Nuestro equipo está disponible para cualquier consulta.
          </p>
          <WhatsAppCTA
            message="Hola, tengo una consulta sobre los servicios de DR Housing."
            label="Hablar con un Asesor"
            variant="footer"
          />
        </div>
      </section>
    </main>
  )
}
