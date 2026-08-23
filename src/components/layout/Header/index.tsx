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
          aria-label="Salim Cyrus — Home"
          className="whitespace-nowrap font-signature text-3xl leading-none text-gold sm:text-4xl"
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
            Book
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
