import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'

interface NotPublishedProps {
  label: string
  slug: string
  backHref: string
  backLabel: string
}

export function NotPublished({
  label,
  slug,
  backHref,
  backLabel,
}: NotPublishedProps) {
  const title = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <>
      <PageHero
        eyebrow={label}
        title={title}
        description={`This ${label.toLowerCase()} is being prepared for publication.`}
      />
      <section className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-20 text-center">
          <p className="mx-auto mt-6 max-w-xl text-navy-500">
            This {label.toLowerCase()} hasn&apos;t been published yet — check
            back soon, or head back to browse what&apos;s available now.
          </p>
          <Button href={backHref} variant="outline" className="mt-8">
            {backLabel}
          </Button>
        </div>
      </section>
    </>
  )
}
