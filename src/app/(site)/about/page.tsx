import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
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
      <PageHero
        eyebrow="About"
        title="Salim Cyrus"
        description="Relationship Coach | Speaker | Author | Kingdom Strategist. Empowering minds. Reforming hearts. Restoring purpose through truth and wisdom."
      />
      <Story />
      <OriginTimeline />
      <Philosophy />
      <FrameworksDisplay />
      <Credentials />
    </>
  )
}
