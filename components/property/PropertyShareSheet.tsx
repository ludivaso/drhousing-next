'use client'

import { useState, useRef, useEffect } from 'react'
import { Share2, Copy, Check, MessageCircle, Mail, Facebook } from 'lucide-react'

interface PropertyShareSheetProps {
  url: string
  title: string
}

export function PropertyShareSheet({ url, title }: PropertyShareSheetProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  async function handleShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text: `${title} — DR Housing Costa Rica`, url })
      } catch {
        // user cancelled — do nothing
      }
      return
    }
    setOpen((prev) => !prev)
  }

  async function copyLink() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => { setCopied(false); setOpen(false) }, 1800)
  }

  const waText = encodeURIComponent(`${title}\n${url}`)
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleShare}
        aria-label="Share property"
        className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card hover:bg-secondary transition-colors"
      >
        <Share2 className="w-4 h-4 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-52 rounded-xl border border-border bg-card shadow-md py-1.5">
          <button
            onClick={copyLink}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
          >
            {copied
              ? <Check className="w-4 h-4 text-green-600" />
              : <Copy className="w-4 h-4 text-muted-foreground" />}
            {copied ? 'Copied!' : 'Copy link'}
          </button>

          <a
            href={`https://wa.me/?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            WhatsApp
          </a>

          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
          >
            <Facebook className="w-4 h-4 text-[#1877F2]" />
            Facebook
          </a>

          <div className="my-1 border-t border-border" />

          <a
            href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
          >
            <Mail className="w-4 h-4 text-muted-foreground" />
            Email
          </a>
        </div>
      )}
    </div>
  )
}
