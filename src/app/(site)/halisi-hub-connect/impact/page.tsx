import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'

export const metadata: Metadata = {
  title: 'Our Impact',
  description: 'The impact of Halisi Hub Connect — people mentored, families served, community initiatives.',
}

const stats = [
  'People mentored', 'Men reached', 'Families served', 'Children supported',
  'Community initiatives', 'Educational programs',
]

export default function ImpactPage() {
  return (
    <>
      <PageHero eyebrow="Impact" title="Building an Institution, Not Just Selling Coaching" />
      <section className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-20">
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat} className="rounded-2xl border border-dashed border-navy-200 bg-white p-6 text-center">
                <p className="font-heading text-3xl font-bold text-navy-300">—</p>
                <p className="mt-2 text-sm text-navy-500">{stat}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-navy-400">
            Figures will be published here as an annual impact report, alongside testimonials and
            photographs.
          </p>
        </div>
      </section>
    </>
  )
}
