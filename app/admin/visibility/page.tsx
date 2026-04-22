import { createAdminClient } from '@/lib/supabase/admin'
import { MANAGED_ROUTES } from '@/lib/visibility/routes'
import VisibilityClient from './VisibilityClient'

export const metadata = {
  title: 'Visibility · Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function VisibilityAdminPage() {
  const supabase = createAdminClient()

  const [{ data: rows }, { data: pinRow }] = await Promise.all([
    supabase.from('page_visibility').select('path, status'),
    supabase.from('preview_pin').select('pin_hash').eq('id', 1).single(),
  ])

  const statusByPath = Object.fromEntries(
    ((rows as { path: string; status: 'public' | 'private' }[] | null) ?? [])
      .map(r => [r.path, r.status])
  ) as Record<string, 'public' | 'private'>

  const pinConfigured = Boolean((pinRow as { pin_hash: string | null } | null)?.pin_hash)

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl text-foreground">Visibility & Preview Access</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Hide work-in-progress pages from the public. Reviewers unlock them with a shared PIN.
        </p>
      </div>
      <VisibilityClient
        routes={MANAGED_ROUTES}
        statusByPath={statusByPath}
        pinConfigured={pinConfigured}
      />
    </div>
  )
}
