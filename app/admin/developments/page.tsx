import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import DevelopmentsClient from './DevelopmentsClient'
import type { DevRow } from './actions'

export const metadata = { title: 'Developments · Admin' }
export const dynamic = 'force-dynamic'

export default async function DevelopmentsAdminPage() {
  const supabase = createAdminClient()
  const { data } = await (supabase as any)
    .from('developments')
    .select('*')
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  const rows = (data ?? []) as DevRow[]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl text-foreground">Desarrollos</h1>
          <p className="text-sm text-muted-foreground mt-1">{rows.length} projects</p>
        </div>
        <Link
          href="/admin/developments/new"
          className="flex items-center gap-2 px-4 py-2 rounded bg-[#1A1A1A] text-white text-sm font-medium hover:bg-[#2C2C2C] transition-colors"
        >
          + New Development
        </Link>
      </div>
      <DevelopmentsClient rows={rows} />
    </div>
  )
}
