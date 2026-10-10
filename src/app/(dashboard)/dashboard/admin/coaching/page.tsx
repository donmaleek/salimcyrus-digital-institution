import type { Metadata } from 'next'
import { requireCrmPage } from '@/services/crm/access'
import { getCoachingOffers, getCoachingCategories } from '@/lib/data/coaching-catalog'
import { CoachingOfferManager } from '@/components/dashboard/CoachingOfferManager'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Coaching Sessions',
}

export default async function AdminCoachingPage() {
  await requireCrmPage('content:write')

  const [offers, categories] = await Promise.all([getCoachingOffers(), getCoachingCategories()])

  return (
    <div>
      <div className="rounded-3xl bg-navy px-6 py-8 text-white sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Content studio</p>
        <h1 className="mt-3 font-heading text-3xl font-bold">Coaching Sessions</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
          Edit the price, duration, description, and location shown for any coaching session, and upload a
          card image per category. Changes take effect immediately on Book Now, no deploy needed.
        </p>
      </div>
      <div className="mt-8">
        <CoachingOfferManager initialOffers={offers} initialCategories={categories} />
      </div>
    </div>
  )
}
