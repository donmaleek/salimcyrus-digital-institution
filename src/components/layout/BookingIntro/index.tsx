import Link from 'next/link'

/** A short task header keeps the booking controls close to the navigation. */
export function BookingIntro({ title, description }: { title: string; description: string }) {
  return (
    <section className="bg-navy px-5 pb-8 pt-28 text-white sm:px-6 sm:pb-10 sm:pt-32" data-testid="booking-intro">
      <div className="mx-auto max-w-content">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gold">Private coaching with Salim Cyrus</p>
        <h1 className="mt-3 font-heading text-3xl font-bold leading-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-white/90">{description}</p>
        <Link href="/book-now/confirm" className="mt-4 inline-flex min-h-12 items-center text-base font-semibold text-gold underline underline-offset-4 hover:text-gold-200">Already paid? Choose your time</Link>
      </div>
    </section>
  )
}
