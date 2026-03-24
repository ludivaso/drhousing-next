import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Main crawler — allow all public pages
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',      // Admin panel — never index
          '/for/',        // Curated client portfolios — private, noindex
          '/api/',        // API routes — not indexable
        ],
      },
    ],
    sitemap: 'https://drhousing.net/sitemap.xml',
    host: 'https://drhousing.net',
  }
}
