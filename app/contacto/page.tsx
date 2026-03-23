import type { Metadata } from 'next'
import WhatsAppCTA from '@/components/WhatsAppCTA'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contacto | DR Housing',
  description: 'Contáctenos para asesoría en bienes raíces de lujo en Escazú, Santa Ana y el corredor Ruta 27 de Costa Rica.',
}

export default function ContactoPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-[#2C2C2C] pt-12 pb-10">
        <div className="container-wide">
          <p className="font-sans text-[#C9A96E] text-sm tracking-widest uppercase mb-2">
            Estamos aquí
          </p>
          <h1 className="font-serif text-white text-3xl sm:text-4xl font-semibold">
            Contacto
          </h1>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Left — contact info */}
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-[#1A1A1A] text-2xl font-semibold mb-3">
                  Agende una Consulta Estratégica
                </h2>
                <p className="font-sans text-[#6B6B6B] text-base leading-relaxed">
                  Nuestro equipo de expertos está disponible para guiarle en cada paso de su
                  proceso de compra, venta o inversión en el mercado inmobiliario de Costa Rica.
                </p>
              </div>

              <div className="space-y-4">
                <ContactItem
                  icon={<Phone className="w-5 h-5" />}
                  label="WhatsApp / Teléfono"
                  value="+506 8654-0888"
                  href="https://wa.me/50686540888"
                />
                <ContactItem
                  icon={<Mail className="w-5 h-5" />}
                  label="Email"
                  value="diego@drhousing.net"
                  href="mailto:diego@drhousing.net"
                />
                <ContactItem
                  icon={<MapPin className="w-5 h-5" />}
                  label="Área de servicio"
                  value="Escazú · Santa Ana · La Guácima · Hacienda Los Reyes · Ruta 27"
                />
                <ContactItem
                  icon={<Clock className="w-5 h-5" />}
                  label="Horario"
                  value="Lunes a Viernes 8am–6pm · Sábados 9am–2pm"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <WhatsAppCTA
                  message="Hola, me gustaría agendar una consulta estratégica con DR Housing."
                  label="Agendar por WhatsApp"
                  variant="footer"
                />
              </div>
            </div>

            {/* Right — CTAs by intent */}
            <div className="space-y-4">
              <h2 className="font-serif text-[#1A1A1A] text-xl font-semibold mb-4">
                ¿Cómo podemos ayudarle?
              </h2>

              {INTENTS.map((intent) => (
                <a
                  key={intent.title}
                  href={`https://wa.me/50686540888?text=${encodeURIComponent(intent.msg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 bg-white rounded-[10px] p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-shadow group"
                >
                  <span className="text-2xl shrink-0">{intent.icon}</span>
                  <div>
                    <p className="font-sans font-medium text-[#1A1A1A] text-sm group-hover:text-[#C9A96E] transition-colors">
                      {intent.title}
                    </p>
                    <p className="font-sans text-[#6B6B6B] text-xs mt-0.5 leading-relaxed">
                      {intent.desc}
                    </p>
                  </div>
                  <span className="ml-auto text-[#C9A96E] text-lg shrink-0">→</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function ContactItem({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode
  label: string
  value: string
  href?: string
}) {
  const inner = (
    <div className="flex items-start gap-3">
      <span className="text-[#C9A96E] mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="font-sans text-[#6B6B6B] text-xs">{label}</p>
        <p className="font-sans text-[#1A1A1A] text-sm font-medium">{value}</p>
      </div>
    </div>
  )
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity block">
        {inner}
      </a>
    )
  }
  return <div>{inner}</div>
}

const INTENTS = [
  {
    icon: '🏠',
    title: 'Comprar una propiedad',
    desc: 'Busco comprar casa, apartamento o terreno en Costa Rica.',
    msg: 'Hola, estoy interesado en comprar una propiedad en Costa Rica. ¿Pueden ayudarme?',
  },
  {
    icon: '📈',
    title: 'Invertir en bienes raíces',
    desc: 'Quiero explorar opciones de inversión en el corredor Ruta 27.',
    msg: 'Hola, me interesa invertir en bienes raíces en el corredor Ruta 27 de Costa Rica.',
  },
  {
    icon: '🏷️',
    title: 'Vender mi propiedad',
    desc: 'Deseo listar y vender mi propiedad con DR Housing.',
    msg: 'Hola, me gustaría listar mi propiedad para venta con DR Housing.',
  },
  {
    icon: '✈️',
    title: 'Relocalización familiar',
    desc: 'Mi familia se muda a Costa Rica y necesito orientación.',
    msg: 'Hola, mi familia está pensando en mudarse a Costa Rica y necesitamos orientación.',
  },
  {
    icon: '🔑',
    title: 'Administrar mi propiedad',
    desc: 'Necesito gestión profesional de una propiedad en alquiler.',
    msg: 'Hola, necesito un servicio de administración para mi propiedad en alquiler.',
  },
]
