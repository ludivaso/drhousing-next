'use client'

import { useEffect, useState, useRef } from 'react'
import { Upload, Save, AlertCircle, CheckCircle2, Video, LayoutGrid } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import type { ServiceCardConfig } from '@/lib/supabase/settings'

const DEFAULT_CARDS: ServiceCardConfig[] = [
  {
    titleEn: 'Portfolio',       titleEs: 'Portafolio',
    subtitleEn: 'Luxury homes & investments', subtitleEs: 'Propiedades de lujo e inversión',
    href: '/propiedades',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80&auto=format&fit=crop',
  },
  {
    titleEn: 'Developments',    titleEs: 'Desarrollos',
    subtitleEn: 'New construction & pre-sales', subtitleEs: 'Construcción nueva y preventas',
    href: '/desarrollos',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80&auto=format&fit=crop',
  },
  {
    titleEn: 'Interior Design', titleEs: 'Diseño Interior',
    subtitleEn: 'Curated living spaces', subtitleEs: 'Espacios diseñados a medida',
    href: '/servicios',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80&auto=format&fit=crop',
  },
]

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export default function HomepageSettingsPage() {
  const [heroVideoUrl, setHeroVideoUrl] = useState('')
  const [cards, setCards] = useState<ServiceCardConfig[]>(DEFAULT_CARDS)
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [statusMsg, setStatusMsg] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // ── Load current settings ─────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.hero_video_url) setHeroVideoUrl(data.hero_video_url)
        if (data.service_cards) {
          try { setCards(JSON.parse(data.service_cards)) } catch { /* keep defaults */ }
        }
      })
      .catch(() => { /* table not yet created — silently ignore */ })
  }, [])

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setStatus('saving')
    setStatusMsg('')
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hero_video_url: heroVideoUrl,
          service_cards: JSON.stringify(cards),
        }),
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        throw new Error(json.error ?? 'Save failed')
      }
      setStatus('saved')
      setStatusMsg('Settings saved. Redeploy or hard-refresh to see changes live.')
      setTimeout(() => setStatus('idle'), 4000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setStatus('error')
      setStatusMsg(
        msg.includes('relation') || msg.includes('does not exist')
          ? 'The site_settings table does not exist yet. Run the SQL migration below.'
          : msg
      )
    }
  }

  // ── Video upload to Supabase storage ─────────────────────────────────────
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setStatusMsg('')
    try {
      const ext = file.name.split('.').pop()
      const path = `hero-video.${ext}`
      const { error } = await supabase.storage
        .from('site-assets')
        .upload(path, file, { upsert: true, contentType: file.type })

      if (error) throw error

      const { data } = supabase.storage.from('site-assets').getPublicUrl(path)
      setHeroVideoUrl(data.publicUrl)
      setStatusMsg(`✓ Uploaded — URL set automatically. Save to apply.`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      setStatusMsg(
        msg.includes('Bucket not found')
          ? 'Storage bucket "site-assets" not found. Create it in Supabase → Storage, make it public, then retry.'
          : `Upload error: ${msg}`
      )
    } finally {
      setUploading(false)
    }
  }

  // ── Card field updater ────────────────────────────────────────────────────
  const updateCard = (
    idx: number,
    field: keyof ServiceCardConfig,
    val: string
  ) => {
    setCards((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: val } : c))
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl space-y-10">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-semibold mb-1">Homepage Settings</h1>
        <p className="text-muted-foreground text-sm">
          Control the hero video and service panel text from here. Changes are saved to Supabase
          and applied on next page load.
        </p>
      </div>

      {/* Status banner */}
      {statusMsg && (
        <div
          className={`flex items-start gap-3 p-4 rounded-lg border text-sm ${
            status === 'error'
              ? 'bg-destructive/10 border-destructive/30 text-destructive'
              : 'bg-primary/5 border-primary/20 text-foreground'
          }`}
        >
          {status === 'error' ? (
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
          )}
          <span>{statusMsg}</span>
        </div>
      )}

      {/* ── Hero Video ── */}
      <section className="card-elevated p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Video className="w-5 h-5 text-primary" />
          <h2 className="font-serif text-lg font-semibold">Hero Video</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Paste a direct video URL (MP4/WebM) or upload a file to Supabase storage.
          Leave blank to keep the static hero image.
        </p>

        <div className="space-y-3">
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Video URL
          </label>
          <input
            type="url"
            value={heroVideoUrl}
            onChange={(e) => setHeroVideoUrl(e.target.value)}
            placeholder="https://…/hero.mp4"
            className="w-full px-4 py-3 border border-border rounded bg-background text-sm focus:outline-none focus:border-primary/50"
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded text-sm hover:bg-secondary transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading…' : 'Upload video file'}
          </button>
          <span className="text-xs text-muted-foreground">
            Uploads to Supabase storage bucket <code className="bg-muted px-1 rounded">site-assets</code>
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg"
            className="hidden"
            onChange={handleVideoUpload}
          />
        </div>

        {heroVideoUrl && (
          <video
            src={heroVideoUrl}
            muted
            loop
            playsInline
            controls
            className="w-full rounded border border-border max-h-48 object-cover"
          />
        )}
      </section>

      {/* ── Service Panels ── */}
      <section className="card-elevated p-6 space-y-6">
        <div className="flex items-center gap-2 mb-1">
          <LayoutGrid className="w-5 h-5 text-primary" />
          <h2 className="font-serif text-lg font-semibold">Service Panels</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Edit the title, subtitle, destination URL, and image for each of the three cinematic cards.
        </p>

        {cards.map((card, idx) => (
          <div key={idx} className="border border-border rounded-lg p-5 space-y-4">
            <h3 className="font-medium text-sm text-foreground">
              Panel {idx + 1} — {card.titleEn}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  { field: 'titleEn',    label: 'Title (EN)' },
                  { field: 'titleEs',    label: 'Title (ES)' },
                  { field: 'subtitleEn', label: 'Subtitle (EN)' },
                  { field: 'subtitleEs', label: 'Subtitle (ES)' },
                ] as { field: keyof ServiceCardConfig; label: string }[]
              ).map(({ field, label }) => (
                <div key={field}>
                  <label className="block text-xs text-muted-foreground mb-1">{label}</label>
                  <input
                    type="text"
                    value={card[field]}
                    onChange={(e) => updateCard(idx, field, e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded bg-background text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1">Link URL</label>
              <input
                type="text"
                value={card.href}
                onChange={(e) => updateCard(idx, 'href', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded bg-background text-sm focus:outline-none focus:border-primary/50"
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1">Image URL</label>
              <input
                type="url"
                value={card.image}
                onChange={(e) => updateCard(idx, 'image', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded bg-background text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>
        ))}
      </section>

      {/* Save button */}
      <div className="flex justify-end pb-10">
        <button
          onClick={handleSave}
          disabled={status === 'saving'}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {status === 'saving' ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* SQL migration notice */}
      <details className="border border-border rounded-lg">
        <summary className="px-5 py-4 text-sm font-medium cursor-pointer text-muted-foreground hover:text-foreground select-none">
          ⚙ First-time setup — Supabase SQL migration
        </summary>
        <div className="px-5 pb-5">
          <p className="text-xs text-muted-foreground mb-3">
            Run this once in the Supabase SQL Editor to enable settings storage:
          </p>
          <pre className="bg-muted rounded p-4 text-xs overflow-x-auto whitespace-pre">
{`CREATE TABLE IF NOT EXISTS site_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read"
  ON site_settings FOR SELECT USING (true);

CREATE POLICY "Auth write"
  ON site_settings FOR ALL
  USING (auth.role() = 'authenticated');`}
          </pre>
        </div>
      </details>
    </div>
  )
}
