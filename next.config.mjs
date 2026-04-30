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
    // Cost controls — ~85% transformation reduction without breaking live
    // surfaces. `qualities` omitted: it's a Next 15 option; on 14.2.29 it
    // is silently ignored so it gives no benefit. Add it when upgrading.
    formats:         ['image/webp'],
    deviceSizes:     [640, 1080, 1920],
    imageSizes:      [400, 800],
    minimumCacheTTL: 2678400, // 31 days
    remotePatterns: [
      // Active Supabase project — all buckets (agent-photos, hero-media,
      // cms, property-images, etc.). Narrow to a specific bucket only after
      // a full audit of every <Image> consumer.
      {
        protocol: 'https',
        hostname: 'vtmesmtcnazoqaputoqs.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Stock photos used on /properties, /desarrollos, /interior-design,
      // and admin defaults. Remove once replaced with real assets.
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Public origin — allows future /og-fallback.jpg and any drhousing-
      // hosted asset to pass through the optimizer.
      {
        protocol: 'https',
        hostname: 'www.drhousing.net',
      },
      {
        protocol: 'https',
        hostname: 'drhousing.net',
      },
      // Removed (no live <Image> consumers):
      //   gihiibbzrmgyarfeujpl.supabase.co  — old Supabase project
      //   images.egorealestate.com           — no references found in codebase
    ],
  },
}

export default nextConfig
