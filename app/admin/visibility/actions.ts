'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { invalidateVisibilityCache } from '@/lib/visibility'
import { hashPin } from '@/lib/visibility/pin'
import { MANAGED_ROUTES } from '@/lib/visibility/routes'

type ActionResult = { ok: true } | { ok: false; error: string }

export async function setRouteStatus(path: string, status: 'public' | 'private'): Promise<ActionResult> {
  try {
    if (!MANAGED_ROUTES.some(r => r.path === path)) {
      return { ok: false, error: `Unknown route: ${path}` }
    }
    const supabase = createAdminClient()

    const { error } = await (supabase as any)
      .from('page_visibility')
      .upsert({ path, status }, { onConflict: 'path' })

    if (error) return { ok: false, error: error.message }

    invalidateVisibilityCache()
    revalidatePath('/admin/visibility')
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to update route.' }
  }
}

export async function setPreviewPin(pin: string): Promise<ActionResult> {
  try {
    const clean = pin.trim()
    if (clean.length < 4) return { ok: false, error: 'PIN must be at least 4 characters.' }

    const hash = await hashPin(clean)
    const supabase = createAdminClient()

    const { error } = await (supabase as any)
      .from('preview_pin')
      .update({ pin_hash: hash })
      .eq('id', 1)

    if (error) return { ok: false, error: error.message }

    invalidateVisibilityCache()
    revalidatePath('/admin/visibility')
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to save PIN.' }
  }
}

export async function clearPreviewPin(): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()

    const { error } = await (supabase as any)
      .from('preview_pin')
      .update({ pin_hash: null })
      .eq('id', 1)

    if (error) return { ok: false, error: error.message }

    invalidateVisibilityCache()
    revalidatePath('/admin/visibility')
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to remove PIN.' }
  }
}
