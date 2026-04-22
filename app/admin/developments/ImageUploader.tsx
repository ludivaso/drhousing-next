'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

const BUCKET = 'developments'

interface Props {
  label: string
  single?: boolean           // hero image = single URL; gallery = multiple
  value: string              // for single: the URL; for multi: newline-joined URLs
  onChange: (v: string) => void
}

export default function ImageUploader({ label, single = false, value, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging]   = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const inputRef                  = useRef<HTMLInputElement>(null)

  const urls = single
    ? (value.trim() ? [value.trim()] : [])
    : value.split('\n').map(u => u.trim()).filter(Boolean)

  const addUrls = (newUrls: string[]) => {
    if (single) {
      onChange(newUrls[0] ?? '')
    } else {
      const merged = urls.concat(newUrls.filter(u => !urls.includes(u)))
      onChange(merged.join('\n'))
    }
  }

  const removeUrl = (url: string) => {
    if (single) {
      onChange('')
    } else {
      onChange(urls.filter(u => u !== url).join('\n'))
    }
  }

  const upload = async (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!arr.length) return
    setUploading(true)
    setError(null)
    try {
      const newUrls: string[] = []
      for (const file of arr) {
        const ext = file.name.split('.').pop() ?? 'jpg'
        const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { contentType: file.type, upsert: false })
        if (upErr) throw new Error(upErr.message)
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
        newUrls.push(data.publicUrl)
      }
      addUrls(newUrls)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed — check the storage bucket exists.')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    upload(e.dataTransfer.files)
  }

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-muted-foreground">{label}</label>

      {/* Thumbnails */}
      {urls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {urls.map(url => (
            <div key={url} className="relative group w-24 h-24 rounded overflow-hidden border border-border bg-secondary">
              <Image src={url} alt="" fill className="object-cover" unoptimized />
              <button
                type="button"
                onClick={() => removeUrl(url)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {(!single || urls.length === 0) && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            dragging
              ? 'border-[#C9A96E] bg-[#C9A96E]/5'
              : 'border-border hover:border-[#C9A96E]/50 hover:bg-secondary/20'
          }`}
        >
          {uploading
            ? <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
            : <Upload className="w-6 h-6 text-muted-foreground" />
          }
          <p className="text-xs text-muted-foreground">
            {uploading ? 'Uploading…' : 'Drop images here or click to browse'}
          </p>
          {!single && <p className="text-[11px] text-muted-foreground">Multiple files supported</p>}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={!single}
        className="hidden"
        onChange={e => { if (e.target.files) upload(e.target.files) }}
      />

      {/* URL fallback */}
      <details className="text-xs">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground select-none">
          Or paste URL{single ? '' : 's'} directly
        </summary>
        <div className="mt-2">
          {single ? (
            <input
              type="url"
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder="https://…"
              className="w-full px-3 py-2 rounded border border-border bg-background text-sm focus:outline-none focus:border-[#C9A96E]"
            />
          ) : (
            <textarea
              value={value}
              onChange={e => onChange(e.target.value)}
              rows={4}
              placeholder={"https://…\nhttps://…"}
              className="w-full px-3 py-2 rounded border border-border bg-background text-sm font-mono focus:outline-none focus:border-[#C9A96E] resize-y"
            />
          )}
        </div>
      </details>

      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
}
