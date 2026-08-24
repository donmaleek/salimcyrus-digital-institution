import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import { Story } from '@/components/sections/about/Story'
import { Philosophy } from '@/components/sections/about/Philosophy'
import { FrameworksDisplay } from '@/components/sections/about/FrameworksDisplay'
import { OriginTimeline } from '@/components/sections/about/OriginTimeline'
import { Credentials } from '@/components/sections/about/Credentials'

export const metadata: Metadata = {
  title: 'About Salim Cyrus',
  description:
    'Meet Salim Cyrus, relationship coach, speaker, author, and Kingdom strategist. Explore his story, philosophy, frameworks, books, and certifications.',
}

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Salim Cyrus"
        description="Relationship Coach | Speaker | Author | Kingdom Strategist. Helping people renew their thinking, strengthen relationships, and live with purpose through truth, wisdom, and practical structure."
      />
      <Story />
      <OriginTimeline />
      <Philosophy />
      <FrameworksDisplay />
      <Credentials />
    </>
  )
}
