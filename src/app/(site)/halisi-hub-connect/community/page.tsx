import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/layout/PageHero'
import { Button } from '@/components/ui/Button'
import { MembershipPlans } from '@/components/sections/community/MembershipPlans'

export const metadata: Metadata = {
  title: 'Halisi Inner Circle',
  description:
    'Join the Halisi Inner Circle, a monthly community for ongoing mentorship, teaching, and connection.',
}

const rhythm = [
  [
    'Teaching',
    'Return to ideas that matter.',
    'Weekly teaching and exclusive articles create space to explore wisdom, identity, relationships, and purposeful living.',
  ],
  [
    'Reflection',
    'Connect learning with daily life.',
    'Use the rhythm of learning and conversation to consider your choices, responsibilities, and personal growth.',
  ],
  [
    'Connection',
    'Grow in the company of others.',
    'A private community and monthly Q&A offer opportunities to ask questions and stay connected beyond the teaching.',
  ],
]

export default function CommunityPage() {
  return (
    <div data-testid="community-page">
      <PageHero
        eyebrow="Halisi Inner Circle"
        title={
          <>
            A place to belong.
            <br />
            <span className="font-normal italic text-gold-100">
              A rhythm to grow.
            </span>
          </>
        }
        description="A monthly paid community for teaching, reflection, accountability, and meaningful connection. For people committed to purposeful growth."
        actions={
          <Button href="#membership" variant="outline-inverse" size="lg">
            Explore Membership
          </Button>
        }
      />
      <section className="bg-cream" aria-labelledby="belong-heading">
        <div className="mx-auto max-w-content px-6 py-16 sm:py-24 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-200 pb-6 text-xs font-semibold uppercase tracking-[0.18em] text-navy-600">
            <Link
              href="/halisi-hub-connect"
              className="inline-flex min-h-11 items-center hover:text-gold-600"
            >
              Halisi Hub Connect
            </Link>
            <span>Community &amp; Membership</span>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">
              01 / Belonging
            </p>
            <div>
              <h2
                id="belong-heading"
                className="font-heading text-4xl leading-tight text-navy sm:text-5xl"
              >
                Growth is personal.
                <br />
                <span className="italic">You can share the journey.</span>
              </h2>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-navy-600">
                The Halisi Inner Circle brings ongoing teaching, mentorship, and
                community into a consistent monthly rhythm.
              </p>
              <p className="mt-5 max-w-2xl leading-8 text-navy-600">
                It is a space to return to meaningful questions, reflect on what
                you learn, and connect with others who take their growth
                seriously. Choose the membership that fits the depth of support
                you are looking for.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-white" aria-labelledby="rhythm-heading">
        <div className="mx-auto max-w-content px-6 py-16 sm:py-24 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">
              02 / The Community Rhythm
            </p>
            <h2
              id="rhythm-heading"
              className="font-heading text-4xl leading-tight text-navy sm:text-5xl"
            >
              Learn. Reflect.
              <br />
              <span className="italic">Stay connected.</span>
            </h2>
          </div>
          <ol
            className="mt-12 border-t border-navy-200"
            data-testid="community-rhythm"
          >
            {rhythm.map(([name, title, detail], index) => (
              <li
                key={name}
                className="grid gap-5 border-b border-navy-200 py-8 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20 lg:py-10"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">
                  {String(index + 1).padStart(2, '0')} / {name}
                </p>
                <div>
                  <h3 className="font-heading text-2xl text-navy sm:text-3xl">
                    {title}
                  </h3>
                  <p className="mt-4 max-w-2xl leading-8 text-navy-600">
                    {detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section
        id="membership"
        className="scroll-mt-28 bg-cream"
        aria-labelledby="membership-heading"
      >
        <div className="mx-auto max-w-content px-6 py-16 sm:py-24 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">
              03 / Membership
            </p>
            <div>
              <h2
                id="membership-heading"
                className="font-heading text-4xl leading-tight text-navy sm:text-5xl"
              >
                Choose your level
                <br />
                <span className="italic">of connection.</span>
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-navy-600">
                Three monthly options, with a clear view of what each includes.
              </p>
            </div>
          </div>
          <div className="mt-12">
            <MembershipPlans />
          </div>
          <p className="mt-7 max-w-3xl text-sm leading-7 text-navy-600">
            Membership enquiries go to our contact page. Tell us which plan
            interests you and we will help you with the next steps. This page
            does not collect payment or activate a membership.
          </p>
        </div>
      </section>
      <section
        className="bg-navy text-cream"
        aria-labelledby="conversation-heading"
      >
        <div className="mx-auto grid max-w-content gap-10 px-6 py-16 sm:py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-20 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-100">
              Begin a Conversation
            </p>
            <h2
              id="conversation-heading"
              className="mt-5 font-heading text-4xl leading-tight sm:text-5xl"
            >
              Find the right place
              <br />
              <span className="italic text-gold-100">to begin.</span>
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-cream/90">
              Have a question about the community or which membership fits you?
              Start with a conversation.
            </p>
          </div>
          <div className="space-y-5">
            <Button href="/contact" size="lg">
              Ask About Membership
            </Button>
            <div className="border-t border-cream/25 pt-4">
              <Link
                href="/halisi-hub-connect/mission"
                className="flex min-h-12 items-center justify-between gap-4 hover:text-gold-100"
              >
                Read our mission <span aria-hidden="true">↗</span>
              </Link>
              <Link
                href="/halisi-hub-connect/impact"
                className="flex min-h-12 items-center justify-between gap-4 hover:text-gold-100"
              >
                View our impact framework <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
