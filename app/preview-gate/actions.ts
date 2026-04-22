'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getPinHash, invalidateVisibilityCache } from '@/lib/visibility'
import { hashPin, PREVIEW_COOKIE } from '@/lib/visibility/pin'

export async function verifyPinAction(formData: FormData) {
  const pin = String(formData.get('pin') ?? '').trim()
  const next = String(formData.get('next') ?? '/')

  if (!pin || pin.length < 4) {
    redirect(`/preview-gate?next=${encodeURIComponent(next)}&err=invalid`)
  }

  const supabase = createSupabaseServerClient()
  // Force a fresh read so a newly-rotated PIN is honoured immediately.
  invalidateVisibilityCache()
  const hash = await getPinHash(supabase)

  if (!hash) {
    redirect(`/preview-gate?next=${encodeURIComponent(next)}&err=nopin`)
  }

  const submitted = await hashPin(pin)
  if (submitted !== hash) {
    redirect(`/preview-gate?next=${encodeURIComponent(next)}&err=wrong`)
  }

  cookies().set({
    name: PREVIEW_COOKIE,
    value: submitted,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })

  redirect(next)
}
