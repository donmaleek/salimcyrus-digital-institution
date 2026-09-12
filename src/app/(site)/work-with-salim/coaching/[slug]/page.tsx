import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'
import { JsonLd } from '@/components/sections/shared/SEO'
import {
  alignmentProcess,
  alignmentSessions,
  getAlignmentSession,
} from '@/lib/data/alignment-sessions'
import { WHATSAPP_URL } from '@/lib/utils/constants'

interface AlignmentSessionPageProps {
  params: { slug: string }
}

export function generateStaticParams() {
  return alignmentSessions.map(({ slug }) => ({ slug }))
}

export function generateMetadata({ params }: AlignmentSessionPageProps): Metadata {
  const session = getAlignmentSession(params.slug)
  if (!session) return {}

  return {
    title: `${session.shortTitle} Sessions`,
    description: session.description,
  }
}

export default function AlignmentSessionPage({ params }: AlignmentSessionPageProps) {
  const session = getAlignmentSession(params.slug)
  if (!session) notFound()

  const bookingHref =
    session.slug === 'identity-life-alignment'
      ? '/book-now?offer=Identity%20%26%20Life%20Alignment%20Session#choose-session'
      : '/book-now#choose-session'

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${session.shortTitle} Sessions`,
    description: session.description,
    provider: { '@type': 'Person', name: 'Salim Cyrus' },
    serviceType: 'Private life alignment coaching',
  }

  return (
    <main id="main-content">
      <JsonLd data={serviceJsonLd} />

      <PageHero
        eyebrow={session.eyebrow}
        title={session.title}
        description={session.description}
        actions={
          <>
            <Button href={bookingHref} size="lg">
              Book a Private Session
            </Button>
            <Button href={WHATSAPP_URL} variant="outline-inverse" size="lg">
              Ask Confidentially
            </Button>
          </>
        }
      >
        <p className="mt-7 border-t border-gold/60 pt-5 font-heading text-xl text-white">
          Private. Respectful. Personal.
        </p>
      </PageHero>

      <section className="bg-white" aria-labelledby="who-heading">
        <div className="mx-auto grid max-w-content gap-12 px-6 py-20 sm:py-24 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold-600">Who this is for</p>
            <h2 id="who-heading" className="mt-4 text-balance font-heading text-3xl font-bold text-navy sm:text-4xl">
              A conversation built around the life you are actually living
            </h2>
            <p className="mt-5 text-lg leading-8 text-navy-600">{session.audienceIntroduction}</p>
          </div>
          <ol className="border-t border-navy-200">
            {session.audience.map((item, index) => (
              <li key={item} className="grid grid-cols-[42px_1fr] gap-4 border-b border-navy-200 py-5 leading-7 text-navy-700 sm:grid-cols-[56px_1fr]">
                <span className="font-heading font-bold text-gold-600">{String(index + 1).padStart(2, '0')}</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-cream" aria-labelledby="themes-heading">
        <div className="mx-auto max-w-content px-6 py-20 sm:py-24">
          <div className="grid gap-6 border-b border-navy-200 pb-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold-600">What we explore</p>
              <h2 id="themes-heading" className="mt-4 font-heading text-3xl font-bold text-navy sm:text-4xl">Six areas. One whole life.</h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-navy-600 lg:pt-8">
              The conversation follows what matters most now while keeping the wider pattern in view.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3">
            {session.themes.map((theme, index) => (
              <article key={theme.title} className="border-b border-navy-200 py-8 sm:px-7 sm:first:pl-0 lg:border-r lg:[&:nth-child(3n)]:border-r-0 lg:[&:nth-child(3n+1)]:pl-0">
                <p className="text-xs font-bold tracking-[0.18em] text-gold-600">{String(index + 1).padStart(2, '0')}</p>
                <h3 className="mt-4 font-heading text-2xl font-bold text-navy">{theme.title}</h3>
                <p className="mt-3 leading-7 text-navy-600">{theme.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy-50" aria-labelledby="approach-heading">
        <div className="mx-auto max-w-content px-6 py-20 sm:py-24">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold-600">The Salim Cyrus approach</p>
          <h2 id="approach-heading" className="mt-4 font-heading text-3xl font-bold text-navy sm:text-4xl">A clear path through a difficult conversation</h2>
          <ol className="mt-12 border-t border-navy-200">
            {alignmentProcess.map((item, index) => (
              <li key={item.step} className="grid gap-3 border-b border-navy-200 py-6 sm:grid-cols-[52px_0.55fr_1.45fr] sm:gap-8">
                <span className="font-heading font-bold text-gold-600">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="font-heading text-xl font-bold text-navy">{item.step}</h3>
                <p className="leading-7 text-navy-600">{item.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white" aria-labelledby="principle-heading">
        <div className="mx-auto grid max-w-content gap-12 px-6 py-20 sm:py-24 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold-600">A defining principle</p>
            <h2 id="principle-heading" className="mt-4 font-heading text-3xl font-bold text-navy sm:text-4xl">Dignity comes first.</h2>
          </div>
          <div>
            <blockquote className="border-t border-gold-500 pt-7 font-heading text-3xl leading-tight text-navy sm:text-4xl">“{session.principle}”</blockquote>
            <p className="mt-7 text-lg leading-8 text-navy-600">{session.closing}</p>
          </div>
        </div>
      </section>

      <section className="bg-gold" aria-labelledby="private-session-heading">
        <div className="mx-auto grid max-w-content gap-8 px-6 py-16 sm:py-20 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-navy-700">Confidential one-on-one session</p>
            <h2 id="private-session-heading" className="mt-4 max-w-3xl text-balance font-heading text-4xl font-bold text-navy sm:text-5xl">You do not have to have everything figured out before you begin.</h2>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Button href={bookingHref} variant="primary" size="lg">Book a Private Session</Button>
            <Button href={WHATSAPP_URL} variant="outline" size="lg">Ask a Question</Button>
          </div>
        </div>
      </section>

      <section className="bg-navy px-6 py-8 text-cream" aria-labelledby="scope-heading">
        <div className="mx-auto max-w-content">
          <h2 id="scope-heading" className="font-heading text-xl font-bold">Scope of support</h2>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-cream/65">
            These sessions provide coaching, education, and structured reflection. They do not promise to change or eliminate sexual orientation and do not replace licensed mental-health care, emergency support, medical treatment, or legal advice. If you are experiencing trauma, severe distress, depression, anxiety, or thoughts of self-harm, seek appropriate licensed or emergency support.
          </p>
        </div>
      </section>
    </main>
  )
}
