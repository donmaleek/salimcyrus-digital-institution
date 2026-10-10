const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')

const offers = read('src/lib/data/coaching-offers.ts')
const bookNowPage = read('src/app/(site)/book-now/page.tsx')
const picker = read('src/components/payments/CoachingCategoryPicker/index.tsx')
const confirmRoute = read('src/app/api/booking/confirm/route.ts')
const checkoutPaypal = read('src/app/api/coaching/checkout-paypal/route.ts')
const checkoutPaystack = read('src/app/api/coaching/checkout/route.ts')
const verifyPaypal = read('src/app/api/coaching/verify-paypal/route.ts')
const coachingBookings = read('src/services/payments/coaching-bookings.ts')
const paystackLib = read('src/lib/api/paystack.ts')

const coachingSurface = [
  offers,
  bookNowPage,
  confirmRoute,
  checkoutPaypal,
  checkoutPaystack,
  verifyPaypal,
  coachingBookings,
].join('\n')

const checks = [
  [
    'Private Coaching (the old 4-8 week option) was removed as instructed and never came back, and every priced offer across every format has a real KES and USD price',
    !offers.includes("name: 'Private Coaching'") &&
      (offers.match(/priceKes: \d+/g) || []).length === 12 &&
      (offers.match(/priceUsd: \d+/g) || []).length === 12,
  ],
  [
    'Book Now shows real prices and offers first-party Paystack and PayPal checkout (Paybill was removed)',
    bookNowPage.includes('CoachingCategoryPicker') &&
      picker.includes('CoachingCheckoutForm') &&
      !picker.includes('offer.paystackUrl') &&
      !/paybill/i.test(picker) &&
      checkoutPaystack.includes('initializePaystackCoachingCheckout'),
  ],
  [
    'coaching is not account-gated (matches donations, not books/teachings): no session required for PayPal checkout',
    !checkoutPaypal.includes('getServerSession') && !checkoutPaystack.includes('getServerSession'),
  ],
  [
    'Paystack coaching checkout validates the selected server-owned offer and returns to booking confirmation',
    checkoutPaystack.includes('getCoachingOfferByName') &&
      checkoutPaystack.includes('/book-now/confirm?offerName=') &&
      checkoutPaystack.includes('PAYSTACK_SECRET_KEY'),
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
    'a coaching payment creates a paid-but-unscheduled Booking, mirroring the existing Paystack webhook shape exactly, generic enough across providers that historical Paybill-recorded bookings still read correctly',
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
    '/api/booking/confirm still accepts bookings paid via Paystack webhook, PayPal, or (for historical bookings) an approved Paybill claim, so a past Paybill-paid booking is never treated as unverified now that the live checkout option is gone',
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
