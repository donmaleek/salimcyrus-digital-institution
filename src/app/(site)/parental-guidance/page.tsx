import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/layout/PageHero'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Parental Guidance',
  description:
    'A parent education and family development platform by Salim Cyrus / Halisi Hub Connect: structured courses, masterclasses, journals, parenting tools, and mentorship for raising emotionally intelligent, responsible, resilient, and purpose-driven children.',
}

const whatYouWillLearn = [
  'Understand your child’s development and needs.',
  'Respond to difficult behaviour with clarity and consistency.',
  'Teach emotional intelligence, responsibility and respect.',
  'Support safe technology use and healthy relationships.',
  'Prepare children for money, work, decision-making and independence.',
  'Recognize when to seek additional support.',
]

const products = [
  {
    title: 'Courses',
    description:
      'Twelve structured modules, each built around one area of parenting, plus the flagship course, The Foundations of Intentional Parenting.',
    href: '/parental-guidance/courses',
    cta: 'Browse Courses',
  },
  {
    title: 'Parent Membership',
    description: 'Full access to every Parental Guidance course for one monthly membership, renewed whenever you choose.',
    href: '/parental-guidance/membership',
    cta: 'See Membership',
  },
  {
    title: 'Parenting Mentorship',
    description: 'A scheduled, one-on-one educational session focused on your specific parenting goals.',
    href: '/parental-guidance/mentorship',
    cta: 'Request Mentorship',
  },
  {
    title: 'School & Organization Package',
    description: 'Workshops, group education, and tailored resources for schools and organizations.',
    href: '/parental-guidance/school',
    cta: 'Request a Workshop',
  },
]

export default function ParentalGuidancePage() {
  return (
    <>
      <PageHero
        eyebrow="Parental Guidance"
        title="Raise Children with Wisdom, Not Just Instructions."
        description="Practical parenting education to help you understand your child, communicate with clarity, establish healthy boundaries, and prepare the next generation for responsible living."
        actions={
          <>
            <Button href="/parental-guidance/courses" size="lg">
              Explore Parenting Courses
            </Button>
            <Button href="/parental-guidance/membership" variant="outline-inverse" size="lg">
              See Parent Membership
            </Button>
          </>
        }
      />

      <section className="bg-white">
        <div className="mx-auto max-w-content px-6 py-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-700">About the platform</p>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-navy-600">
            Parenting is one of life&rsquo;s most important responsibilities, yet many adults are expected to
            perform it without structured preparation. Parental Guidance brings together practical lessons,
            reflection tools, courses, and masterclasses to help parents become more intentional in the way
            they teach, correct, listen, and lead at home.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-7 text-navy-500">
            This is general education, not individualized clinical or professional treatment. Where a concern
            is persistent or urgent, we point families toward qualified professional support.
          </p>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-700">What you will learn</p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {whatYouWillLearn.map((item) => (
              <li key={item} className="flex gap-3 text-base leading-7 text-navy-600">
                <span className="font-bold text-gold-700">&#10003;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-content px-6 py-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-700">Ways to learn</p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {products.map((product) => (
              <Link
                key={product.href}
                href={product.href}
                className="group border border-navy-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-gold-300 hover:shadow-lg"
              >
                <h2 className="font-heading text-xl font-bold text-navy group-hover:text-gold-700">{product.title}</h2>
                <p className="mt-2 text-sm leading-6 text-navy-500">{product.description}</p>
                <span className="mt-4 inline-block text-sm font-bold text-gold-700">{product.cta} &rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy text-white">
        <div className="mx-auto max-w-content px-6 py-16 text-center">
          <p className="font-heading text-2xl font-bold sm:text-3xl">
            Parent with intention. Teach with wisdom.
            <br />
            Correct with dignity. Prepare children for life.
          </p>
          <p className="mt-5 max-w-2xl mx-auto text-base leading-7 text-white/70">
            Your next step as a parent can begin with one new skill. Explore the learning library, choose a
            course that matches your current needs, and begin putting practical ideas into action.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button href="/parental-guidance/courses" size="lg">
              Browse Courses
            </Button>
            <Button href="/parental-guidance/mentorship" variant="outline-inverse" size="lg">
              Book a Mentorship Session
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
