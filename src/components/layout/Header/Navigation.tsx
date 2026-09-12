'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { mainNav } from '@/lib/data/navigation'

export function Navigation() {
  const pathname = usePathname()
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  useEffect(() => {
    setOpenMenu(null)
  }, [pathname])

  return (
    <nav className="hidden items-center gap-2 xl:flex" aria-label="Primary">
      {mainNav.map((item) => {
        const isOpen = openMenu === item.label

        return (
          <div
            key={item.label}
            className="relative"
            onMouseEnter={() => item.children && setOpenMenu(item.label)}
            onMouseLeave={() => setOpenMenu(null)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setOpenMenu(null)
                event.currentTarget.querySelector('a')?.focus()
              }
            }}
          >
            <Link
              href={item.href}
              aria-expanded={item.children ? isOpen : undefined}
              onFocus={() => item.children && setOpenMenu(item.label)}
              onClick={() => setOpenMenu(null)}
              className="flex min-h-12 items-center gap-1.5 whitespace-nowrap px-3 py-3 font-heading text-[15px] tracking-[0.035em] text-cream/90 transition-colors hover:text-gold-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              {item.label}
              {item.children && (
                <svg
                  aria-hidden="true"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className={`opacity-60 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                >
                  <path
                    d="m3 4.5 3 3 3-3"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </Link>
            {item.children && (
              <div
                aria-hidden={!isOpen}
                className={`absolute left-0 top-full z-40 min-w-[220px] border border-white/15 bg-navy-900/95 py-2 shadow-xl backdrop-blur-md transition-opacity ${
                  isOpen ? 'visible opacity-100' : 'invisible opacity-0'
                }`}
              >
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    tabIndex={isOpen ? 0 : -1}
                    onClick={() => setOpenMenu(null)}
                    className="flex min-h-11 items-center px-5 py-2 font-heading text-sm text-cream/85 transition-colors hover:bg-white/10 hover:text-gold-200 focus-visible:bg-white/10 focus-visible:text-gold-200 focus-visible:outline-none"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}
