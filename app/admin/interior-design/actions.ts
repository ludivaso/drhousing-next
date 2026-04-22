'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

export interface BeforeAfterPair {
  before_url: string
  after_url: string
  caption: string
}

export interface InteriorProjectRow {
  id: string
  title: string
  description: string | null
  cover: string | null
  before_after_pairs: BeforeAfterPair[]
  gallery: string[]
  category: string | null
  display_order: number | null
  published: boolean
  created_at: string
}

export interface CatalogItemRow {
  id: string
  name: string
  description: string | null
  image: string | null
  category: 'furniture' | 'finishes' | 'lighting' | 'other' | null
  price: number | null
  published: boolean
  display_order: number | null
  created_at: string
}

// ── Interior Projects ────────────────────────────────────────────────────────

export async function saveInteriorProject(
  id: string | null,
  data: {
    title: string
    description: string
    cover: string
    before_after_pairs: BeforeAfterPair[]
    gallery: string[]
    category: string
    display_order: string
    published: boolean
  }
) {
  const supabase = createAdminClient()
  const payload = {
    title: data.title.trim(),
    description: data.description.trim() || null,
    cover: data.cover.trim() || null,
    before_after_pairs: data.before_after_pairs,
    gallery: data.gallery.filter(Boolean),
    category: data.category.trim() || null,
    display_order: data.display_order ? parseInt(data.display_order) : null,
    published: data.published,
  }

  if (id) {
    const { error } = await (supabase as any).from('interior_projects').update(payload).eq('id', id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await (supabase as any).from('interior_projects').insert(payload)
    if (error) throw new Error(error.message)
  }
  revalidatePath('/admin/interior-design')
  revalidatePath('/en/interior-design')
  revalidatePath('/es/interior-design')
}

export async function deleteInteriorProject(id: string) {
  const supabase = createAdminClient()
  const { error } = await (supabase as any).from('interior_projects').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/interior-design')
}

export async function toggleProjectPublished(id: string, published: boolean) {
  const supabase = createAdminClient()
  const { error } = await (supabase as any).from('interior_projects').update({ published }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/interior-design')
}

// ── Catalog Items ────────────────────────────────────────────────────────────

export async function saveCatalogItem(
  id: string | null,
  data: {
    name: string
    description: string
    image: string
    category: string
    price: string
    display_order: string
    published: boolean
  }
) {
  const supabase = createAdminClient()
  const payload = {
    name: data.name.trim(),
    description: data.description.trim() || null,
    image: data.image.trim() || null,
    category: data.category || null,
    price: data.price ? parseFloat(data.price) : null,
    display_order: data.display_order ? parseInt(data.display_order) : null,
    published: data.published,
  }

  if (id) {
    const { error } = await (supabase as any).from('catalog_items').update(payload).eq('id', id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await (supabase as any).from('catalog_items').insert(payload)
    if (error) throw new Error(error.message)
  }
  revalidatePath('/admin/interior-design')
}

export async function deleteCatalogItem(id: string) {
  const supabase = createAdminClient()
  const { error } = await (supabase as any).from('catalog_items').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/interior-design')
}

export async function toggleCatalogPublished(id: string, published: boolean) {
  const supabase = createAdminClient()
  const { error } = await (supabase as any).from('catalog_items').update({ published }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/interior-design')
}
