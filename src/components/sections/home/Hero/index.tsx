import { Button } from '@/components/ui/Button'

export function Hero() {
  return (
    <section className="border-b border-navy-100 bg-cream">
      <div className="mx-auto max-w-content px-6 py-20 sm:py-28">
        <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
          Relationship Coach &middot; Speaker &middot; Author &middot; Kingdom Strategist
        </p>
        <h1 className="mt-6 max-w-3xl font-heading text-4xl font-bold leading-tight text-navy sm:text-5xl lg:text-6xl">
          Salim Cyrus
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-navy-600 sm:text-xl">
          Empowering minds. Reforming hearts. Restoring purpose through truth and wisdom.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button href="/work-with-salim/coaching" size="lg">
            Book Coaching
          </Button>
          <Button href="/halisi-hub-connect" variant="secondary" size="lg">
            Join Halisi Hub Connect
          </Button>
          <Button href="/knowledge-centre" variant="outline" size="lg">
            Explore Teachings
          </Button>
        </div>
      </div>
    </section>
  )
}
