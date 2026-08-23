'use client'

import { useState } from 'react'
import Link from 'next/link'
import { mainNav } from '@/lib/data/navigation'

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-navy-700"
      >
        <span className="sr-only">Toggle navigation</span>
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <nav
          aria-label="Mobile"
          className="absolute inset-x-0 top-full z-30 max-h-[80vh] overflow-y-auto border-t border-navy-100 bg-cream shadow-lg"
        >
          <ul className="flex flex-col divide-y divide-navy-100">
            {mainNav.map((item) => (
              <li key={item.href} className="px-6 py-3">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block text-base font-medium text-navy-700"
                >
                  {item.label}
                </Link>
                {item.children && (
                  <ul className="mt-2 flex flex-col gap-2 pl-4">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          onClick={() => setOpen(false)}
                          className="block text-sm text-navy-500"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}
