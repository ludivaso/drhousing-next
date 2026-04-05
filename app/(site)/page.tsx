import type { Metadata } from 'next'
import { getFeaturedProperties } from '@/lib/supabase/queries'
import HomeClient from '@/components/HomeClient'

export const revalidate = 3600

export const metadata: Metadata = {
  title: { absolute: 'DR Housing | Luxury Real Estate Escazú · Santa Ana · Costa Rica' },
  description:
    'Premium luxury homes and investment properties in Escazú, Santa Ana and the Ruta 27 corridor. Expert advisory for international buyers.',
}

export default async function HomePage() {
  const featuredProperties = await getFeaturedProperties()
  return <HomeClient featuredProperties={featuredProperties} />
}
