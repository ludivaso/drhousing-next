/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Locale-aware privacy/terms canonical redirects
      { source: '/en/privacidad', destination: '/en/privacy',    permanent: true },
      { source: '/en/terminos',   destination: '/en/terms',      permanent: true },
      { source: '/es/privacy',    destination: '/es/privacidad', permanent: true },
      { source: '/es/terms',      destination: '/es/terminos',   permanent: true },
    ]
  },
  // Packages that use Node.js-only APIs — must not be bundled by webpack
  experimental: {
    serverComponentsExternalPackages: [
      '@react-pdf/renderer',
      '@anthropic-ai/sdk',
    ],
  },
  // Exclude Vite SPA source from Next.js compilation
  webpack: (config) => {
    config.module.rules.push({
      test: /src[\\/](pages|components|hooks|lib|context|integrations|i18n|config)[\\/]/,
      use: 'ignore-loader',
    })
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vtmesmtcnazoqaputoqs.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.egorealestate.com',
      },
      {
        protocol: 'https',
        hostname: 'gihiibbzrmgyarfeujpl.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Public origin — listed so any drhousing.net-hosted asset (e.g. a
      // future /og-fallback.jpg) can pass through the image optimizer.
      {
        protocol: 'https',
        hostname: 'www.drhousing.net',
      },
      {
        protocol: 'https',
        hostname: 'drhousing.net',
      },
    ],
  },
}

export default nextConfig
