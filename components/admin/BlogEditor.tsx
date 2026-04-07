'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Trash2, Eye, EyeOff, Upload, AlertCircle, CheckCircle2, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import type { BlogPostRow } from '@/lib/supabase/blog'

type Lang = 'es' | 'en'

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const FIELD = 'w-full px-3 py-2.5 border border-border rounded bg-background text-sm focus:outline-none focus:border-primary/50 transition-colors'
const LABEL = 'block text-xs font-medium text-muted-foreground mb-1.5'

interface Props {
  post?: BlogPostRow
}

export default function BlogEditor({ post }: Props) {
  const router = useRouter()
  const isNew = !post?.id
  const fileRef = useRef<HTMLInputElement>(null)

  const [slug,       setSlug]       = useState(post?.slug       ?? '')
  const [title,      setTitle]      = useState(post?.title      ?? '')
  const [titleEn,    setTitleEn]    = useState(post?.title_en   ?? '')
  const [excerpt,    setExcerpt]    = useState(post?.excerpt     ?? '')
  const [excerptEn,  setExcerptEn]  = useState(post?.excerpt_en ?? '')
  const [content,    setContent]    = useState(post?.content    ?? '')
  const [contentEn,  setContentEn]  = useState(post?.content_en ?? '')
  const [category,   setCategory]   = useState(post?.category   ?? '')
  const [categoryEn, setCategoryEn] = useState(post?.category_en ?? '')
  const [image,      setImage]      = useState(post?.image      ?? '')
  const [readTime,   setReadTime]   = useState(post?.read_time  ?? '5 min')
  const [published,  setPublished]  = useState(post?.published  ?? false)
  const [featured,   setFeatured]   = useState(post?.featured   ?? false)
  const [uploading,  setUploading]  = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [deleting,   setDeleting]   = useState(false)
  const [msg,        setMsg]        = useState<{ text: string; ok: boolean } | null>(null)
  const [contentTab, setContentTab] = useState<Lang>('es')
  const [preview,    setPreview]    = useState(false)

  const handleTitleChange = (v: string) => {
    setTitle(v)
    if (isNew) setSlug(slugify(v))
  }

  const payload = () => ({
    slug,
    title,
    title_en:    titleEn   || null,
    excerpt:     excerpt   || null,
    excerpt_en:  excerptEn || null,
    content:     content   || null,
    content_en:  contentEn || null,
    category:    category  || 'General',
    category_en: categoryEn || null,
    image:       image     || '/hero-costa-rica.jpg',
    read_time:   readTime  || '5 min',
    published,
    featured,
  })

  const save = async (pub?: boolean) => {
    if (!slug || !title) { setMsg({ text: 'Slug and Spanish title are required.', ok: false }); return }
    setSaving(true)
    setMsg(null)
    const data = { ...payload(), published: pub ?? published }
    try {
      const url  = isNew ? '/api/admin/blog' : `/api/admin/blog/${post.id}`
      const method = isNew ? 'POST' : 'PUT'
      const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error ?? 'Save failed')
      setMsg({ text: pub ? 'Published ✓' : 'Saved as draft ✓', ok: true })
      if (isNew && json.id) router.replace(`/admin/blog/${json.id}`)
      if (pub !== undefined) setPublished(pub)
    } catch (e: unknown) {
      setMsg({ text: String(e), ok: false })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!post?.id) return
    if (!confirm('Delete this post permanently?')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      router.replace('/admin/blog')
    } catch (e: unknown) {
      setMsg({ text: String(e), ok: false })
      setDeleting(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const ext  = file.name.split('.').pop()
      const path = `blog/${slug || 'post'}-${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('site-assets').upload(path, file, { upsert: true, contentType: file.type })
      if (error) throw error
      const { data } = supabase.storage.from('site-assets').getPublicUrl(path)
      setImage(data.publicUrl)
    } catch (e: unknown) {
      setMsg({ text: `Upload error: ${String(e)}`, ok: false })
    } finally {
      setUploading(false)
    }
  }

  const activeContent = contentTab === 'es' ? content : contentEn
  const setActiveContent = contentTab === 'es' ? setContent : setContentEn

  return (
    <div className="max-w-4xl space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl font-semibold mb-1">
            {isNew ? 'New Post' : 'Edit Post'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {published ? '🟢 Published' : '⚪ Draft'}{featured ? ' · ⭐ Featured' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!isNew && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-destructive/40 text-destructive rounded text-sm hover:bg-destructive/5 transition-colors disabled:opacity-40"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          )}
          <button
            onClick={() => save(false)}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-border rounded text-sm hover:bg-secondary transition-colors disabled:opacity-40"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
          <button
            onClick={() => save(!published)}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            {published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {published ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Status msg */}
      {msg && (
        <div className={`flex items-start gap-2.5 p-3.5 rounded-lg border text-sm ${msg.ok ? 'bg-primary/5 border-primary/20' : 'bg-destructive/10 border-destructive/30 text-destructive'}`}>
          {msg.ok ? <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
          {msg.text}
        </div>
      )}

      {/* ── Meta ── */}
      <section className="card-elevated p-6 space-y-5">
        <h2 className="font-serif text-base font-semibold mb-1">Meta</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Title (ES) *</label>
            <input className={FIELD} value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Título del artículo" />
          </div>
          <div>
            <label className={LABEL}>Title (EN)</label>
            <input className={FIELD} value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder="Article title" />
          </div>
        </div>

        <div>
          <label className={LABEL}>Slug *</label>
          <input className={FIELD} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="url-del-articulo" />
          <p className="text-xs text-muted-foreground mt-1">
            Public URL: /blog/<span className="font-mono">{slug || 'slug'}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={LABEL}>Category (ES)</label>
            <input className={FIELD} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Guías" />
          </div>
          <div>
            <label className={LABEL}>Category (EN)</label>
            <input className={FIELD} value={categoryEn} onChange={(e) => setCategoryEn(e.target.value)} placeholder="Guides" />
          </div>
          <div>
            <label className={LABEL}>Read Time</label>
            <input className={FIELD} value={readTime} onChange={(e) => setReadTime(e.target.value)} placeholder="5 min" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Excerpt (ES)</label>
            <textarea className={`${FIELD} resize-none`} rows={3} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Resumen breve del artículo…" />
          </div>
          <div>
            <label className={LABEL}>Excerpt (EN)</label>
            <textarea className={`${FIELD} resize-none`} rows={3} value={excerptEn} onChange={(e) => setExcerptEn(e.target.value)} placeholder="Brief article summary…" />
          </div>
        </div>

        {/* Image */}
        <div>
          <label className={LABEL}>Cover Image</label>
          <div className="flex gap-2">
            <input className={`${FIELD} flex-1`} value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://… or /hero-costa-rica.jpg" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="px-3 py-2 border border-border rounded text-sm hover:bg-secondary transition-colors disabled:opacity-50 whitespace-nowrap flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="cover" className="mt-2 h-24 w-full object-cover rounded border border-border" />
          )}
        </div>

        {/* Flags */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-4 h-4 accent-primary" />
            <span className="text-sm flex items-center gap-1"><Star className="w-3.5 h-3.5 text-gold" /> Featured post</span>
          </label>
        </div>
      </section>

      {/* ── Content Editor ── */}
      <section className="card-elevated p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-serif text-base font-semibold">Content (Markdown)</h2>
          <div className="flex items-center gap-2">
            {/* Lang tabs */}
            {(['es', 'en'] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setContentTab(l)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${contentTab === l ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-secondary'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
            <button
              onClick={() => setPreview(!preview)}
              className="px-3 py-1 rounded text-xs border border-border hover:bg-secondary transition-colors"
            >
              {preview ? 'Edit' : 'Preview'}
            </button>
          </div>
        </div>

        {preview ? (
          <div
            className="prose prose-sm max-w-none min-h-[400px] p-4 border border-border rounded bg-background overflow-auto"
            dangerouslySetInnerHTML={{ __html: activeContent.replace(/\n/g, '<br/>') }}
          />
        ) : (
          <textarea
            className={`${FIELD} min-h-[400px] font-mono text-xs leading-relaxed resize-y`}
            value={activeContent}
            onChange={(e) => setActiveContent(e.target.value)}
            placeholder={`## ${contentTab === 'es' ? 'Escribe aquí en Markdown…' : 'Write here in Markdown…'}`}
          />
        )}
        <p className="text-xs text-muted-foreground">
          Supports Markdown: ## Heading, **bold**, *italic*, - list, [link](url)
        </p>
      </section>
    </div>
  )
}
