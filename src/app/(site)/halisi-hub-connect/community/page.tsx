import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import { MembershipPlans } from '@/components/sections/community/MembershipPlans'

export const metadata: Metadata = {
  title: 'Halisi Inner Circle',
  description: 'Join the Halisi Inner Circle — a monthly paid community for ongoing mentorship and teaching.',
}

export default function CommunityPage() {
  return (
    <>
      <PageHero
        eyebrow="Halisi Inner Circle"
        title="A Monthly Paid Community"
        description="Recurring revenue for the mission, and recurring transformation for you — instead of depending entirely on individual coaching sessions."
      />
      <section className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-20">
          <MembershipPlans />
        </div>
      </section>
    </>
  )
}
