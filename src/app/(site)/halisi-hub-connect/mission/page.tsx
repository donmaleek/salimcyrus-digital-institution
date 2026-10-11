import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/layout/PageHero'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Our Mission | Halisi Hub Connect',
  description: 'Awakening wisdom and restoring identity through mentorship, community, learning, and purposeful contribution.',
}

const pillars = [
  { title: 'Mentorship', description: 'Structured spiritual and purpose mentorship for men and families.', detail: 'Space to reflect, ask honest questions, and put wisdom into practice in the decisions that shape everyday life.' },
  { title: 'Community', description: 'A fellowship where people are known, not just followed.', detail: 'Meaningful connection, shared learning, and accountability that support growth beyond a single conversation.' },
  { title: 'Masterclasses & Programs', description: 'Defining Manhood, Kingdom programs, and youth empowerment.', detail: 'Focused learning that connects identity and purpose with the responsibilities of family, leadership, and work.' },
  { title: 'Community Initiatives', description: 'Events, partnerships, and on-the-ground impact.', detail: 'Opportunities to carry what we learn into practical service and purposeful contribution to the lives of others.' },
]

export default function MissionPage() {
  return (
    <div data-testid="mission-page">
      <PageHero
        eyebrow="Mission"
        title={<>Awakening Wisdom.<br /><span className="font-normal italic text-gold-100">Restoring Identity.</span></>}
        description="The purpose at the heart of Halisi Hub Connect: forming people who live with clarity, integrity, and a responsibility to others."
        actions={<Button href="#our-purpose" variant="outline-inverse" size="lg">Explore Our Purpose</Button>}
      />

      <section id="our-purpose" className="scroll-mt-28 bg-cream" aria-labelledby="purpose-heading">
        <div className="mx-auto max-w-content px-6 py-16 sm:py-24 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-200 pb-6 text-xs font-semibold uppercase tracking-[0.18em] text-navy-600">
            <Link href="/halisi-hub-connect" className="inline-flex min-h-11 items-center hover:text-gold-600">Halisi Hub Connect</Link>
            <span>Our Purpose &amp; Commitments</span>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">01 / Our Purpose</p>
            <div>
              <h2 id="purpose-heading" className="max-w-3xl font-heading text-4xl leading-tight text-navy sm:text-5xl">A grounded life.<br /><span className="italic">A purposeful contribution.</span></h2>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-navy-600">Halisi Hub Connect is an institutional platform for knowledge, mentorship, education, community, and purposeful contribution.</p>
              <p className="mt-5 max-w-2xl leading-8 text-navy-600">Our work begins with the person and extends into the home, the workplace, and the community. Through teaching, reflection, and shared practice, we connect inner growth with the way people live, relate, and serve.</p>
            </div>
          </div>
          <div className="mt-14 border-y border-navy-200 py-8 sm:py-10">
            <p className="max-w-4xl font-heading text-2xl leading-relaxed text-navy sm:text-3xl">Wisdom becomes meaningful when it shapes our character, strengthens our relationships, and guides our contribution.</p>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">The conviction behind the work</p>
          </div>
        </div>
      </section>

      <section className="bg-white" aria-labelledby="pillars-heading">
        <div className="mx-auto max-w-content px-6 py-16 sm:py-24 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">02 / Our Commitments</p>
            <div>
              <h2 id="pillars-heading" className="font-heading text-4xl leading-tight text-navy sm:text-5xl">How our mission takes shape.</h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-navy-600">Four connected areas bring our purpose into everyday practice.</p>
            </div>
          </div>
          <ol className="mt-12 border-t border-navy-200" data-testid="mission-pillars">
            {pillars.map((pillar, index) => (
              <li key={pillar.title} className="grid gap-4 border-b border-navy-200 py-8 sm:grid-cols-[3rem_1fr] sm:gap-6 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20 lg:py-10">
                <span aria-hidden="true" className="font-heading text-2xl italic text-gold-600">{String(index + 1).padStart(2, '0')}</span>
                <div className="grid gap-5 md:grid-cols-[0.8fr_1.2fr] md:gap-8">
                  <h3 className="font-heading text-2xl leading-snug text-navy sm:text-3xl">{pillar.title}</h3>
                  <div><p className="text-lg leading-7 text-navy">{pillar.description}</p><p className="mt-3 leading-7 text-navy-600">{pillar.detail}</p></div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-navy text-cream" aria-labelledby="participate-heading">
        <div className="mx-auto grid max-w-content gap-10 px-6 py-16 sm:py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-20 lg:px-8">
          <div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-100">03 / Take Part</p><h2 id="participate-heading" className="mt-5 font-heading text-4xl leading-tight sm:text-5xl">Find your place<br /><span className="italic text-gold-100">in the mission.</span></h2><p className="mt-6 max-w-xl text-lg leading-8 text-cream/90">Grow alongside others, explore the work, or begin a conversation about how you can contribute.</p></div>
          <div className="space-y-5"><Button href="/halisi-hub-connect/community" size="lg">Explore the Community</Button><div className="border-t border-cream/25 pt-4"><Link href="/halisi-hub-connect/impact" className="flex min-h-12 items-center justify-between gap-4 text-cream hover:text-gold-100">View our impact framework <span aria-hidden="true">↗</span></Link><Link href="/contact" className="flex min-h-12 items-center justify-between gap-4 text-cream hover:text-gold-100">Discuss a partnership <span aria-hidden="true">↗</span></Link></div></div>
        </div>
      </section>
    </div>
  )
}
