import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { JsonLd } from '@/components/sections/shared/SEO'
import { programs } from '@/lib/data/programs'
import { formatCurrency } from '@/lib/utils/currency'
import { WHATSAPP_URL } from '@/lib/utils/constants'

interface PageProps {
  params: { slug: string }
}

export function generateStaticParams() {
  return programs.map((program) => ({ slug: program.slug }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const program = programs.find((p) => p.slug === params.slug)
  if (!program) return { title: 'Program' }
  return {
    title: program.name,
    description: program.description,
    openGraph: { title: program.name, description: program.description },
  }
}

export default function ProgramDetailPage({ params }: PageProps) {
  const program = programs.find((p) => p.slug === params.slug)
  if (!program) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: program.name,
    provider: { '@type': 'Person', name: 'Salim Cyrus' },
    description: program.description,
    offers: {
      '@type': 'Offer',
      price: program.priceKes,
      priceCurrency: 'KES',
      url: program.paystackUrl,
      ...(program.recurring ? { eligibleDuration: 'P1M' } : {}),
    },
  }

  return (
    <section className="bg-cream">
      <JsonLd data={jsonLd} />
      <div className="mx-auto max-w-content px-6 py-20">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-gold-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold-500">
            {program.tag}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-navy-400">
            {program.duration}
          </span>
        </div>
        <h1 className="mt-4 font-heading text-4xl font-bold text-navy sm:text-5xl">
          {program.name}
        </h1>
        <p className="mt-2 text-lg font-medium text-navy-500">{program.focus}</p>
        <p className="mt-6 max-w-2xl text-lg text-navy-600">{program.description}</p>

        <ul className="mt-8 space-y-2">
          {program.highlights.map((h) => (
            <li key={h} className="text-navy-600">
              &bull; {h}
            </li>
          ))}
        </ul>

        {program.scripture && (
          <p className="mt-8 max-w-xl rounded-lg bg-navy-50 p-4 italic text-navy-500">
            {program.scripture}
          </p>
        )}

        <p className="mt-8 font-heading text-xl italic text-navy-700">
          &ldquo;{program.closingLine}&rdquo;
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-6">
          <div>
            <p className="text-3xl font-bold text-navy">
              {formatCurrency(program.priceKes)}
              {program.recurring && <span className="text-base font-normal text-navy-400">/mo</span>}
            </p>
            <p className="text-sm text-navy-400">
              USD {program.priceUsd}
              {program.recurring && '/mo'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button href={program.paystackUrl} size="lg">
              Apply
            </Button>
            <Button href={WHATSAPP_URL} variant="outline" size="lg">
              WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
