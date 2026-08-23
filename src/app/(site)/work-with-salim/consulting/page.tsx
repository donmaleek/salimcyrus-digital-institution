import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'

export const metadata: Metadata = {
  title: 'Consulting',
  description: 'Leadership, relationships, and personal development consulting with Salim Cyrus.',
}

const areas = [
  { title: 'Leadership', description: 'Building teams, delegation, accountability, decision-making, culture.' },
  { title: 'Relationships', description: 'Marriage and family strategy for organizations and communities.' },
  { title: 'Personal Development', description: 'Purpose, identity, and character formation programs.' },
]

export default function ConsultingPage() {
  return (
    <>
      <PageHero
        eyebrow="Consulting"
        title="Leadership, Relationships & Personal Development"
        image={{ src: '/images/salim/consulting.webp', alt: 'Salim Cyrus', width: 800, height: 1071 }}
        actions={
          <Button href="/contact" size="lg">
            Start a Consulting Enquiry
          </Button>
        }
      />
      <section className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-20">
          <div className="grid gap-6 sm:grid-cols-3">
            {areas.map((area) => (
              <div key={area.title} className="rounded-2xl border border-navy-100 bg-white p-6">
                <h2 className="font-heading text-lg font-semibold text-navy">{area.title}</h2>
                <p className="mt-2 text-sm text-navy-500">{area.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
