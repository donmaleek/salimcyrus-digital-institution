const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')

const offersFile = read('src/lib/data/coaching-offers.ts')
const picker = read('src/components/payments/CoachingCategoryPicker/index.tsx')
const quoteForm = read('src/components/forms/CoachingQuoteRequestForm/index.tsx')
const quoteRoute = read('src/app/api/coaching/request-quote/route.ts')
const bookNowPage = read('src/app/(site)/book-now/page.tsx')
const alignmentDetail = read('src/app/(site)/work-with-salim/coaching/[slug]/page.tsx')
const bookingConfirmForm = read('src/components/forms/BookingConfirmForm/index.tsx')

// Parsing the data file's TS at runtime is fragile; instead pull the
// specific facts this eval needs (category coverage, pricing) via a light
// regex scan over the source text.
const categorySlugs = [...offersFile.matchAll(/category:\s*'([a-z-]+)'/g)].map((m) => m[1])

const surface = [offersFile, picker, quoteForm, quoteRoute, bookNowPage].join('\n')
const offerBlock = (name) => {
  const starts = [
    offersFile.indexOf(`name: '${name}'`),
    offersFile.indexOf(`name: "${name}"`),
  ].filter((index) => index >= 0)
  const start = starts.length ? Math.min(...starts) : -1
  if (start === -1) return ''
  const end = offersFile.indexOf('\n  },', start)
  return offersFile.slice(start, end)
}
const detailDeepLinksToIdentityOffer = () =>
  alignmentDetail.includes(
    '/book-now?offer=Identity%20%26%20Life%20Alignment%20Session#choose-session'
  ) &&
  picker.includes("new URLSearchParams(window.location.search).get(") &&
  picker.includes('setCategory(requestedOffer.category)') &&
  picker.includes('setSelectedOffer(requestedOffer.name)')

const checks = [
  [
    'all six booking categories are represented: Standard, Identity & Life Alignment, Individual, Couples, Group, VIP Summit',
    ['standard', 'identity-alignment', 'individual', 'couples', 'group', 'vip-summit'].every((slug) =>
      offersFile.includes(`slug: '${slug}'`)
    ),
  ],
  [
    'Individual coaching has the three requested location tiers, priced exactly as specified',
    offerBlock("Individual Coaching, At Salim's Location").includes('priceKes: 10000') &&
      offerBlock('Individual Coaching, Your Location (Mombasa)').includes('priceKes: 15000') &&
      offerBlock('Individual Coaching, Your Location (Kenya, Outside Mombasa)').includes('priceKes: 35000'),
  ],
  [
    'Couples coaching has the three requested location tiers, priced exactly as specified',
    offerBlock("Couples Coaching, At Salim's Location").includes('priceKes: 20000') &&
      offerBlock('Couples Coaching, Your Location (Mombasa)').includes('priceKes: 25000') &&
      offerBlock('Couples Coaching, Your Location (Kenya, Outside Mombasa)').includes('priceKes: 35000'),
  ],
  [
    'Group coaching has the 50-200 people tier priced exactly as specified',
    offerBlock('Group Coaching, 50 to 200 People').includes('priceKes: 150000'),
  ],
  [
    'international individual/couples, 200-1,000 person groups, and VIP Summit speaking are request-only, never given a fabricated price',
    offersFile.includes('coachingRequestTiers') &&
      offersFile.includes("category: 'individual'") &&
      offersFile.includes("category: 'couples'") &&
      offersFile.includes("category: 'group'") &&
      offersFile.includes("category: 'vip-summit'"),
  ],
  [
    'every priced offer and every request-only tier declares a category, and every category is one of the six published ones (11 priced + 4 request-only)',
    categorySlugs.length === 15 &&
      categorySlugs.every((slug) => ['standard', 'identity-alignment', 'individual', 'couples', 'group', 'vip-summit'].includes(slug)),
  ],
  [
    'Identity & Life Alignment has its own booking category and is priced at exactly KES 18,000',
    offersFile.includes("slug: 'identity-alignment'") &&
      offerBlock('Identity & Life Alignment Session').includes("category: 'identity-alignment'") &&
      offerBlock('Identity & Life Alignment Session').includes('priceKes: 18000') &&
      detailDeepLinksToIdentityOffer(),
  ],
  [
    'the Book Now page presents tabs to switch between the six formats, not six separate flat sections',
    bookNowPage.includes('CoachingCategoryPicker') &&
      picker.includes('role="tablist"') &&
      picker.includes('coachingCategories.map'),
  ],
  [
    'a request-only tier never gets a checkout form: quote requests and paid checkout are mutually exclusive per tier',
    picker.includes('pricedTiers.map') &&
      picker.includes('requestTiers.map') &&
      !/requestTiers\.map[\s\S]{0,400}CoachingCheckoutForm/.test(picker),
  ],
  [
    'the quote-request form receives its category and tier as fixed props from the picker, not as a free-text field the visitor could get wrong',
    !quoteForm.includes('<select') &&
      picker.includes('category={tier.category}') &&
      picker.includes('tierLabel={tier.label}'),
  ],
  [
    'the quote-request route never fabricates a price or writes a purchase; it only ever creates a CRM lead for a human to follow up',
    quoteRoute.includes('crmContact') &&
      quoteRoute.includes('crmActivity') &&
      quoteRoute.includes('crmTask') &&
      !quoteRoute.includes('recordCoachingPayment') &&
      !quoteRoute.includes('priceKes'),
  ],
  [
    'quote-request leads are always treated as high priority, since every tier that reaches this route is a large or time-sensitive booking',
    quoteRoute.includes("priority: 'high'"),
  ],
  [
    "the buyer's own confirm-a-booking dropdown groups offers by category (optgroup), not one flat list of ten names",
    bookingConfirmForm.includes('<optgroup') && bookingConfirmForm.includes('coachingCategories.map'),
  ],
  [
    'no two priced offers in the same category share a name (still fine for cross-category collisions, e.g. the intentional 35,000 tie between Individual and Couples outside-Mombasa)',
    (() => {
      const names = [...offersFile.matchAll(/name:\s*'([^']+)'/g)].map((m) => m[1])
      return new Set(names).size === names.length
    })(),
  ],
  [
    'the whole coaching catalog surface contains no em dash characters',
    !surface.includes('—'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
