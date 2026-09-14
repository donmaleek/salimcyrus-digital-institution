import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils/formatting'
import { getActiveJournalSubscription } from '@/services/payments/journal-subscriptions'
import { JournalSubscribeForm } from '@/components/payments/JournalSubscribeForm'
import { JournalSubscriptionReturn } from '@/components/payments/JournalSubscriptionReturn'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'My Journal',
}

export default async function MyJournalPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  const email = session?.user?.email ?? ''
  const subscription = userId ? await getActiveJournalSubscription(userId) : null

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-700">Journal Membership</p>
      <h1 className="mt-2 font-heading text-3xl font-bold text-navy sm:text-4xl">My Journal</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-navy-500">
        Full access to every essay in the Journal for KES 500 a month.
      </p>

      <div className="mt-8 border border-navy/10 bg-white p-6 shadow-[0_12px_32px_rgba(15,30,48,0.04)] sm:p-8">
        {subscription ? (
          <>
            <p className="text-xs font-bold uppercase tracking-wider text-gold-700">Active</p>
            <p className="mt-2 font-heading text-xl font-bold text-navy">
              Your membership is active until {formatDate(subscription.expiresAt)}.
            </p>
            <p className="mt-2 text-sm text-navy-500">
              Renewing before then adds another 30 days on top of your current access, rather than
              starting the clock over.
            </p>
            <div className="mt-6 max-w-sm">
              <JournalSubscribeForm email={email} />
              <JournalSubscriptionReturn />
            </div>
          </>
        ) : (
          <>
            <p className="text-xs font-bold uppercase tracking-wider text-navy-400">No active membership</p>
            <p className="mt-2 font-heading text-xl font-bold text-navy">
              Subscribe to read every essay in full.
            </p>
            <div className="mt-6 max-w-sm">
              <JournalSubscribeForm email={email} />
              <JournalSubscriptionReturn />
            </div>
          </>
        )}
      </div>

      <div className="mt-8">
        <Button href="/journal" variant="outline">
          Browse the Journal
        </Button>
      </div>
    </div>
  )
}
