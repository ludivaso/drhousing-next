import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import DevForm from '../DevForm'
import type { DevRow } from '../actions'

export const dynamic = 'force-dynamic'

export default async function EditDevelopmentPage({ params }: { params: { id: string } }) {
  const supabase = createAdminClient()
  const { data } = await (supabase as any)
    .from('developments')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!data) notFound()
  const row = data as DevRow

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl text-foreground">Edit Development</h1>
        <p className="text-sm text-muted-foreground mt-1 font-mono">{row.slug}</p>
      </div>
      <DevForm row={row} />
    </div>
  )
}
