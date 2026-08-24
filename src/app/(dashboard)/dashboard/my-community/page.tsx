import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/Button'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'My Community',
}

export default async function MyCommunityPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id

  const membership = userId
    ? await db.booking.findFirst({
        where: { userId, offerName: 'Hekima Inner Circle', status: { not: 'cancelled' } },
      })
    : null

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">My Community</h1>
      {membership ? (
        <div className="mt-8 rounded-2xl border border-navy-100 bg-white p-10 text-center">
          <p className="font-heading text-lg font-semibold text-navy">
            You&apos;re a Hekima Inner Circle member.
          </p>
          <p className="mt-3 text-navy-500">
            The community feed and discussion space are still in development. In the meantime,
            reach out on WhatsApp for anything you need from the membership.
          </p>
          <Button href="/contact" variant="outline" className="mt-6">
            Contact the Team
          </Button>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center">
          <p className="text-navy-400">Join the Hekima Inner Circle to unlock community access.</p>
          <Button href="/academy/masterclasses/hekima-inner-circle" className="mt-6">
            View Membership
          </Button>
        </div>
      )}
    </div>
  )
}
