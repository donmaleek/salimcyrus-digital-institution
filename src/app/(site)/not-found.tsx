import { Button } from '@/components/ui/Button'

export default function SiteNotFound() {
  return (
    <div className="mx-auto max-w-content px-6 py-24 text-center">
      <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
        404
      </p>
      <h1 className="mt-4 font-heading text-3xl font-bold text-navy sm:text-4xl">
        We Couldn&apos;t Find That Page
      </h1>
      <p className="mx-auto mt-4 max-w-md text-navy-500">
        It may have moved, or the link may be out of date.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button href="/">Back to Home</Button>
        <Button href="/contact" variant="outline">
          Contact Us
        </Button>
      </div>
    </div>
  )
}
