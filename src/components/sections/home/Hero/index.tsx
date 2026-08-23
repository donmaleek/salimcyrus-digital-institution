import Image from 'next/image'
import { Button } from '@/components/ui/Button'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 top-1/2 h-[560px] w-[560px] -translate-y-1/2 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-[360px] w-[360px] rounded-full bg-gold/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-content items-end gap-10 px-6 pt-28 lg:grid-cols-2 lg:gap-6 lg:pt-16">
        <div className="pb-16 sm:pb-20 lg:pb-28">
          <h1 className="font-heading text-6xl font-bold leading-[0.95] text-cream sm:text-7xl lg:text-8xl">
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

        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <Image
            src="/images/salim/hero-cutout.webp"
            alt="Salim Cyrus"
            width={960}
            height={1440}
            priority
            className="relative z-10 mx-auto h-auto w-full max-w-[380px] object-contain lg:ml-auto lg:mr-0 lg:max-w-[440px]"
          />
        </div>
      </div>
    </section>
  )
}
