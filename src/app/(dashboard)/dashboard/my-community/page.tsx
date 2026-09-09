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
        where: { userId, offerName: 'Halisi Inner Circle', status: { not: 'cancelled' } },
      })
    : null

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-700">Belonging & connection</p>
      <h1 className="mt-2 font-heading text-3xl font-bold text-navy sm:text-4xl">My Community</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-navy-500">Your gateway to the Halisi Inner Circle and its community of values-led people.</p>
      {membership ? (
        <div className="mt-8 border border-navy/10 bg-white p-8 shadow-[0_18px_50px_rgba(15,30,48,0.06)] sm:p-10">
          <p className="font-heading text-lg font-semibold text-navy">
            You&apos;re a Halisi Inner Circle member.
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
        <div className="mt-8 border border-dashed border-navy-200 bg-white p-8 sm:p-10">
          <p className="font-heading text-xl font-bold text-navy">Find your circle.</p>
          <p className="mt-2 max-w-xl text-navy-500">Join the Halisi Inner Circle for deeper conversations, accountability, and community access.</p>
          <Button href="/academy/masterclasses/halisi-inner-circle" className="mt-6">
            View Membership
          </Button>
        </div>
      )}
    </div>
  )
}
