import type { Metadata } from 'next'
import { Lora, Poppins } from 'next/font/google'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import './globals.css'

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-lora',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'DR Housing | Luxury Real Estate Escazú · Santa Ana · Costa Rica',
    template: '%s | DR Housing',
  },
  description:
    'Premium luxury homes and investment properties in Escazú, Santa Ana and the Ruta 27 corridor. Expert advisory for international buyers.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://drhousing.net'
  ),
  openGraph: {
    siteName: 'DR Housing',
    type: 'website',
    locale: 'es_CR',
    alternateLocale: 'en_US',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${lora.variable} ${poppins.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Navbar />
        {/* pt-24 = top bar (32px) + main nav (64px) on desktop; pt-16 on mobile (no top bar) */}
        <div className="pt-16 md:pt-24 min-h-screen flex flex-col">
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  )
}
