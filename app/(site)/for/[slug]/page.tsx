import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import CuratedPortfolioClient from './CuratedPortfolioClient'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const { data } = await supabase
    .from('curated_lists')
    .select('title, client_name')
    .eq('slug', params.slug)
    .maybeSingle()
  const name = data?.client_name ?? data?.title ?? 'Portafolio'
  return {
    title: `Portafolio · ${name}`,
    robots: { index: false, follow: false },
  }
}

async function getCuratedList(slug: string) {
  const { data, error } = await supabase
    .from('curated_lists')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (error) {
    console.error('getCuratedList error:', error.message)
    return null
  }
  return data
}

async function getPropertiesByIds(ids: string[]) {
  if (!ids.length) return []
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .in('id', ids)
    .neq('visibility', 'hidden')

  if (error) {
    console.error('getPropertiesByIds error:', error.message)
    return []
  }

  // Preserve the curated list ordering
  const map = new Map((data ?? []).map((p) => [p.id, p]))
  return ids.map((id) => map.get(id)).filter(Boolean) as typeof data
}

export default async function CuratedPortfolioPage({
  params,
}: {
  params: { slug: string }
}) {
  const list = await getCuratedList(params.slug)
  if (!list) notFound()

  // Redirect private lists to PIN gate
  if ((list as any).is_private) redirect(`/private/${params.slug}`)

  const properties = await getPropertiesByIds(list.property_ids ?? [])

  return (
    <CuratedPortfolioClient
      list={list}
      properties={properties}
    />
  )
}
