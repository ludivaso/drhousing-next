import { Suspense } from 'react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import PropertyCard from '@/components/PropertyCard'
import FilterBar from '@/components/FilterBar'
import type { PropertyRow } from '@/lib/supabase/queries'

export const metadata: Metadata = {
  title: 'Propiedades | DR Housing',
  description: 'Casas, apartamentos y terrenos en venta y alquiler en Costa Rica',
}

// Keep this dynamic so filters always re-run the query
export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: {
    status?: string
    tipo?: string
    min?: string
    max?: string
    camas?: string
  }
}

export default async function PropiedadesPage({ searchParams }: PageProps) {
  const supabase = createSupabaseServerClient()

  let query = supabase
    .from('properties')
    .select('*')
    .eq('hidden', false)
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })

  if (searchParams.status) query = query.eq('status', searchParams.status)
  if (searchParams.tipo)   query = query.eq('property_type', searchParams.tipo)
  if (searchParams.min)    query = query.gte('price_sale', Number(searchParams.min))
  if (searchParams.max)    query = query.lte('price_sale', Number(searchParams.max))
  if (searchParams.camas)  query = query.gte('bedrooms', Number(searchParams.camas))

  const { data } = await query
  const properties: PropertyRow[] = data ?? []

  return (
    <>
      <Suspense>
        <FilterBar />
      </Suspense>

      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-serif text-2xl font-semibold text-foreground">
              Propiedades
            </h1>
            <span className="text-sm text-muted-foreground">
              {properties.length} resultado{properties.length !== 1 ? 's' : ''}
            </span>
          </div>

          {properties.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-muted-foreground mb-4">No se encontraron propiedades con estos filtros.</p>
              <a href="/propiedades" className="text-sm text-primary hover:underline">
                Ver todas las propiedades
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
