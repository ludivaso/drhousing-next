import { supabase } from './client'
import type { PropertyRow } from '@/src/integrations/supabase/types'

export type { PropertyRow }

/** Hero image: prefer first featured image, fall back to first image */
export function getHeroImage(p: PropertyRow): string | null {
  return p.images?.[0] ?? null
}

/** Format price for display */
export function formatPrice(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

/** All public properties — hidden=false, ordered by created_at DESC */
export async function getPublicProperties(): Promise<PropertyRow[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('hidden', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getPublicProperties error:', error.message)
    return []
  }
  return data ?? []
}

/** Featured properties for homepage — hidden=false, featured=true, limit 4 */
export async function getFeaturedProperties(): Promise<PropertyRow[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('hidden', false)
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(4)

  if (error) {
    console.error('getFeaturedProperties error:', error.message)
    return []
  }
  return data ?? []
}

/** Single property by slug — hidden=false */
export async function getPropertyBySlug(slug: string): Promise<PropertyRow | null> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('slug', slug)
    .eq('hidden', false)
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

  if (error) {
    console.error('getPublicSlugs error:', error.message)
    return []
  }
  return (data ?? []).map((r) => r.slug)
}
