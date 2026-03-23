import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos de Servicio | DR Housing',
}

export default function TerminosPage() {
  return (
    <section className="section-padding bg-background">
      <div className="container-narrow">
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-8">
          Términos de Servicio
        </h1>
        <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
          <p>Última actualización: marzo 2025</p>

          <h2 className="font-serif text-xl font-semibold text-foreground">1. Aceptación de Términos</h2>
          <p>Al acceder y usar el sitio web de DR Housing, acepta estos términos de servicio. Si no está de acuerdo, por favor no utilice este sitio.</p>

          <h2 className="font-serif text-xl font-semibold text-foreground">2. Servicios</h2>
          <p>DR Housing ofrece servicios de asesoría inmobiliaria, corretaje, administración de propiedades y servicios relacionados en Costa Rica. La información en este sitio es de carácter informativo y no constituye asesoría legal ni financiera.</p>

          <h2 className="font-serif text-xl font-semibold text-foreground">3. Propiedad Intelectual</h2>
          <p>Todo el contenido de este sitio, incluyendo textos, imágenes y diseño, es propiedad de DR Housing y está protegido por las leyes de propiedad intelectual.</p>

          <h2 className="font-serif text-xl font-semibold text-foreground">4. Exactitud de la Información</h2>
          <p>Nos esforzamos por mantener información actualizada y precisa, pero no garantizamos la exactitud completa de los precios, disponibilidad y características de las propiedades listadas.</p>

          <h2 className="font-serif text-xl font-semibold text-foreground">5. Limitación de Responsabilidad</h2>
          <p>DR Housing no se responsabiliza por daños derivados del uso de este sitio o de la información en él contenida.</p>

          <h2 className="font-serif text-xl font-semibold text-foreground">6. Ley Aplicable</h2>
          <p>Estos términos se rigen por las leyes de la República de Costa Rica.</p>

          <h2 className="font-serif text-xl font-semibold text-foreground">7. Contacto</h2>
          <p>Para consultas: <a href="mailto:info@drhousing.net" className="text-primary hover:underline">info@drhousing.net</a></p>
        </div>
      </div>
    </section>
  )
}
