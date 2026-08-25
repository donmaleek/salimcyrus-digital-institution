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
    'Book Now page renders all four verified coaching offers',
    page.includes('coachingOffers.map') &&
      (offers.match(/https:\/\/paystack\.com/g) || []).length === 4,
  ],
  [
    'page explains the four-stage booking process',
    ['Choose', 'Reserve', 'Confirm', 'Prepare'].every((step) =>
      page.includes(`'${step}',`)
    ),
  ],
  [
    'page provides a four-option fit guide',
    (page.match(/recommendation:/g) || []).length === 4,
  ],
  [
    'page states that live pricing appears before purchase',
    page.includes('Current pricing and payment details appear') &&
      page.includes('Review the current price'),
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
