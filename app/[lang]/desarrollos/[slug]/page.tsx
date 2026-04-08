import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import DesarrolloDetailClient from './DesarrolloDetailClient'
import { developments, DEVS_BY_SLUG } from '../data'

export function generateStaticParams() {
  return developments.map((d) => ({ slug: d.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const dev = DEVS_BY_SLUG[params.slug]
  if (!dev) return {}
  return {
    title: dev.name,
    description: dev.description,
  }
}

export default function DesarrolloDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const dev = DEVS_BY_SLUG[params.slug]
  if (!dev) notFound()
  return <DesarrolloDetailClient development={dev} />
}
