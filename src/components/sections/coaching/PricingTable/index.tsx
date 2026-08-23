import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils/currency'

const tiers = [
  { name: '1 Hour Coaching', price: 3500, description: 'A focused single session.' },
  { name: '2-Hour Deep Dive', price: 6500, description: 'Extended session for complex situations.' },
  { name: 'Monthly Coaching', price: 25000, description: 'Ongoing structured coaching relationship.' },
]

export function PricingTable() {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {tiers.map((tier) => (
        <div key={tier.name} className="flex flex-col rounded-2xl border border-navy-100 bg-white p-6">
          <h3 className="font-heading text-lg font-semibold text-navy">{tier.name}</h3>
          <p className="mt-2 text-3xl font-bold text-navy">{formatCurrency(tier.price)}</p>
          <p className="mt-2 flex-1 text-sm text-navy-500">{tier.description}</p>
          <Button href="/contact" className="mt-6" variant="outline">
            Book This
          </Button>
        </div>
      ))}
      <p className="sm:col-span-3 text-xs text-navy-400">
        Indicative pricing. International clients can pay via card at checkout.
      </p>
    </div>
  )
}
