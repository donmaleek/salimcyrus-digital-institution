import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Support the Mission',
  description: 'Support Halisi Hub Connect initiatives.',
}

export default function SupportTheMissionPage() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-content px-6 py-20 text-center">
        <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
          Support the Mission
        </p>
        <h1 className="mt-4 font-heading text-4xl font-bold text-navy sm:text-5xl">
          Help Halisi Hub Connect Reach Further
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-navy-600">
          Your support funds mentorship, community initiatives, and free resources for people who
          could not otherwise access them.
        </p>
        <Button href="/contact" size="lg" className="mt-10">
          Give to the Mission
        </Button>
      </div>
    </section>
  )
}
