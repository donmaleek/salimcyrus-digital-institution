import type { Metadata } from 'next'
import { Story } from '@/components/sections/about/Story'
import { Philosophy } from '@/components/sections/about/Philosophy'
import { FrameworksDisplay } from '@/components/sections/about/FrameworksDisplay'
import { OriginTimeline } from '@/components/sections/about/OriginTimeline'
import { Credentials } from '@/components/sections/about/Credentials'

export const metadata: Metadata = {
  title: 'About Salim Cyrus',
  description: 'The story, philosophy, and frameworks behind Salim Cyrus and Halisi Hub Connect.',
}

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-navy-100 bg-cream">
        <div className="mx-auto max-w-content px-6 py-20">
          <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
            About
          </p>
          <h1 className="mt-4 font-heading text-4xl font-bold text-navy sm:text-5xl">
            Salim Cyrus
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-navy-600">
            Relationship Coach | Speaker | Author | Kingdom Strategist. Empowering minds.
            Reforming hearts. Restoring purpose through truth and wisdom.
          </p>
        </div>
      </section>
      <Story />
      <OriginTimeline />
      <Philosophy />
      <FrameworksDisplay />
      <Credentials />
    </>
  )
}
