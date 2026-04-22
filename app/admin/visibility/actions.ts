'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { invalidateVisibilityCache } from '@/lib/visibility'
import { hashPin } from '@/lib/visibility/pin'
import { MANAGED_ROUTES } from '@/lib/visibility/routes'

export async function setRouteStatus(path: string, status: 'public' | 'private') {
  if (!MANAGED_ROUTES.some(r => r.path === path)) {
    throw new Error(`Unknown route: ${path}`)
  }
  const supabase = createAdminClient()

  const { error } = await (supabase as any)
    .from('page_visibility')
    .upsert({ path, status }, { onConflict: 'path' })

  if (error) throw new Error(error.message)

  invalidateVisibilityCache()
  revalidatePath('/admin/visibility')
}

export async function setPreviewPin(pin: string) {
  const clean = pin.trim()
  if (clean.length < 4) throw new Error('PIN must be at least 4 characters.')

  const hash = await hashPin(clean)
  const supabase = createAdminClient()

  const { error } = await (supabase as any)
    .from('preview_pin')
    .update({ pin_hash: hash })
    .eq('id', 1)

  if (error) throw new Error(error.message)

  invalidateVisibilityCache()
  revalidatePath('/admin/visibility')
}

export async function clearPreviewPin() {
  const supabase = createAdminClient()

  const { error } = await (supabase as any)
    .from('preview_pin')
    .update({ pin_hash: null })
    .eq('id', 1)

  if (error) throw new Error(error.message)

  invalidateVisibilityCache()
  revalidatePath('/admin/visibility')
}
