import { Button } from '@/components/ui/Button'

export function CtaSection() {
  return (
    <section className="bg-navy">
      <div className="mx-auto grid max-w-content gap-8 px-6 py-16 sm:py-24 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">Your next move</p>
        <h2 className="mt-3 max-w-3xl font-heading text-4xl font-bold text-cream sm:text-5xl">
          Bring one honest question. Leave with a clearer path.
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-navy-200">
          Ask a public question, choose private coaching, invite Salim to speak, or contact the institution about a partnership.
        </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
          <Button href="/ask-salim" size="lg">
            Ask Salim
          </Button>
          <Button href="/contact" variant="outline-inverse" size="lg">
            Contact the Institution
          </Button>
        </div>
      </div>
    </section>
  )
}
