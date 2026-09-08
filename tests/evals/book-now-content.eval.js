const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')
const page = read('src/app/(site)/book-now/page.tsx')
const header = read('src/components/layout/Header/index.tsx')
const mobile = read('src/components/layout/Header/MobileNav.tsx')
const offers = read('src/lib/data/coaching-offers.ts')
const sitemap = read('src/app/sitemap.ts')
const experience = [page, header, mobile, offers].join('\n')

const checks = [
  [
    'Book Now experience contains no em dash characters',
    !experience.includes('—'),
  ],
  [
    'desktop header is renamed to Book Now',
    header.includes('Book Now') &&
      header.includes('href="/book-now"') &&
      !header.includes('>\n            Book\n'),
  ],
  [
    'mobile navigation provides the Book Now action',
    mobile.includes('Book Now') && mobile.includes('href="/book-now"'),
  ],
  [
    'Book Now page renders all three real-priced coaching offers, each with a real KES price',
    page.includes('coachingOffers.map') &&
      (offers.match(/priceKes: \d+/g) || []).length === 3,
  ],
  [
    'page explains the four-stage booking process',
    ['Choose', 'Reserve', 'Confirm', 'Prepare'].every((step) =>
      page.includes(`'${step}',`)
    ),
  ],
  [
    'page provides a fit guide matching the three real offers',
    (page.match(/recommendation:/g) || []).length === 3,
  ],
  [
    'page states real prices up front, not deferred to an external checkout page',
    page.includes('formatCurrency(offer.priceKes)') && page.includes('Prices are shown below'),
  ],
  [
    'Paystack is no longer offered as a payment method on Book Now',
    !page.includes('offer.paystackUrl') && page.includes('CoachingCheckoutForm'),
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
