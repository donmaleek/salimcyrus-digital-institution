import Link from 'next/link'
import { mainNav } from '@/lib/data/navigation'

export function Navigation() {
  return (
    <nav className="hidden xl:flex items-center" aria-label="Primary">
      {mainNav.map((item) => (
        <div key={item.href} className="group relative">
          <Link
            href={item.href}
            className="flex items-center whitespace-nowrap px-2.5 py-2 font-heading text-[15px] text-cream/90 transition-colors hover:text-gold-200"
          >
            {item.label}
          </Link>
          {item.children && (
            <div className="invisible absolute left-0 top-full z-40 min-w-[200px] rounded-lg border border-white/20 bg-navy-900/95 py-2 opacity-0 shadow-lg backdrop-blur transition-opacity group-hover:visible group-hover:opacity-100">
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className="block px-4 py-2 font-heading text-sm text-cream/90 hover:bg-white/10 hover:text-gold-200"
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
