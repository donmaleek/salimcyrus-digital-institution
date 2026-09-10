const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')
const page = read('src/app/(site)/book-now/page.tsx')
const header = read('src/components/layout/Header/index.tsx')
const mobile = read('src/components/layout/Header/MobileNav.tsx')
const offers = read('src/lib/data/coaching-offers.ts')
const picker = read('src/components/payments/CoachingCategoryPicker/index.tsx')
const sitemap = read('src/app/sitemap.ts')
const experience = [page, header, mobile, offers, picker].join('\n')

const checks = [
  [
    'Book Now experience contains no em dash characters',
    !experience.includes('—'),
  ],
  [
    'desktop header provides the booking action',
    header.includes('Book Session Now') &&
      header.includes('href="/book-now"') &&
      !header.includes('>\n            Book\n'),
  ],
  [
    'mobile navigation provides the booking action',
    mobile.includes('Book Session Now') && mobile.includes('href="/book-now"'),
  ],
  [
    'Book Now page renders the coaching category picker, and every priced offer across all formats has a real KES price',
    page.includes('CoachingCategoryPicker') &&
      picker.includes('coachingOffers.filter') &&
      (offers.match(/priceKes: \d+/g) || []).length === 10,
  ],
  [
    'page explains the four-stage booking process',
    ['Choose', 'Reserve', 'Confirm', 'Prepare'].every((step) =>
      page.includes(`'${step}',`)
    ),
  ],
  [
    'offer rows explain fit and outcome where the decision is made',
    picker.includes('This session helps you') &&
      picker.includes('You leave with:'),
  ],
  [
    'page states real prices up front, not deferred to an external checkout page',
    picker.includes('formatCurrency(offer.priceKes)'),
  ],
  [
    'payment details stay hidden until a visitor selects one offer',
    picker.includes('selectedOffer') &&
      picker.includes('aria-expanded={isSelected}') &&
      picker.includes('isSelected && ('),
  ],
  [
    'coaching formats use accessible tabs instead of a dense select menu',
    picker.includes('role="tablist"') &&
      picker.includes('role="tab"') &&
      picker.includes('aria-selected={isActive}'),
  ],
  [
    'Paystack is no longer offered as a payment method on Book Now, and priced tiers use the real checkout form',
    !page.includes('offer.paystackUrl') &&
      !picker.includes('offer.paystackUrl') &&
      picker.includes('CoachingCheckoutForm'),
  ],
  [
    'request-only tiers (outside Kenya, large groups, VIP Summit) route to the quote-request form, never a fake checkout',
    picker.includes('CoachingQuoteRequestForm') &&
      picker.includes('coachingRequestTiers.filter'),
  ],
  [
    'page provides coaching scope boundaries',
    page.includes('not emergency support') && page.includes('therapy'),
  ],
  [
    'page provides assistance before purchase',
    page.includes('Ask Before Booking') && page.includes('href="/contact"'),
  ],
  [
    'Book Now route is included in the sitemap',
    sitemap.includes("'/book-now'"),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks)
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
