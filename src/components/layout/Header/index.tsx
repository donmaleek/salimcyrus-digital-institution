import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Navigation } from './Navigation'
import { MobileNav } from './MobileNav'

export function Header() {
  return (
    <header className="relative sticky top-0 z-50 border-b border-navy-100 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-content items-center justify-between px-6 py-4">
        <Link href="/" className="font-heading text-xl font-bold tracking-tight text-navy">
          Salim Cyrus
        </Link>

        <Navigation />

        <div className="flex items-center gap-3">
          <Button href="/work-with-salim/coaching" size="sm" className="hidden sm:inline-flex">
            Book a Session
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
