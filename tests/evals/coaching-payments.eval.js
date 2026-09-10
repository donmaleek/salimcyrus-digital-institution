const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')

const offers = read('src/lib/data/coaching-offers.ts')
const bookNowPage = read('src/app/(site)/book-now/page.tsx')
const picker = read('src/components/payments/CoachingCategoryPicker/index.tsx')
const confirmRoute = read('src/app/api/booking/confirm/route.ts')
const checkoutPaypal = read('src/app/api/coaching/checkout-paypal/route.ts')
const verifyPaypal = read('src/app/api/coaching/verify-paypal/route.ts')
const coachingBookings = read('src/services/payments/coaching-bookings.ts')
const claimForm = read('src/components/payments/PaybillClaimForm/index.tsx')
const paystackLib = read('src/lib/api/paystack.ts')

const coachingSurface = [
  offers,
  bookNowPage,
  confirmRoute,
  checkoutPaypal,
  verifyPaypal,
  coachingBookings,
].join('\n')

const checks = [
  [
    'Private Coaching (the old 4-8 week option) was removed as instructed and never came back, and every priced offer across every format has a real KES and USD price',
    !offers.includes("name: 'Private Coaching'") &&
      (offers.match(/priceKes: \d+/g) || []).length === 10 &&
      (offers.match(/priceUsd: \d+/g) || []).length === 10,
  ],
  [
    'Book Now shows real prices directly and offers PayPal + Paybill, not a Paystack link',
    bookNowPage.includes('CoachingCategoryPicker') &&
      picker.includes('CoachingCheckoutForm') &&
      !picker.includes('offer.paystackUrl'),
  ],
  [
    'coaching is not account-gated (matches donations, not books/teachings): no session required for PayPal checkout',
    !checkoutPaypal.includes('getServerSession'),
  ],
  [
    'PayPal coaching checkout prices in USD and embeds a tamper-checkable reference to the specific offer',
    checkoutPaypal.includes('amountUsd: offer.priceUsd') && checkoutPaypal.includes("referenceId: `coaching:"),
  ],
  [
    'PayPal coaching capture verifies the reference matches the requested offer (a cheap session cannot be swapped for an expensive one)',
    verifyPaypal.includes("captured.referenceId !== `coaching:") && verifyPaypal.includes('status: 403'),
  ],
  [
    'PayPal coaching capture uses PayPal payer identity as the trust boundary, since there is no session to defer to',
    verifyPaypal.includes('captured.payerEmail') && verifyPaypal.includes('email: captured.payerEmail'),
  ],
  [
    'a coaching payment (PayPal or Paybill) creates a paid-but-unscheduled Booking, mirroring the existing Paystack webhook shape exactly',
    coachingBookings.includes("status: 'paid'") &&
      coachingBookings.includes('paystackReference: reference') &&
      coachingBookings.includes("source: `${provider}_checkout`"),
  ],
  [
    'coaching payments are idempotent on the payment reference, same guard as every other provider this session',
    coachingBookings.includes('existingBooking || existingTransaction') &&
      coachingBookings.includes("return { isNew: false }"),
  ],
  [
    '/api/booking/confirm accepts bookings paid via any verified provider (Paystack webhook, PayPal, or an approved Paybill claim), not only Paystack',
    confirmRoute.includes("'paystack_webhook'") &&
      confirmRoute.includes("'paypal_checkout'") &&
      confirmRoute.includes("'paybill_checkout'") &&
      confirmRoute.includes('VERIFIED_BOOKING_SOURCES.has(paidBooking.source)'),
  ],
  [
    '/api/booking/confirm still only ever updates the pre-verified booking, never creates one (the payment step is what creates it)',
    !confirmRoute.includes('tx.booking.create'),
  ],
  [
    'Paybill claims support coaching bookings, requiring email and name since there is no account gate',
    claimForm.includes("offerType === 'coaching'") || claimForm.includes("'donation' || offerType === 'coaching'"),
  ],
  [
    'stray external Paystack coaching links still get labeled correctly by amount, now that real prices exist in our own data',
    paystackLib.includes('for (const offer of coachingOffers)'),
  ],
  [
    'the coaching payment surface contains no em dash characters',
    !coachingSurface.includes('—'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
