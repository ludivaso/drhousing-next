'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

export interface FAQItem {
  question: string
  answer: string
}

export default function InteriorFAQ({ items }: { items: FAQItem[] }) {
  // Single-open accordion — opening one closes the previous. Simpler visual
  // rhythm than the multi-open variant and matches how luxury sites usually
  // present FAQ (one answer at a time, focused reading).
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="divide-y divide-[#E8E3DC] border-y border-[#E8E3DC]">
      {items.map((item, i) => {
        const isOpen = openIndex === i
        return (
          <div key={i}>
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-6 py-5 text-left transition-colors hover:bg-[#F5F2EE]/50 px-1"
              aria-expanded={isOpen}
            >
              <span className="font-serif text-lg text-foreground leading-snug">
                {item.question}
              </span>
              <span className="shrink-0 w-8 h-8 rounded-full border border-[#E8E3DC] flex items-center justify-center text-foreground">
                {isOpen
                  ? <Minus className="w-4 h-4" />
                  : <Plus  className="w-4 h-4" />}
              </span>
            </button>

            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
                <p className="pb-6 pr-12 pl-1 font-sans text-[15px] leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
