import Link from 'next/link'
import { mainNav } from '@/lib/data/navigation'

export function Navigation() {
  return (
    <nav className="hidden items-center gap-2 xl:flex" aria-label="Primary">
      {mainNav.map((item) => (
        <div key={item.label} className="group relative">
          <Link
            href={item.href}
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
                className="opacity-60 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
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
            <div className="invisible absolute left-0 top-full z-40 min-w-[220px] border border-white/15 bg-navy-900/95 py-2 opacity-0 shadow-xl backdrop-blur-md transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className="flex min-h-11 items-center px-5 py-2 font-heading text-sm text-cream/85 transition-colors hover:bg-white/10 hover:text-gold-200 focus-visible:bg-white/10 focus-visible:text-gold-200 focus-visible:outline-none"
                >
                  {child.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  )
}
