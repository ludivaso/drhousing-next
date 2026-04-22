'use client'

import { useRef, useState } from 'react'
import { Loader2, Sparkles, Globe, FileText, ChevronDown, ChevronUp, Check, AlertCircle } from 'lucide-react'
import type { DevFormData, DevStatus } from './actions'

type ImportTab = 'text' | 'url' | 'document'

interface ExtractedData {
  name_en?: string
  name_es?: string
  subtitle_en?: string
  subtitle_es?: string
  description_en?: string
  description_es?: string
  slug?: string
  location?: string
  zone?: string
  status?: DevStatus
  delivery_date?: string
  price_from?: number
  price_to?: number
  unit_count?: number
  amenities?: string[]
  developer_name?: string
  brochure_url?: string
  video_url?: string
}

interface Props {
  onApply: (partial: Partial<DevFormData>) => void
}

export default function AIImportPanel({ onApply }: Props) {
  const [open, setOpen]         = useState(true)
  const [tab, setTab]           = useState<ImportTab>('text')
  const [text, setText]         = useState('')
  const [url, setUrl]           = useState('')
  const [file, setFile]         = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState<ExtractedData | null>(null)
  const [error, setError]       = useState<string | null>(null)
  const [applied, setApplied]   = useState(false)
  const fileRef                 = useRef<HTMLInputElement>(null)

  const reset = () => { setResult(null); setError(null); setApplied(false) }

  const extract = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    setApplied(false)

    try {
      if (tab === 'document') {
        if (!file) { setError('Choose a file first.'); setLoading(false); return }
        const form = new FormData()
        form.append('file', file)
        const res = await fetch('/api/admin/dev-extract', { method: 'PUT', body: form })
        const json = await res.json()
        if (!json.ok) throw new Error(json.error)
        setResult(json.data)
      } else {
        const content = tab === 'url' ? url.trim() : text.trim()
        if (!content) { setError('Paste some content first.'); setLoading(false); return }
        const res = await fetch('/api/admin/dev-extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: tab, content }),
        })
        const json = await res.json()
        if (!json.ok) throw new Error(json.error)
        setResult(json.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraction failed.')
    } finally {
      setLoading(false)
    }
  }

  const apply = () => {
    if (!result) return
    const partial: Partial<DevFormData> = {}
    if (result.name_en)        partial.name_en        = result.name_en
    if (result.name_es)        partial.name_es        = result.name_es
    if (result.subtitle_en)    partial.subtitle_en    = result.subtitle_en
    if (result.subtitle_es)    partial.subtitle_es    = result.subtitle_es
    if (result.description_en) partial.description_en = result.description_en
    if (result.description_es) partial.description_es = result.description_es
    if (result.slug)           partial.slug           = result.slug
    if (result.location)       partial.location       = result.location
    if (result.zone)           partial.zone           = result.zone
    if (result.status)         partial.status         = result.status
    if (result.delivery_date)  partial.delivery_date  = result.delivery_date
    if (result.price_from != null) partial.price_from = result.price_from.toString()
    if (result.price_to != null)   partial.price_to   = result.price_to.toString()
    if (result.unit_count != null) partial.unit_count = result.unit_count.toString()
    if (result.amenities)      partial.amenities      = result.amenities.join('\n')
    if (result.developer_name) partial.developer_name = result.developer_name
    if (result.brochure_url)   partial.brochure_url   = result.brochure_url
    if (result.video_url)      partial.video_url      = result.video_url
    onApply(partial)
    setApplied(true)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) { setFile(f); reset() }
  }

  const inputCls = 'w-full px-3 py-2 rounded border border-border bg-background text-sm focus:outline-none focus:border-[#C9A96E]'

  const TABS: { key: ImportTab; label: string; icon: React.ReactNode }[] = [
    { key: 'text',     label: 'Paste text',   icon: <Sparkles className="w-3.5 h-3.5" /> },
    { key: 'url',      label: 'From URL',     icon: <Globe className="w-3.5 h-3.5" /> },
    { key: 'document', label: 'Upload file',  icon: <FileText className="w-3.5 h-3.5" /> },
  ]

  return (
    <div className="border border-[#C9A96E]/40 rounded-xl overflow-hidden bg-card">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-[#C9A96E]/8 hover:bg-[#C9A96E]/12 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-[#C9A96E]" />
          <span className="font-serif text-base text-foreground">AI Import</span>
          <span className="text-xs text-muted-foreground">— paste text, a URL, or upload a document</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="p-5 space-y-4">
          {/* Source tabs */}
          <div className="flex items-center gap-1 border-b border-border">
            {TABS.map(t => (
              <button
                key={t.key}
                type="button"
                onClick={() => { setTab(t.key); reset() }}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                  tab === t.key
                    ? 'border-[#C9A96E] text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.icon}{t.label}
              </button>
            ))}
          </div>

          {/* Input area */}
          {tab === 'text' && (
            <textarea
              value={text}
              onChange={e => { setText(e.target.value); reset() }}
              rows={6}
              placeholder="Paste any text about the development — brochure copy, a press release, agent notes, HTML, anything. AI will extract the fields."
              className={`${inputCls} resize-y`}
            />
          )}

          {tab === 'url' && (
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={e => { setUrl(e.target.value); reset() }}
                placeholder="https://developer-website.com/development-page"
                className={inputCls}
              />
            </div>
          )}

          {tab === 'document' && (
            <div>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  dragging
                    ? 'border-[#C9A96E] bg-[#C9A96E]/5'
                    : 'border-border hover:border-[#C9A96E]/50 hover:bg-secondary/30'
                }`}
              >
                <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                {file ? (
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">Drop a PDF, Word, or text file here</p>
                    <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                  </>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); reset() } }}
              />
            </div>
          )}

          <button
            type="button"
            onClick={extract}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded bg-[#C9A96E] text-[#1A1A1A] text-sm font-medium hover:bg-[#b89656] disabled:opacity-60 transition-colors"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Extracting…</>
              : <><Sparkles className="w-4 h-4" /> Extract with AI</>}
          </button>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Result preview */}
          {result && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-secondary/30 px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Extracted fields</span>
                <button
                  type="button"
                  onClick={apply}
                  disabled={applied}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#1A1A1A] text-white text-xs font-medium hover:bg-[#2C2C2C] disabled:opacity-60 transition-colors"
                >
                  {applied ? <><Check className="w-3 h-3" /> Applied</> : 'Apply to form'}
                </button>
              </div>
              <div className="p-4 space-y-1.5 max-h-72 overflow-y-auto">
                {Object.entries(result).map(([k, v]) => {
                  if (!v) return null
                  const display = Array.isArray(v) ? v.join(', ') : String(v)
                  return (
                    <div key={k} className="flex gap-2 text-xs">
                      <span className="font-mono text-muted-foreground w-36 shrink-0">{k}</span>
                      <span className="text-foreground line-clamp-2">{display}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
