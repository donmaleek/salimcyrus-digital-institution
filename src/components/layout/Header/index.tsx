import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Navigation } from './Navigation'
import { MobileNav } from './MobileNav'

export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-50 bg-transparent">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-3 lg:px-8">
        <Link
          href="/"
          aria-label="Salim Cyrus Home"
          className="whitespace-nowrap font-signature text-3xl leading-none text-gold sm:text-4xl"
        >
          Salim Cyrus
        </Link>

        <Navigation />

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden min-h-11 items-center border-b border-transparent px-1 font-heading text-sm tracking-[0.06em] text-cream/80 transition-colors hover:border-gold/70 hover:text-gold-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold sm:inline-flex"
          >
            Login
          </Link>
          <Button
            href="/book-now"
            size="sm"
            className="nav-booking-glow hidden min-h-11 border border-gold bg-gold px-5 text-navy-900 hover:bg-gold-300 sm:inline-flex"
          >
            Book Session Now
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
