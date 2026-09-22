const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')

const surfaces = {
  books: read('src/components/payments/BookCheckoutForm/index.tsx'),
  teachings: read('src/components/payments/TeachingCheckoutForm/index.tsx'),
  courses: read('src/components/payments/CourseCheckoutForm/index.tsx'),
  coaching: read('src/components/payments/CoachingCheckoutForm/index.tsx'),
  donations: read('src/components/payments/DonationPaymentOptions/index.tsx'),
  journal: read('src/components/payments/JournalSubscribeForm/index.tsx'),
}

const routes = {
  books: read('src/app/api/books/checkout/route.ts'),
  teachings: read('src/app/api/teachings/checkout/route.ts'),
  courses: read('src/app/api/courses/checkout/route.ts'),
  coaching: read('src/app/api/coaching/checkout/route.ts'),
  donations: read('src/app/api/payments/initiate/route.ts'),
  journal: read('src/app/api/journal/checkout/route.ts'),
}

const checks = [
  [
    'every purchasable product surface offers Paystack',
    Object.values(surfaces).every((source) => source.includes('Paystack')),
  ],
  [
    'every Paystack button calls a first-party server endpoint',
    surfaces.books.includes("fetch('/api/books/checkout'") &&
      surfaces.teachings.includes("fetch('/api/teachings/checkout'") &&
      surfaces.courses.includes("'/api/courses/checkout'") &&
      surfaces.coaching.includes("fetch('/api/coaching/checkout'") &&
      surfaces.donations.includes("fetch('/api/payments/initiate'") &&
      surfaces.journal.includes("fetch('/api/journal/checkout'"),
  ],
  [
    'every Paystack route fails closed without the server secret',
    Object.values(routes).every(
      (source) => source.includes('PAYSTACK_SECRET_KEY') && source.includes('503')
    ),
  ],
  [
    'all checkout routes derive prices from server-owned data',
    routes.books.includes('book.priceKes') &&
      routes.teachings.includes('teaching.priceKes') &&
      routes.courses.includes('course.priceKes') &&
      routes.coaching.includes('coachingOffers.find') &&
      read('src/services/payments/paystack.ts').includes('JOURNAL_SUBSCRIPTION_PRICE_KES * 100'),
  ],
  [
    'Paystack callbacks return buyers to product-specific verification or booking confirmation',
    routes.books.includes('/books/${book.slug}') &&
      routes.teachings.includes('/teachings/${teaching.slug}') &&
      routes.courses.includes("course.kind === 'masterclass'") &&
      routes.coaching.includes('/book-now/confirm?offerName=') &&
      routes.journal.includes("new URL('/journal'"),
  ],
  [
    'Paystack Journal and coaching returns verify server-to-server before fulfillment',
    read('src/app/api/journal/verify/route.ts').includes('verifyPaystackTransaction') &&
      read('src/app/api/coaching/verify/route.ts').includes('verifyPaystackTransaction') &&
      read('src/components/payments/JournalSubscriptionReturn/index.tsx').includes('/api/journal/verify?reference=') &&
      read('src/components/payments/CoachingPurchaseReturn/index.tsx').includes('/api/coaching/verify?reference='),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
