import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Halisi Hub Connect',
  description: 'Awakening wisdom. Restoring identity. Cultivating purposeful living.',
}

const links = [
  { title: 'Mission', description: 'Why Halisi Hub Connect exists.', href: '/halisi-hub-connect/mission' },
  { title: 'Community', description: 'Join the Halisi Inner Circle membership.', href: '/halisi-hub-connect/community' },
  { title: 'Impact', description: 'People mentored, families served, our results.', href: '/halisi-hub-connect/impact' },
]

export default function HalisiHubConnectPage() {
  return (
    <>
      <section className="border-b border-navy-100 bg-navy">
        <div className="mx-auto max-w-content px-6 py-24 text-center">
          <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Halisi Hub Connect
          </p>
          <h1 className="mt-4 font-heading text-4xl font-bold text-cream sm:text-5xl">
            Awakening Wisdom. Restoring Identity.
            <br /> Cultivating Purposeful Living.
          </h1>
          <Button href="/halisi-hub-connect/community" size="lg" className="mt-10">
            Join the Community
          </Button>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-20">
          <div className="grid gap-6 sm:grid-cols-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-2xl border border-navy-100 bg-white p-8 transition-shadow hover:shadow-lg"
              >
                <h2 className="font-heading text-xl font-semibold text-navy">{link.title}</h2>
                <p className="mt-3 text-sm text-navy-500">{link.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
