import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Testimonials',
  description: 'Transformation stories from Salim Cyrus coaching, masterclasses, and community.',
}

export default function TestimonialsPage() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-content px-6 py-20">
        <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
          Testimonials
        </p>
        <h1 className="mt-4 font-heading text-4xl font-bold text-navy sm:text-5xl">
          Transformation Stories
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-navy-600">
          Specific, credible stories — not generic praise. Each story follows Before, The Process,
          and After, published with the client&apos;s consent.
        </p>

        <div className="mt-16 rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center">
          <p className="text-navy-400">
            Client stories are being collected and will appear here as they&apos;re published.
          </p>
          <Button href="/contact" variant="outline" className="mt-6">
            Share Your Story
          </Button>
        </div>
      </div>
    </section>
  )
}
