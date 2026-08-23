import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'

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
    <>
      <PageHero
        eyebrow="Free Guides"
        title="Not Everything Is Paid"
        description="Practical tools you can use now, plus the weekly Halisi Insight."
      />
      <section className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-20">
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <div
                key={guide}
                className="flex flex-col rounded-2xl border border-navy-100 bg-white p-6"
              >
                <p className="flex-1 font-medium text-navy">{guide}</p>
                <Button
                  href="/contact"
                  variant="outline"
                  size="sm"
                  className="mt-4 self-start"
                >
                  Get This Guide
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
