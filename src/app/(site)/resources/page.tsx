import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/layout/PageHero'

export const metadata: Metadata = {
  title: 'Resources',
  description: 'Free guides and the digital library from Salim Cyrus.',
}

const freeGuides = [
  '10 Questions Before You Get Married',
  'Purpose Discovery Workbook',
  'Defining Manhood Guide',
  'Marriage Communication Checklist',
  'Relationship Red Flags Guide',
  'Business Startup Checklist',
]

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
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {freeGuides.map((guide) => (
              <div
                key={guide}
                className="rounded-2xl border border-navy-100 bg-white p-6"
              >
                <p className="font-medium text-navy">{guide}</p>
                <p className="mt-3 text-sm font-semibold text-gold-500">
                  Download &rarr;
                </p>
              </div>
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
