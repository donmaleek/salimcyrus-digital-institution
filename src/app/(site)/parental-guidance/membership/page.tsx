import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PageHero } from '@/components/layout/PageHero'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils/formatting'
import { getActiveParentMembership } from '@/services/payments/parent-membership'
import { ParentMembershipSubscribeForm } from '@/components/payments/ParentMembershipSubscribeForm'
import { ParentMembershipReturn } from '@/components/payments/ParentMembershipReturn'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Parent Membership',
  description: 'Full access to every Parental Guidance course for one monthly membership.',
}

const included = [
  'Every Parental Guidance course, including the flagship Foundations of Intentional Parenting.',
  'New courses as they are added to the platform, at no extra charge.',
  'Every downloadable worksheet, planner, and checklist attached to a lesson.',
  'Progress saved automatically, with a dashboard to track every course.',
]

export default async function ParentMembershipPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  const email = session?.user?.email ?? ''
  const membership = userId ? await getActiveParentMembership(userId) : null
  const callbackPath = '/parental-guidance/membership'

  return (
    <>
      <PageHero
        eyebrow="Parental Guidance"
        title="One Membership. Every Course."
        description="Join Parent Membership for full access to every Parental Guidance course, renewed monthly, for less than the price of a single course."
      />
      <section className="bg-cream">
        <div className="mx-auto grid max-w-content gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-700">What&rsquo;s included</p>
            <ul className="mt-5 space-y-4">
              {included.map((item) => (
                <li key={item} className="flex gap-3 text-base leading-7 text-navy-600">
                  <span className="font-bold text-gold-700">&#10003;</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm leading-6 text-navy-400">
              No recurring card charge: a membership covers 30 days from payment. Renew any time before it
              lapses, and the new 30 days stacks onto whatever time you have left, so renewing early never
              costs you time you already paid for.
            </p>
          </div>

          <div className="border border-navy-100 bg-white p-6 shadow-xl sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-700">Parent Membership</p>
            <p className="mt-3 font-heading text-3xl font-bold text-navy">KES 1,500</p>
            <p className="text-sm text-navy-400">or USD 12, per month</p>

            {!userId ? (
              <Button
                href={`/login?callbackUrl=${encodeURIComponent(callbackPath)}`}
                className="mt-6 w-full"
              >
                Sign In to Join
              </Button>
            ) : membership ? (
              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-gold-700">Active</p>
                <p className="mt-2 font-heading text-xl font-bold text-navy">
                  Your membership is active until {formatDate(membership.expiresAt)}.
                </p>
                <div className="mt-6">
                  <ParentMembershipSubscribeForm email={email} />
                  <ParentMembershipReturn />
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <ParentMembershipSubscribeForm email={email} />
                <ParentMembershipReturn />
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
