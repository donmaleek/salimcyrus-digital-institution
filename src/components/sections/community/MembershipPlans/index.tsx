import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils/currency'

const plans = [
  {
    name: 'Basic',
    price: 500,
    features: ['Weekly teaching', 'Exclusive articles', 'Private community', 'Monthly Q&A'],
  },
  {
    name: 'Inner Circle',
    price: 1500,
    featured: true,
    features: [
      'Everything in Basic',
      'Weekly live mentorship',
      'Relationship teachings',
      'Kingdom classes',
      'Members-only videos',
      'Downloadable resources',
    ],
  },
  {
    name: 'Elite',
    price: 5000,
    features: [
      'Everything in Inner Circle',
      'Group coaching',
      'Priority questions',
      'Monthly deep-dive session',
      'Exclusive leadership/purpose sessions',
    ],
  },
]

export function MembershipPlans() {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={`flex flex-col rounded-2xl border p-6 ${
            plan.featured ? 'border-gold bg-gold-50' : 'border-navy-100 bg-white'
          }`}
        >
          <h3 className="font-heading text-lg font-semibold text-navy">{plan.name}</h3>
          <p className="mt-2 text-2xl font-bold text-navy">
            {formatCurrency(plan.price)}
            <span className="text-sm font-normal text-navy-400">/month</span>
          </p>
          <ul className="mt-4 flex-1 space-y-2">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-navy-600">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
                {feature}
              </li>
            ))}
          </ul>
          <Button href="/contact" className="mt-6" variant={plan.featured ? 'primary' : 'outline'}>
            Join {plan.name}
          </Button>
        </div>
      ))}
    </div>
  )
}
