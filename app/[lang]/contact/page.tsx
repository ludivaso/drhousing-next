import type { Metadata } from 'next'
import ContactClient from './ContactClient'

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const lang = params.lang === 'es' ? 'es' : 'en'
  return {
    title: lang === 'es' ? 'Contacto' : 'Contact',
    description: lang === 'es'
      ? 'Contáctenos para asesoría inmobiliaria de lujo en Escazú, Santa Ana y el Corredor Oeste de Costa Rica.'
      : 'Contact us for luxury real estate advisory in Escazú, Santa Ana and the Western Corridor of Costa Rica.',
    alternates: {
      canonical: `https://drhousing.net/${lang}/contact`,
      languages: {
        'en':        'https://drhousing.net/en/contact',
        'es':        'https://drhousing.net/es/contact',
        'x-default': 'https://drhousing.net/en/contact',
      },
    },
  }
}

export default function ContactoPage() {
  return <ContactClient />
}
