import { getImageProps } from 'next/image'
import { Button } from '@/components/ui/Button'

export function Hero() {
  const alt = 'Salim Cyrus presenting a keynote to a live audience'
  const { props: desktopImage } = getImageProps({
    src: '/images/salim/keynote-hero.webp',
    alt,
    fill: true,
    priority: true,
    sizes: '100vw',
  })
  const {
    props: { srcSet: mobileSrcSet },
  } = getImageProps({
    src: '/images/salim/keynote-hero-mobile.webp',
    alt,
    fill: true,
    priority: true,
    sizes: '100vw',
  })

  return (
    <section
      aria-labelledby="home-hero-title"
      className="relative isolate flex min-h-[760px] overflow-hidden bg-navy sm:min-h-[780px] lg:aspect-[1672/941] lg:min-h-0"
      data-testid="home-hero"
    >
      <picture>
        <source media="(max-width: 639px)" srcSet={mobileSrcSet} />
        <img
          {...desktopImage}
          alt={alt}
          className="object-cover object-[72%_center] sm:object-center"
        />
      </picture>

      <div className="absolute inset-0 bg-gradient-to-b from-navy/25 via-navy/5 to-navy/95 sm:from-navy/20 sm:via-transparent sm:to-navy/90 lg:bg-gradient-to-r lg:from-navy/95 lg:via-navy/55 lg:to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,27,45,0.25)_0%,transparent_24%)]" />

      <div className="relative mx-auto flex w-full max-w-content items-end px-6 pb-12 pt-32 sm:pb-16 lg:items-center lg:pb-0 lg:pt-20">
        <div className="max-w-xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-gold sm:text-sm">
            Speaker · Author · Transformational Leader
          </p>
          <h1
            id="home-hero-title"
            className="font-heading text-5xl font-bold leading-[0.94] text-cream sm:text-7xl lg:text-8xl"
          >
            Salim Cyrus
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-cream/90 sm:mt-7 sm:text-xl">
            Empowering minds. Reforming hearts. Restoring purpose through truth and wisdom.
          </p>
          <div className="mt-7 flex flex-col gap-3 min-[390px]:flex-row sm:mt-9 sm:gap-4">
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
