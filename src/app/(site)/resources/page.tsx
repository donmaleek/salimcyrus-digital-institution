import type { Metadata } from 'next'
import Link from 'next/link'

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
    <section className="bg-cream">
      <div className="mx-auto max-w-content px-6 py-20">
        <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
          Resources
        </p>
        <h1 className="mt-4 font-heading text-4xl font-bold text-navy sm:text-5xl">
          Free Guides &amp; Digital Library
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-navy-600">
          Not everything is paid. Start here — download a free guide and join the weekly Halisi
          Insight.
        </p>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {freeGuides.map((guide) => (
            <div key={guide} className="rounded-2xl border border-navy-100 bg-white p-6">
              <p className="font-medium text-navy">{guide}</p>
              <p className="mt-3 text-sm font-semibold text-gold-500">Download &rarr;</p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link href="/resources/digital-library" className="text-sm font-semibold text-gold-500 hover:underline">
            Browse the full digital library &rarr;
          </Link>
        </div>
      </div>
    </section>
  )
}
