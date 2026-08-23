import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Free Guides',
  description: 'Free downloadable guides from Salim Cyrus.',
}

const guides = [
  '10 Questions Before You Get Married',
  'Purpose Discovery Workbook',
  'Defining Manhood Guide',
  'Marriage Communication Checklist',
  'Relationship Red Flags Guide',
  'Business Startup Checklist',
  'The Reset Checklist',
]

export default function FreeGuidesPage() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-content px-6 py-20">
        <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
          Free Guides
        </p>
        <h1 className="mt-4 font-heading text-4xl font-bold text-navy sm:text-5xl">
          Not Everything Is Paid
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-navy-600">
          Enter your email to receive any guide, plus the weekly Halisi Insight.
        </p>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <div key={guide} className="flex flex-col rounded-2xl border border-navy-100 bg-white p-6">
              <p className="flex-1 font-medium text-navy">{guide}</p>
              <Button href="/contact" variant="outline" size="sm" className="mt-4 self-start">
                Get This Guide
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
