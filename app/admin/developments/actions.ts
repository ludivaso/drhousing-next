'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

export type DevStatus = 'pre_sale' | 'in_construction' | 'delivered' | 'sold_out'

export interface DevRow {
  id: string
  slug: string
  name_en: string
  name_es: string | null
  subtitle_en: string | null
  subtitle_es: string | null
  description_en: string | null
  description_es: string | null
  location: string | null
  zone: string | null
  status: DevStatus
  delivery_date: string | null
  price_from: number | null
  price_to: number | null
  unit_count: number | null
  unit_types: unknown
  amenities: string[]
  hero_image: string | null
  gallery: string[]
  developer_name: string | null
  brochure_url: string | null
  video_url: string | null
  coordinates: unknown
  featured: boolean
  display_order: number | null
  published: boolean
  created_at: string
}

export interface DevFormData {
  slug: string
  name_en: string
  name_es: string
  subtitle_en: string
  subtitle_es: string
  description_en: string
  description_es: string
  location: string
  zone: string
  status: DevStatus
  delivery_date: string
  price_from: string
  price_to: string
  unit_count: string
  amenities: string
  hero_image: string
  gallery: string
  developer_name: string
  brochure_url: string
  video_url: string
  featured: boolean
  published: boolean
  display_order: string
}

function parseForm(f: DevFormData) {
  return {
    slug: f.slug.trim(),
    name_en: f.name_en.trim(),
    name_es: f.name_es.trim() || null,
    subtitle_en: f.subtitle_en.trim() || null,
    subtitle_es: f.subtitle_es.trim() || null,
    description_en: f.description_en.trim() || null,
    description_es: f.description_es.trim() || null,
    location: f.location.trim() || null,
    zone: f.zone.trim() || null,
    status: f.status,
    delivery_date: f.delivery_date || null,
    price_from: f.price_from ? parseFloat(f.price_from) : null,
    price_to: f.price_to ? parseFloat(f.price_to) : null,
    unit_count: f.unit_count ? parseInt(f.unit_count) : null,
    amenities: f.amenities.split('\n').map(a => a.trim()).filter(Boolean),
    hero_image: f.hero_image.trim() || null,
    gallery: f.gallery.split('\n').map(u => u.trim()).filter(Boolean),
    developer_name: f.developer_name.trim() || null,
    brochure_url: f.brochure_url.trim() || null,
    video_url: f.video_url.trim() || null,
    featured: f.featured,
    published: f.published,
    display_order: f.display_order ? parseInt(f.display_order) : null,
  }
}

export async function createDevelopment(f: DevFormData) {
  const supabase = createAdminClient()
  const { error } = await (supabase as any).from('developments').insert(parseForm(f))
  if (error) throw new Error(error.message)
  revalidatePath('/admin/developments')
  revalidatePath('/en/desarrollos')
  revalidatePath('/es/desarrollos')
}

export async function updateDevelopment(id: string, f: DevFormData) {
  const supabase = createAdminClient()
  const { error } = await (supabase as any).from('developments').update(parseForm(f)).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/developments')
  revalidatePath('/en/desarrollos')
  revalidatePath('/es/desarrollos')
}

export async function deleteDevelopment(id: string) {
  const supabase = createAdminClient()
  const { error } = await (supabase as any).from('developments').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/developments')
}

export async function toggleDevelopmentFeatured(id: string, featured: boolean) {
  const supabase = createAdminClient()
  const { error } = await (supabase as any).from('developments').update({ featured }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/developments')
}

export async function toggleDevelopmentPublished(id: string, published: boolean) {
  const supabase = createAdminClient()
  const { error } = await (supabase as any).from('developments').update({ published }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/developments')
}
