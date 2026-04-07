'use client'

import { useEffect, useState, useRef } from 'react'
import { Upload, Save, AlertCircle, CheckCircle2, Video, LayoutGrid, Maximize2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import type { ServiceCardConfig, HeroHeight } from '@/lib/supabase/settings'

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

const HEIGHT_OPTIONS: { value: HeroHeight; label: string; desc: string }[] = [
  { value: 'cinematic', label: 'Cinematic — 50vh', desc: 'Letterbox widescreen feel (default)' },
  { value: 'landscape',  label: 'Landscape — 65vh', desc: 'Standard wide format' },
  { value: 'full',       label: 'Full — 85vh',      desc: 'Immersive, near full-screen' },
]

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export default function HomepageSettingsPage() {
  const [heroVideoUrl,   setHeroVideoUrl]   = useState('')
  const [heroHeight,     setHeroHeight]     = useState<HeroHeight>('cinematic')
  const [heroOverlay,    setHeroOverlay]    = useState(45)    // 0–100
  const [heroBrightness, setHeroBrightness] = useState(100)  // 50–150
  const [panelOverlay,   setPanelOverlay]   = useState(55)   // 0–100
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
        if (data.hero_video_url)  setHeroVideoUrl(data.hero_video_url)
        if (data.hero_height)     setHeroHeight(data.hero_height as HeroHeight)
        if (data.hero_overlay)    setHeroOverlay(Number(data.hero_overlay))
        if (data.hero_brightness) setHeroBrightness(Number(data.hero_brightness))
        if (data.panel_overlay)   setPanelOverlay(Number(data.panel_overlay))
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
          hero_video_url:   heroVideoUrl,
          hero_height:      heroHeight,
          hero_overlay:     String(heroOverlay),
          hero_brightness:  String(heroBrightness),
          panel_overlay:    String(panelOverlay),
          service_cards:    JSON.stringify(cards),
        }),
      })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error ?? 'Save failed')
      setStatus('saved')
      setStatusMsg('Saved — hard-refresh the homepage to see changes.')
      setTimeout(() => setStatus('idle'), 5000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setStatus('error')
      setStatusMsg(
        msg.includes('relation') || msg.includes('does not exist')
          ? 'The site_settings table does not exist yet. Run the SQL migration at the bottom of this page.'
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
      setStatusMsg('✓ Video uploaded — URL set. Click Save Changes to apply.')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      setStatusMsg(
        msg.includes('Bucket not found') || msg.includes('Bucket not found')
          ? '⚠ Bucket "site-assets" not found — run the SQL migration at the bottom of this page (it creates the bucket too), then retry.'
          : `Upload error: ${msg}`
      )
    } finally {
      setUploading(false)
    }
  }

  // ── Card field updater ────────────────────────────────────────────────────
  const updateCard = (idx: number, field: keyof ServiceCardConfig, val: string) => {
    setCards((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: val } : c)))
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl space-y-10">

      {/* Page header */}
      <div>
        <h1 className="font-serif text-3xl font-semibold mb-1">Homepage Settings</h1>
        <p className="text-muted-foreground text-sm">
          Hero video, height, and service panel text. Saved to Supabase and applied on next page load.
        </p>
      </div>

      {/* Status banner */}
      {statusMsg && (
        <div className={`flex items-start gap-3 p-4 rounded-lg border text-sm ${
          status === 'error'
            ? 'bg-destructive/10 border-destructive/30 text-destructive'
            : 'bg-primary/5 border-primary/20 text-foreground'
        }`}>
          {status === 'error'
            ? <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            : <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
          }
          <span>{statusMsg}</span>
        </div>
      )}

      {/* ── Hero Video ── */}
      <section className="card-elevated p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Video className="w-5 h-5 text-primary" />
          <h2 className="font-serif text-lg font-semibold">Hero Video</h2>
        </div>

        {/* Format requirements */}
        <div className="bg-muted/60 rounded-lg p-4 text-xs space-y-1.5 text-muted-foreground">
          <p className="font-medium text-foreground">Video requirements for web:</p>
          <p>✅ <strong>Best format: MP4 (H.264 codec)</strong> — works in all browsers including Safari and iOS</p>
          <p>✅ <strong>WebM (VP9)</strong> — Chrome, Firefox, Edge only (not Safari)</p>
          <p>❌ Avoid: MOV, AVI, MKV, HEVC/H.265, WMV — browsers will reject silently</p>
          <p>📐 Resolution: 1920×1080 recommended · File size: compress to under 20 MB</p>
          <p>🔁 Duration: 15–30 second loops look best · Audio is automatically muted</p>
          <p className="pt-1">Use <strong>HandBrake</strong> (free) to convert any video to web-ready MP4.</p>
        </div>

        {/* URL input */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Direct Video URL (.mp4 or .webm)
          </label>
          <input
            type="url"
            value={heroVideoUrl}
            onChange={(e) => setHeroVideoUrl(e.target.value)}
            placeholder="https://…/hero.mp4"
            className="w-full px-4 py-3 border border-border rounded bg-background text-sm focus:outline-none focus:border-primary/50"
          />
          <p className="text-xs text-muted-foreground">
            Leave blank to use the static hero image as fallback.
          </p>
        </div>

        {/* Upload button */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded text-sm hover:bg-secondary transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading…' : 'Upload to Supabase storage'}
          </button>
          <span className="text-xs text-muted-foreground">
            Bucket: <code className="bg-muted px-1 rounded">site-assets</code> (must be public)
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg"
            className="hidden"
            onChange={handleVideoUpload}
          />
        </div>

        {/* Preview */}
        {heroVideoUrl && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Preview:</p>
            <video
              muted loop playsInline controls
              className="w-full rounded border border-border max-h-52 object-cover bg-black"
            >
              <source src={heroVideoUrl} />
            </video>
          </div>
        )}
      </section>

      {/* ── Appearance — overlay & brightness ── */}
      <section className="card-elevated p-6 space-y-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">🎨</span>
          <h2 className="font-serif text-lg font-semibold">Appearance</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Control how dark or bright the hero video and service panels look.
          Changes take effect on the next page load after saving.
        </p>

        {/* Hero Overlay */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Hero Video — Overlay Darkness
            </label>
            <span className="text-sm font-mono text-primary tabular-nums w-10 text-right">
              {heroOverlay}%
            </span>
          </div>
          <input
            type="range" min={0} max={100} step={1}
            value={heroOverlay}
            onChange={(e) => setHeroOverlay(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <p className="text-xs text-muted-foreground">
            0 = fully transparent overlay (video fully visible) · 100 = completely black
          </p>
        </div>

        {/* Hero Brightness */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Hero Video — Brightness
            </label>
            <span className="text-sm font-mono text-primary tabular-nums w-12 text-right">
              {heroBrightness}%
            </span>
          </div>
          <input
            type="range" min={50} max={150} step={1}
            value={heroBrightness}
            onChange={(e) => setHeroBrightness(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <p className="text-xs text-muted-foreground">
            50 = darker · 100 = original · 150 = brighter
          </p>
        </div>

        {/* Panel Overlay */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Service Panels — Overlay Darkness
            </label>
            <span className="text-sm font-mono text-primary tabular-nums w-10 text-right">
              {panelOverlay}%
            </span>
          </div>
          <input
            type="range" min={0} max={100} step={1}
            value={panelOverlay}
            onChange={(e) => setPanelOverlay(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <p className="text-xs text-muted-foreground">
            0 = full-colour panels · 100 = completely black. Hover always lifts to half this value.
          </p>
        </div>
      </section>

      {/* ── Hero Height ── */}
      <section className="card-elevated p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Maximize2 className="w-5 h-5 text-primary" />
          <h2 className="font-serif text-lg font-semibold">Hero Height</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Choose how tall the hero section appears on the homepage.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {HEIGHT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setHeroHeight(opt.value)}
              className={`text-left p-4 rounded-lg border-2 transition-all ${
                heroHeight === opt.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              <p className="font-medium text-sm text-foreground">{opt.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ── Service Panels ── */}
      <section className="card-elevated p-6 space-y-6">
        <div className="flex items-center gap-2 mb-1">
          <LayoutGrid className="w-5 h-5 text-primary" />
          <h2 className="font-serif text-lg font-semibold">Service Panels</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Edit the title, subtitle, link, and image for each of the three cinematic cards.
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

      {/* Save */}
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

      {/* SQL migration */}
      <details className="border border-border rounded-lg">
        <summary className="px-5 py-4 text-sm font-medium cursor-pointer text-muted-foreground hover:text-foreground select-none">
          ⚙ First-time setup — Supabase SQL migration
        </summary>
        <div className="px-5 pb-5">
          <p className="text-xs text-muted-foreground mb-3">
            Run this once in the{' '}
            <a
              href="https://supabase.com/dashboard/project/vtmesmtcnazoqaputoqs/sql/new"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary"
            >
              Supabase SQL Editor ↗
            </a>{' '}
            to enable settings storage:
          </p>
          <pre className="bg-muted rounded p-4 text-xs overflow-x-auto whitespace-pre select-all">
{`-- 1. Settings table (safe to re-run — all idempotent)
CREATE TABLE IF NOT EXISTS site_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public read" ON site_settings FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Auth write" ON site_settings FOR ALL
  USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Storage bucket for hero video (safe to re-run)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-assets', 'site-assets', true, 52428800,
  ARRAY['video/mp4','video/webm','video/ogg','image/jpeg','image/png','image/webp']
)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  CREATE POLICY "site-assets public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'site-assets');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "site-assets auth write" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'site-assets' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "site-assets auth update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'site-assets' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "site-assets auth delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'site-assets' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;`}
          </pre>
        </div>
      </details>
    </div>
  )
}
