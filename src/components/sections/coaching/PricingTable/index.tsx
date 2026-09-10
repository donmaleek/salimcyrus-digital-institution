import { Button } from '@/components/ui/Button'
import { coachingOffers } from '@/lib/data/coaching-offers'
import { formatCurrency } from '@/lib/utils/currency'

const standardOffers = coachingOffers.filter((offer) => offer.category === 'standard')

/**
 * A teaser for the Standard tier only, not the full catalog: Individual,
 * Couples, Group, and VIP Summit pricing lives on /book-now, where the
 * category picker and real checkout (PayPal/Paybill) actually work.
 */
export function PricingTable() {
  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {standardOffers.map((offer) => (
          <div key={offer.name} className="flex flex-col rounded-2xl border border-navy-100 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-500">{offer.duration}</p>
            <h3 className="mt-1 font-heading text-lg font-semibold text-navy">{offer.name}</h3>
            <p className="mt-2 text-sm text-navy-500">{offer.tagline}</p>
            <ul className="mt-4 flex-1 space-y-1">
              {offer.points.map((point) => (
                <li key={point} className="text-sm text-navy-600">
                  &bull; {point}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-navy-400">{offer.outcome}</p>
            <p className="mt-3 font-heading text-xl font-bold text-navy">{formatCurrency(offer.priceKes)}</p>
            <div className="mt-4">
              <Button href="/book-now#choose-session" size="sm" className="w-full">
                Book {offer.duration}
              </Button>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-8 text-center text-sm leading-6 text-navy-500">
        Also available: individual and couples coaching by location, group coaching, and VIP Summit speaking.{' '}
        <a href="/book-now#choose-session" className="font-semibold text-navy underline">
          See all formats
        </a>
        .
      </p>
    </div>
  )
}
