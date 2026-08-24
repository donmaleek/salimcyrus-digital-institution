import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/layout/PageHero'
import { freeGuideTitles } from '@/lib/data/free-guides'

export const metadata: Metadata = {
  title: 'Resources',
  description: 'Free guides and the digital library from Salim Cyrus.',
}

export default function ResourcesPage() {
  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Free Guides & Digital Library"
        description="Practical tools, books, and teachings designed to turn insight into action."
      />
      <section className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-20">
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="resource-guide-cards">
            {freeGuideTitles.map((guide) => (
              <Link
                key={guide}
                href="/resources/free-guides"
                data-testid="resource-guide-card"
                className="block rounded-2xl border border-navy-100 bg-white p-6 transition-shadow hover:shadow-lg"
              >
                <p className="font-medium text-navy">{guide}</p>
                <p className="mt-3 text-sm font-semibold text-gold-500">
                  Get this guide &rarr;
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-10">
            <Link
              href="/resources/digital-library"
              className="text-sm font-semibold text-gold-500 hover:underline"
            >
              Browse the full digital library &rarr;
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
