import { Button } from '@/components/ui/Button'

export function CtaSection() {
  return (
    <section className="bg-navy">
      <div className="mx-auto max-w-content px-6 py-20 text-center">
        <h2 className="font-heading text-3xl font-bold text-cream sm:text-4xl">
          Content. Trust. Transformation.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-navy-200">
          From free teaching to premium coaching, membership, and mentorship — start wherever you
          are.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button href="/work-with-salim/coaching" size="lg">
            Book a Session
          </Button>
          <Button href="/contact" variant="outline-inverse" size="lg">
            Contact Salim
          </Button>
        </div>
      </div>
    </section>
  )
}
