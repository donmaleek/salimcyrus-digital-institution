import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'

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
      <PageHero
        eyebrow="Halisi Hub Connect"
        title={
          <>
            Awakening Wisdom. Restoring Identity.
            <br /> Cultivating Purposeful Living.
          </>
        }
        align="center"
        actions={
          <Button href="/halisi-hub-connect/community" size="lg">
            Join the Community
          </Button>
        }
      />

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
