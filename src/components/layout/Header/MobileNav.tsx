'use client'

import { useState } from 'react'
import Link from 'next/link'
import { mainNav } from '@/lib/data/navigation'

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <div className="xl:hidden">
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-navy-900/30 text-cream transition-colors hover:border-gold/60 hover:text-gold-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        <span className="sr-only">Toggle navigation</span>
        {open ? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <nav
          aria-label="Mobile"
          className="absolute inset-x-0 top-full z-30 max-h-[80vh] overflow-y-auto border-t border-white/20 bg-navy-900/95 shadow-lg backdrop-blur"
        >
          <ul className="flex flex-col divide-y divide-white/10">
            {mainNav.map((item) => (
              <li key={item.label} className="px-6 py-3">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block font-heading text-lg text-cream"
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
                          className="block font-heading text-base text-cream/70"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            <li className="px-6 py-4">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center justify-center rounded-full border border-cream/35 px-6 font-semibold text-cream transition-colors hover:border-gold hover:text-gold-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                Login
              </Link>
            </li>
            <li className="px-6 py-4">
              <Link
                href="/book-now"
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center justify-center rounded-full bg-gold px-6 font-semibold text-navy-900"
              >
                Book Now
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  )
}
