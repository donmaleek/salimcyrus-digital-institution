import Link from 'next/link'
import { mainNav } from '@/lib/data/navigation'

export function Navigation() {
  return (
    <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
      {mainNav.map((item) => (
        <div key={item.href} className="group relative">
          <Link
            href={item.href}
            className="px-3 py-2 text-sm font-medium text-navy-700 hover:text-gold-500 transition-colors"
          >
            {item.label}
          </Link>
          {item.children && (
            <div className="invisible absolute left-0 top-full z-40 min-w-[200px] rounded-lg border border-navy-100 bg-cream py-2 opacity-0 shadow-lg transition-opacity group-hover:visible group-hover:opacity-100">
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className="block px-4 py-2 text-sm text-navy-700 hover:bg-navy-50 hover:text-gold-500"
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
