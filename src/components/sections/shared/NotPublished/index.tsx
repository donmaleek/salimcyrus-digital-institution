import { Button } from '@/components/ui/Button'

interface NotPublishedProps {
  label: string
  slug: string
  backHref: string
  backLabel: string
}

export function NotPublished({ label, slug, backHref, backLabel }: NotPublishedProps) {
  const title = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-content px-6 py-20 text-center">
        <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
          {label}
        </p>
        <h1 className="mt-4 font-heading text-3xl font-bold text-navy sm:text-4xl">{title}</h1>
        <p className="mx-auto mt-6 max-w-xl text-navy-500">
          This {label.toLowerCase()} hasn&apos;t been published yet — check back soon, or head
          back to browse what&apos;s available now.
        </p>
        <Button href={backHref} variant="outline" className="mt-8">
          {backLabel}
        </Button>
      </div>
    </section>
  )
}
