import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils/currency'

const plans = [
  {
    name: 'Basic',
    price: 500,
    features: [
      'Weekly teaching',
      'Exclusive articles',
      'Private community',
      'Monthly Q&A',
    ],
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
    <div className="grid gap-6 lg:grid-cols-3">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={`flex flex-col border p-7 sm:p-8 ${
            plan.featured
              ? 'border-gold-600 bg-white'
              : 'border-navy-200 bg-white'
          }`}
        >
          <h3 className="font-heading text-3xl text-navy">{plan.name}</h3>
          <p className="mt-5 text-3xl font-semibold text-navy">
            {formatCurrency(plan.price)}
            <span className="mt-2 block text-sm font-normal text-navy-600">per month</span>
          </p>
          <ul className="mt-7 flex-1 space-y-4 border-t border-navy-200 pt-6">
            {plan.features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 text-base leading-7 text-navy-600"
              >
                <span
                  className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                  aria-hidden
                />
                {feature}
              </li>
            ))}
          </ul>
          <Button
            href="/contact"
            className="mt-6"
            variant={plan.featured ? 'primary' : 'outline'}
          >
            Enquire About {plan.name}
          </Button>
        </div>
      ))}
    </div>
  )
}
