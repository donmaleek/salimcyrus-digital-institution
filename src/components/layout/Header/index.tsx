import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Navigation } from './Navigation'
import { MobileNav } from './MobileNav'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy">
      <div className="mx-auto flex max-w-content items-center justify-between px-6 py-2">
        <Link
          href="/"
          aria-label="Salim Cyrus — Home"
          className="font-signature text-4xl leading-none text-gold sm:text-5xl"
        >
          Salim Cyrus
        </Link>

        <Navigation />

        <div className="flex items-center gap-3">
          <Button
            href="/work-with-salim/speaking"
            size="sm"
            className="hidden border border-gold bg-gold text-navy-900 hover:bg-gold-300 sm:inline-flex"
          >
            Book Salim
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
