import { supabase } from './client'
import type { PropertyRow, AgentRow, FeatureRow } from '@/src/integrations/supabase/types'

export type { PropertyRow, AgentRow, FeatureRow }

/** Hero image: prefer first featured image, fall back to first image */
export function getHeroImage(p: PropertyRow): string | null {
  return p.featured_images?.[0] ?? p.images?.[0] ?? null
}

/** Format price for display */
export function formatPrice(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

/** All public properties — hidden=false, visibility=public, ordered by featured_order then created_at DESC */
export async function getPublicProperties(): Promise<PropertyRow[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('hidden', false)
    .eq('visibility', 'public')
    .order('featured_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getPublicProperties error:', error.message)
    return []
  }
  return data ?? []
}

/** Featured properties for homepage — exactly 4, ordered by featured_order from Supabase */
export async function getFeaturedProperties(): Promise<PropertyRow[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('featured', true)
    .eq('hidden', false)
    .eq('visibility', 'public')
    .order('featured_order', { ascending: true, nullsFirst: false })
    .limit(3)

  if (error) {
    console.error('getFeaturedProperties error:', error.message)
    return []
  }
  return data ?? []
}

/** Single property by slug — hidden=false, visibility=public */
export async function getPropertyBySlug(slug: string): Promise<PropertyRow | null> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('slug', slug)
    .eq('hidden', false)
    .neq('visibility', 'hidden')
    .maybeSingle()

  if (error) {
    console.error('getPropertyBySlug error:', error.message)
    return null
  }
  return data
}

/** All public slugs — for generateStaticParams */
export async function getPublicSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('slug')
    .eq('hidden', false)
    .eq('visibility', 'public')
    .not('slug', 'is', null)

  if (error) {
    console.error('getPublicSlugs error:', error.message)
    return []
  }
  return (data ?? []).map((r) => r.slug).filter(Boolean) as string[]
}

/** Features for a property from normalized join table */
export async function getPropertyFeatures(propertyId: string): Promise<FeatureRow[]> {
  const { data, error } = await supabase
    .from('property_features')
    .select('features(id, name_en, name_es, category, icon, created_at)')
    .eq('property_id', propertyId)

  if (error) {
    console.error('getPropertyFeatures error:', error.message)
    return []
  }
  return (data ?? [])
    .map((row: any) => row.features)
    .filter(Boolean)
    .sort((a: FeatureRow, b: FeatureRow) => {
      const catCmp = (a.category ?? '').localeCompare(b.category ?? '')
      return catCmp !== 0 ? catCmp : a.name_en.localeCompare(b.name_en)
    })
}

/** All agents ordered by created_at */
export async function getAgents(): Promise<AgentRow[]> {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('getAgents error:', error.message)
    return []
  }
  return data ?? []
}
