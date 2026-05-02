import type { Metadata } from 'next'
import './globals.css'

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
  icons: {
    icon: [
      { url: '/favicon.ico',      sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    languages: {
      'en': 'https://drhousing.net/en',
      'es': 'https://drhousing.net/es',
      'x-default': 'https://drhousing.net/en',
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
