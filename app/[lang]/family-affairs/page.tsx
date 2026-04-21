import type { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Landmark, TrendingUp, Lock, Phone, Mail, Calendar, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Family Affairs',
  description: 'Asesoría privada e integral para familias que se relocalizan o invierten en Costa Rica. Servicio exclusivo y confidencial.',
  robots: { index: false, follow: false },
}

const offerings = [
  {
    icon: Shield,
    title: 'Family Office Inmobiliario',
    description:
      'Gestión integral del patrimonio inmobiliario familiar: adquisición, administración, rendimiento y estrategia a largo plazo.',
  },
  {
    icon: Landmark,
    title: 'Financiamiento y Estructuración',
    description:
      'Acceso a instrumentos de financiamiento local e internacional, estructuración societaria y planificación fiscal para familias con activos en múltiples jurisdicciones.',
  },
  {
    icon: TrendingUp,
    title: 'Estrategia de Activos',
    description:
      'Análisis de portafolio, diversificación de activos inmobiliarios y orientación en inversiones alternativas dentro del mercado costarricense.',
  },
  {
    icon: Lock,
    title: 'Privacidad y Discreción',
    description:
      'Todas las consultas y transacciones manejadas con absoluta confidencialidad. Nuestros clientes Family Affairs reciben atención directa y personalizada.',
  },
]

export default function FamilyAffairsPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-[#2C2C2C] text-white py-20">
        <div className="container-narrow text-center">
          <span className="inline-block text-sm text-gold font-medium tracking-wider uppercase mb-4">
            Servicio Exclusivo
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold mb-6">
            Family Affairs
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto">
            Asesoría privada e integral para familias que buscan más que solo una propiedad
            — una vida completa y bien estructurada en Costa Rica.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <div className="text-center mb-16">
            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Family Affairs es nuestra práctica de asesoría privada para familias de alto
              patrimonio que se relocalizan, invierten o planifican su futuro en Costa Rica.
              Vamos más allá del corretaje tradicional para ofrecer un acompañamiento
              estratégico, confidencial y completamente personalizado.
            </p>
          </div>

          {/* Offerings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {offerings.map((item) => (
              <div key={item.title} className="flex gap-5">
                <div className="w-14 h-14 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-padding bg-secondary">
        <div className="container-narrow text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground mb-6">
            ¿Cómo Comenzar?
          </h2>
          <p className="text-muted-foreground mb-10 max-w-lg mx-auto">
            Family Affairs opera por referencia e invitación. El primer paso es una
            conversación confidencial sin ningún compromiso.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+50686540888"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Llamar Directamente
            </a>
            <a
              href="mailto:diego@drhousing.net"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded border border-border text-foreground text-sm font-medium hover:bg-background transition-colors"
            >
              <Mail className="w-4 h-4" />
              Escribir por Correo
            </a>
          </div>
        </div>
      </section>

      {/* Discretion notice */}
      <section className="bg-[#2C2C2C] text-white py-12">
        <div className="container-narrow text-center">
          <Lock className="w-8 h-8 text-gold mx-auto mb-4" />
          <p className="text-primary-foreground/70 text-sm max-w-md mx-auto">
            Esta página no está indexada en motores de búsqueda. Toda información
            compartida con DR Housing Family Affairs es estrictamente confidencial.
          </p>
        </div>
      </section>
    </>
  )
}
