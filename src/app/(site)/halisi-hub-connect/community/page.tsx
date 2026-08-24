import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import { MembershipPlans } from '@/components/sections/community/MembershipPlans'

export const metadata: Metadata = {
  title: 'Halisi Inner Circle',
  description:
    'Join the Halisi Inner Circle, a monthly community for ongoing mentorship, teaching, and connection.',
}

export default function CommunityPage() {
  return (
    <>
      <PageHero
        eyebrow="Halisi Inner Circle"
        title="A Monthly Paid Community"
        description="A consistent rhythm of teaching, reflection, accountability, and community for people committed to purposeful growth."
      />
      <section className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-20">
          <MembershipPlans />
        </div>
      </section>
    </>
  )
}
