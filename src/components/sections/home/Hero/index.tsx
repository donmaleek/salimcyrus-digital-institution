import Image from 'next/image'
import { Button } from '@/components/ui/Button'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 top-1/2 h-[560px] w-[560px] -translate-y-1/2 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-[360px] w-[360px] rounded-full bg-gold/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-content items-end gap-10 px-6 lg:grid-cols-2 lg:gap-6">
        <div className="py-20 sm:py-28 lg:py-32">
          <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Relationship Coach &middot; Speaker &middot; Author &middot; Kingdom Strategist
          </p>
          <h1 className="mt-6 max-w-xl font-heading text-4xl font-bold leading-tight text-cream sm:text-5xl lg:text-6xl">
            Salim Cyrus
          </h1>
          <p className="mt-6 max-w-md text-lg text-cream/80 sm:text-xl">
            Empowering minds. Reforming hearts. Restoring purpose through truth and wisdom.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button href="/work-with-salim/coaching" size="lg">
              Book Coaching
            </Button>
            <Button href="/halisi-hub-connect" variant="outline-inverse" size="lg">
              Join Halisi Hub Connect
            </Button>
          </div>
          <div className="mt-4">
            <Button href="/knowledge-centre" variant="ghost-inverse" size="sm">
              Explore Teachings &rarr;
            </Button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <Image
            src="/images/salim/hero-cutout.webp"
            alt="Salim Cyrus"
            width={960}
            height={1440}
            priority
            className="relative z-10 mx-auto h-auto w-full max-w-[420px] object-contain lg:ml-auto lg:mr-0 lg:max-w-[480px]"
          />
        </div>
      </div>
    </section>
  )
}
