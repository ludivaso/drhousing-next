import type { Metadata } from 'next'
import Link from 'next/link'
import WhatsAppCTA from '@/components/WhatsAppCTA'

export const metadata: Metadata = {
  title: 'Desarrollos | DR Housing',
  description: 'Proyectos de nueva construcción y preventa en el corredor occidental de Costa Rica.',
}

export default function DesarrollosPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-[#2C2C2C] pt-12 pb-10">
        <div className="container-wide">
          <p className="font-sans text-[#C9A96E] text-sm tracking-widest uppercase mb-2">
            Nueva Construcción
          </p>
          <h1 className="font-serif text-white text-3xl sm:text-4xl font-semibold">
            Desarrollos
          </h1>
        </div>
      </section>

      {/* Coming soon */}
      <section className="section-padding">
        <div className="container-narrow text-center">
          <div className="inline-flex items-center gap-2 border border-[#C9A96E] text-[#C9A96E] text-xs font-sans tracking-widest uppercase px-4 py-2 rounded-full mb-8">
            Próximamente
          </div>
          <h2 className="font-serif text-[#1A1A1A] text-3xl font-semibold mb-4">
            Proyectos de Preventa & Nueva Construcción
          </h2>
          <p className="font-sans text-[#6B6B6B] text-base leading-relaxed max-w-xl mx-auto mb-10">
            Estamos curating una selección exclusiva de desarrollos en Escazú, Santa Ana y la
            Ruta 27 con el mayor potencial de plusvalía. Contáctenos para acceso anticipado.
          </p>
          <WhatsAppCTA
            message="Hola, me interesa recibir información sobre desarrollos y proyectos en preventa."
            label="Solicitar Acceso Anticipado"
            variant="footer"
          />
        </div>
      </section>

      {/* Why new construction */}
      <section className="section-padding bg-white border-t border-[#E8E3DC]">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="font-serif text-[#1A1A1A] text-2xl sm:text-3xl font-semibold">
              ¿Por qué invertir en preventa?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { title: 'Precio de Entrada', desc: 'Adquiere a precios preventa antes de la apreciación durante construcción.' },
              { title: 'Personalización', desc: 'Posibilidad de personalizar acabados y distribución en etapas tempranas.' },
              { title: 'Plusvalía Acelerada', desc: 'Proyectos en zonas de crecimiento del corredor Ruta 27 con alta demanda.' },
            ].map((item) => (
              <div key={item.title} className="bg-[#F5F2EE] rounded-[10px] p-6">
                <div className="w-8 h-1 bg-[#C9A96E] mb-4 rounded" />
                <h3 className="font-serif text-[#1A1A1A] text-lg font-semibold mb-2">{item.title}</h3>
                <p className="font-sans text-[#6B6B6B] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
