/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ],
  },
}

export default nextConfig
