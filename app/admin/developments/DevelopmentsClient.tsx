'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Pencil, Trash2, Star, Eye, EyeOff, ExternalLink } from 'lucide-react'
import type { DevRow } from './actions'
import { deleteDevelopment, toggleDevelopmentFeatured, toggleDevelopmentPublished } from './actions'

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  pre_sale:       { label: 'Pre-Sale',         bg: '#C9A96E', text: '#1A1A1A' },
  in_construction:{ label: 'In Construction',  bg: '#2C2C2C', text: '#FFFFFF' },
  delivered:      { label: 'Delivered',         bg: '#1A1A1A', text: '#FFFFFF' },
  sold_out:       { label: 'Sold Out',          bg: '#6B6B6B', text: '#FFFFFF' },
}

export default function DevelopmentsClient({ rows: initial }: { rows: DevRow[] }) {
  const [rows, setRows] = useState(initial)
  const [, startTransition] = useTransition()

  const handleDelete = (id: string) => {
    if (!confirm('Delete this development?')) return
    startTransition(async () => {
      await deleteDevelopment(id)
      setRows(prev => prev.filter(r => r.id !== id))
    })
  }

  const handleFeatured = (id: string, val: boolean) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, featured: val } : r))
    startTransition(() => toggleDevelopmentFeatured(id, val))
  }

  const handlePublished = (id: string, val: boolean) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, published: val } : r))
    startTransition(() => toggleDevelopmentPublished(id, val))
  }

  if (rows.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-12 text-center text-muted-foreground text-sm">
        No developments yet. <Link href="/admin/developments/new" className="text-[#C9A96E] hover:underline">Create the first one.</Link>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/30 text-left">
            <th className="px-4 py-3 w-20 font-medium text-muted-foreground">Image</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
            <th className="px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Location</th>
            <th className="px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Status</th>
            <th className="px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Price</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const s = STATUS_LABELS[row.status] ?? STATUS_LABELS.pre_sale
            return (
              <tr key={row.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-3">
                  {row.hero_image
                    ? <div className="relative w-16 h-12 rounded overflow-hidden">
                        <Image src={row.hero_image} alt="" fill className="object-cover" unoptimized />
                      </div>
                    : <div className="w-16 h-12 rounded bg-secondary" />
                  }
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground line-clamp-1">{row.name_en}</p>
                  {row.name_es && <p className="text-xs text-muted-foreground line-clamp-1">{row.name_es}</p>}
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{row.slug}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                  {row.location ?? '—'}
                  {row.zone && <span className="ml-1 text-xs">({row.zone})</span>}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span
                    className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: s.bg, color: s.text }}
                  >
                    {s.label}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                  {row.price_from ? `$${row.price_from.toLocaleString()}` : '—'}
                  {row.price_to ? ` – $${row.price_to.toLocaleString()}` : ''}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={() => handleFeatured(row.id, !row.featured)}
                      className="p-1.5 rounded hover:bg-secondary transition-colors"
                      title={row.featured ? 'Unfeature' : 'Feature'}
                    >
                      <Star className={`w-3.5 h-3.5 ${row.featured ? 'text-[#C9A96E] fill-[#C9A96E]' : 'text-muted-foreground'}`} />
                    </button>
                    <button
                      onClick={() => handlePublished(row.id, !row.published)}
                      className="p-1.5 rounded hover:bg-secondary transition-colors"
                      title={row.published ? 'Unpublish' : 'Publish'}
                    >
                      {row.published
                        ? <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                        : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                    </button>
                    <Link
                      href={`/en/desarrollos/${row.slug}`}
                      target="_blank"
                      className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground"
                      title="View public page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={`/admin/developments/${row.id}`}
                      className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
