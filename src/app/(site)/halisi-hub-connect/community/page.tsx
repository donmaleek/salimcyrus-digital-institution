import type { Metadata } from 'next'
import { MembershipPlans } from '@/components/sections/community/MembershipPlans'

export const metadata: Metadata = {
  title: 'Halisi Inner Circle',
  description: 'Join the Halisi Inner Circle — a monthly paid community for ongoing mentorship and teaching.',
}

export default function CommunityPage() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-content px-6 py-20">
        <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
          Halisi Inner Circle
        </p>
        <h1 className="mt-4 font-heading text-4xl font-bold text-navy sm:text-5xl">
          A Monthly Paid Community
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-navy-600">
          Recurring revenue for the mission, and recurring transformation for you — instead of
          depending entirely on individual coaching sessions.
        </p>

        <div className="mt-14">
          <MembershipPlans />
        </div>
      </div>
    </section>
  )
}
