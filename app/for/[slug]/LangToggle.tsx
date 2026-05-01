'use client'

interface Props {
  value: 'en' | 'es'
  onChange: (lang: 'en' | 'es') => void
}

export default function LangToggle({ value, onChange }: Props) {
  return (
    <div className="flex items-center rounded-full border border-[#E8E3DC] overflow-hidden text-xs font-medium">
      <button
        onClick={() => onChange('en')}
        className={`px-3 py-1.5 transition-colors ${
          value === 'en'
            ? 'bg-[#C9A96E] text-white'
            : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
        }`}
        aria-pressed={value === 'en'}
      >
        EN
      </button>
      <button
        onClick={() => onChange('es')}
        className={`px-3 py-1.5 transition-colors ${
          value === 'es'
            ? 'bg-[#C9A96E] text-white'
            : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
        }`}
        aria-pressed={value === 'es'}
      >
        ES
      </button>
    </div>
  )
}
