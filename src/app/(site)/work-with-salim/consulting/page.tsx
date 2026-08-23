import type { Metadata } from 'next'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'

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
    <section className="bg-cream">
      <div className="mx-auto grid max-w-content items-center gap-10 px-6 py-20 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
            Consulting
          </p>
          <h1 className="mt-4 font-heading text-4xl font-bold text-navy sm:text-5xl">
            Leadership, Relationships &amp; Personal Development
          </h1>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {areas.map((area) => (
              <div key={area.title} className="rounded-2xl border border-navy-100 bg-white p-6">
                <h2 className="font-heading text-lg font-semibold text-navy">{area.title}</h2>
                <p className="mt-2 text-sm text-navy-500">{area.description}</p>
              </div>
            ))}
          </div>
          <Button href="/contact" size="lg" className="mt-12">
            Start a Consulting Enquiry
          </Button>
        </div>
        <div className="relative mx-auto w-full max-w-[260px] overflow-hidden rounded-3xl bg-navy-50 lg:mx-0">
          <Image
            src="/images/salim/consulting.webp"
            alt="Salim Cyrus"
            width={800}
            height={1071}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  )
}
