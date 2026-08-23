import Link from 'next/link'
import { footerNav, legalNav } from '@/lib/data/navigation'

export function FooterLinks() {
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:pt-9">
      <div>
        <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.22em] text-gold">
          Explore
        </h3>
        <ul className="mt-5 space-y-3">
          {footerNav.slice(0, 6).map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="text-sm text-cream/75 transition-colors hover:text-gold">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.22em] text-gold">
          Connect
        </h3>
        <ul className="mt-5 space-y-3">
          {footerNav.slice(6).map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="text-sm text-cream/75 transition-colors hover:text-gold">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.22em] text-gold">
          Legal
        </h3>
        <ul className="mt-5 space-y-3">
          {legalNav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="text-sm text-cream/75 transition-colors hover:text-gold">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
