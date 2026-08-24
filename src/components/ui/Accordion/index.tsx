'use client'

import { useState, type ReactNode } from 'react'

export interface AccordionItem {
  question: string
  answer: ReactNode
}

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="divide-y divide-navy-100">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        return (
          <div key={item.question}>
            <h3>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 py-6 text-left"
              >
                <span className="font-heading text-lg font-semibold text-navy">
                  {item.question}
                </span>
                <span
                  className={`shrink-0 text-2xl leading-none text-gold-500 transition-transform ${
                    isOpen ? 'rotate-45' : ''
                  }`}
                  aria-hidden
                >
                  +
                </span>
              </button>
            </h3>
            {isOpen && <p className="pb-6 text-navy-600">{item.answer}</p>}
          </div>
        )
      })}
    </div>
  )
}
