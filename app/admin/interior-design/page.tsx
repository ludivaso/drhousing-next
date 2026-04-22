import { createAdminClient } from '@/lib/supabase/admin'
import InteriorDesignAdmin from './InteriorDesignAdmin'
import type { InteriorProjectRow, CatalogItemRow } from './actions'

export const metadata = { title: 'Interior Design · Admin' }
export const dynamic = 'force-dynamic'

export default async function InteriorDesignAdminPage() {
  const supabase = createAdminClient()

  const [{ data: projects }, { data: catalog }] = await Promise.all([
    (supabase as any)
      .from('interior_projects')
      .select('*')
      .order('display_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false }),
    (supabase as any)
      .from('catalog_items')
      .select('*')
      .order('display_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false }),
  ])

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl text-foreground">Interior Design</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage projects and catalog items.</p>
      </div>
      <InteriorDesignAdmin
        projects={(projects ?? []) as InteriorProjectRow[]}
        catalog={(catalog ?? []) as CatalogItemRow[]}
      />
    </div>
  )
}
