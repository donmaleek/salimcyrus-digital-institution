import Link from 'next/link'
import { footerNav, legalNav } from '@/lib/data/navigation'

export function FooterLinks() {
  return (
    <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
      <div>
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-cream/60">
          Explore
        </h3>
        <ul className="mt-4 space-y-2">
          {footerNav.slice(0, 6).map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="text-sm text-cream/80 hover:text-gold">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-cream/60">
          Connect
        </h3>
        <ul className="mt-4 space-y-2">
          {footerNav.slice(6).map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="text-sm text-cream/80 hover:text-gold">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-cream/60">
          Legal
        </h3>
        <ul className="mt-4 space-y-2">
          {legalNav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="text-sm text-cream/80 hover:text-gold">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
