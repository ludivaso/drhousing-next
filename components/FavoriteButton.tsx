'use client'
import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'

const STORAGE_KEY = 'drh_favorites'

function getFavorites(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}

interface Props {
  propertyId: string
  className?: string
}

export default function FavoriteButton({ propertyId, className = '' }: Props) {
  const [isFaved, setIsFaved] = useState(false)

  useEffect(() => {
    setIsFaved(getFavorites().includes(propertyId))
  }, [propertyId])

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const current = getFavorites()
    const updated = current.includes(propertyId)
      ? current.filter((id) => id !== propertyId)
      : [...current, propertyId]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('drh-favorites-changed', { detail: { updated } }))
    setIsFaved(!current.includes(propertyId))
  }

  return (
    <button
      onClick={toggle}
      aria-label={isFaved ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      className={`flex items-center justify-center transition-colors ${className}`}
    >
      <Heart
        className="w-5 h-5 transition-colors"
        fill={isFaved ? '#C9A96E' : 'none'}
        stroke={isFaved ? '#C9A96E' : 'currentColor'}
      />
    </button>
  )
}
