import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad | DR Housing',
}

export default function PrivacidadPage() {
  return (
    <section className="section-padding bg-background">
      <div className="container-narrow">
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-8">
          Política de Privacidad
        </h1>
        <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
          <p>Última actualización: marzo 2025</p>

          <h2 className="font-serif text-xl font-semibold text-foreground">1. Información que Recopilamos</h2>
          <p>Recopilamos información que usted nos proporciona directamente, como nombre, correo electrónico, teléfono y preferencias de búsqueda cuando completa nuestros formularios de contacto o consulta.</p>

          <h2 className="font-serif text-xl font-semibold text-foreground">2. Uso de la Información</h2>
          <p>Utilizamos la información recopilada para responder a sus consultas, enviarle información relevante sobre propiedades y servicios, y mejorar nuestros servicios.</p>

          <h2 className="font-serif text-xl font-semibold text-foreground">3. Protección de Datos</h2>
          <p>Su información personal es almacenada de forma segura y no es compartida con terceros sin su consentimiento, excepto cuando sea requerido por ley.</p>

          <h2 className="font-serif text-xl font-semibold text-foreground">4. Cookies</h2>
          <p>Este sitio utiliza cookies técnicas necesarias para su funcionamiento. No utilizamos cookies de seguimiento publicitario.</p>

          <h2 className="font-serif text-xl font-semibold text-foreground">5. Sus Derechos</h2>
          <p>Tiene derecho a solicitar acceso, corrección o eliminación de su información personal. Contáctenos en info@drhousing.net.</p>

          <h2 className="font-serif text-xl font-semibold text-foreground">6. Contacto</h2>
          <p>Para consultas sobre privacidad: <a href="mailto:info@drhousing.net" className="text-primary hover:underline">info@drhousing.net</a></p>
        </div>
      </div>
    </section>
  )
}
