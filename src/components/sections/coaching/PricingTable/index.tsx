import { Button } from '@/components/ui/Button'
import { coachingOffers } from '@/lib/data/coaching-offers'
import { WHATSAPP_URL } from '@/lib/utils/constants'

export function PricingTable() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {coachingOffers.map((offer) => (
        <div key={offer.name} className="flex flex-col rounded-2xl border border-navy-100 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold-500">
            {offer.duration}
          </p>
          <h3 className="mt-1 font-heading text-lg font-semibold text-navy">{offer.name}</h3>
          <p className="mt-2 text-sm text-navy-500">{offer.tagline}</p>
          <ul className="mt-4 flex-1 space-y-1">
            {offer.points.map((point) => (
              <li key={point} className="text-sm text-navy-600">
                &bull; {point}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-navy-400">
            {offer.outcome}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Button href={offer.paystackUrl} size="sm">
              Book {offer.duration}
            </Button>
            <Button href={WHATSAPP_URL} variant="ghost" size="sm">
              WhatsApp
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
