import Image from 'next/image'
import { Button } from '@/components/ui/Button'

export function Hero() {
  return (
    <section className="home-hero relative isolate flex min-h-[720px] items-end overflow-hidden bg-navy sm:min-h-[780px]">
      <Image
        src="/images/salim/speaking.webp"
        alt="Salim Cyrus addressing an audience"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,15,26,0.92)_0%,rgba(8,15,26,0.68)_42%,rgba(8,15,26,0.16)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-navy/70 to-transparent" />

      <div className="relative mx-auto w-full max-w-content px-6 pb-20 pt-16 sm:pb-28 lg:pb-32">
        <div className="max-w-2xl">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.24em] text-gold-200 sm:text-sm">
            Relationship Coach &middot; Speaker &middot; Author
          </p>
          <h1 className="mt-5 max-w-xl font-heading text-5xl font-bold leading-[0.95] text-cream sm:text-6xl lg:text-8xl">
            Salim Cyrus
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-relaxed text-cream/90 sm:text-xl">
            Empowering minds. Reforming hearts. Restoring purpose through truth and wisdom.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Button href="/work-with-salim/coaching" size="lg">
              Book a Session
            </Button>
            <Button href="/work-with-salim/speaking" variant="outline-inverse" size="lg">
              Book Salim to Speak
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
