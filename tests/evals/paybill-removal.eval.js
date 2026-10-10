const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')
const exists = (relative) => fs.existsSync(path.join(root, relative))

const schema = read('prisma/schema.prisma')
const service = read('src/services/payments/payment-claims.ts')
const adminListRoute = read('src/app/api/admin/payment-claims/route.ts')
const adminReviewRoute = read('src/app/api/admin/payment-claims/[id]/route.ts')
const adminEvidenceRoute = read('src/app/api/admin/payment-claims/[id]/evidence/route.ts')
const evidenceStorage = read('src/lib/api/payment-evidence-storage.ts')
const webhookRoute = read('src/app/api/payments/webhook/route.ts')
const myBooksDownloadRoute = read('src/app/api/books/my-purchases/[purchaseId]/download/route.ts')
const adminClaimsPage = read('src/app/(dashboard)/dashboard/admin/payment-claims/page.tsx')

const bookCheckout = read('src/components/payments/BookCheckoutForm/index.tsx')
const teachingCheckout = read('src/components/payments/TeachingCheckoutForm/index.tsx')
const courseCheckout = read('src/components/payments/CourseCheckoutForm/index.tsx')
const coachingCheckout = read('src/components/payments/CoachingCheckoutForm/index.tsx')
const journalSubscribe = read('src/components/payments/JournalSubscribeForm/index.tsx')
const membershipSubscribe = read('src/components/payments/ParentMembershipSubscribeForm/index.tsx')
const donationOptions = read('src/components/payments/DonationPaymentOptions/index.tsx')
const coachingPicker = read('src/components/payments/CoachingCategoryPicker/index.tsx')
const coachingOffersDataFile = read('src/lib/data/coaching-offers.ts')
const constants = read('src/lib/utils/constants.ts')

const checkoutSurface = [bookCheckout, teachingCheckout, courseCheckout, coachingCheckout, journalSubscribe, membershipSubscribe, donationOptions, coachingPicker].join('\n')

const checks = [
  // --- Submission flow fully removed -------------------------------------
  [
    'the Paybill claim submission route is gone, not just hidden behind a guard that leaves dead code reachable by direct POST',
    !exists('src/app/api/payments/paybill/claim/route.ts') && !exists('src/app/api/payments/paybill/claim/route.test.ts'),
  ],
  [
    'the PaybillClaimForm component is gone, not left as orphaned unreachable code',
    !exists('src/components/payments/PaybillClaimForm/index.tsx'),
  ],
  [
    'submitPaymentClaim (the claim-creation function) is gone from the service; approvePaymentClaim/rejectPaymentClaim (needed to process claims submitted before the removal) are untouched',
    !service.includes('export async function submitPaymentClaim') &&
      service.includes('export async function approvePaymentClaim') &&
      service.includes('export async function rejectPaymentClaim'),
  ],
  [
    'no checkout surface (book, teaching, course, coaching, journal, Parent Membership, donations, the coaching category picker) renders or imports PaybillClaimForm, or links to the removed claim route',
    !checkoutSurface.includes('PaybillClaimForm') && !checkoutSurface.includes('/api/payments/paybill/claim'),
  ],
  [
    'donations now offer exactly two checkout methods (Paystack, PayPal) in a two-column layout, not a leftover three-column grid with an empty gap',
    donationOptions.includes('lg:grid-cols-2') && !donationOptions.includes('lg:grid-cols-3') && !donationOptions.includes('mpesa-paybill.webp'),
  ],
  [
    'the M-Pesa Paybill/account number constants are gone, since nothing renders them anymore',
    !constants.includes('MPESA_PAYBILL_NUMBER') && !constants.includes('MPESA_ACCOUNT_NUMBER'),
  ],
  [
    'no live marketing copy still presents Paybill as a way to pay today (book-now, books, teachings, FAQ, support-the-mission)',
    (() => {
      const copy = [
        read('src/app/(site)/book-now/page.tsx'),
        read('src/app/(site)/book-now/confirm/page.tsx'),
        read('src/app/(site)/books/page.tsx'),
        read('src/app/(site)/books/[slug]/page.tsx'),
        read('src/app/(site)/teachings/[slug]/page.tsx'),
        read('src/app/(site)/(legal)/faq/page.tsx'),
        read('src/app/(site)/support-the-mission/page.tsx'),
      ].join('\n')
      return !/paybill/i.test(copy)
    })(),
  ],

  // --- Historical/admin machinery stays fully intact ----------------------
  [
    'the PaymentClaim model and its approve/reject review machinery are untouched: already-submitted claims can still be reviewed and resolved',
    schema.includes('model PaymentClaim {') &&
      /mpesaCode\s+String\s+@unique/.test(schema) &&
      adminReviewRoute.includes("requireCrmApi('finance:write')") &&
      service.includes("if (claim.status !== 'pending') return { status: 'already_reviewed' }"),
  ],
  [
    'approving a legacy claim still reuses the exact same purchase-recording functions as Paystack/PayPal, not a separate path, so historical Paybill purchases behave identically to any other provider once approved',
    service.includes('recordBookPurchase(') &&
      service.includes('recordTeachingPurchase(') &&
      service.includes('recordDonation(') &&
      service.includes("provider: 'paybill'"),
  ],
  [
    'approving a legacy Paybill book claim still mints a download grant and emails the link exactly like the Paystack webhook does, and only on a newly recorded purchase, never re-minted on a re-approval no-op (the exact regression this session fixed earlier)',
    (() => {
      const bookBranch = service.slice(
        service.indexOf("if (claim.offerType === 'book')"),
        service.indexOf("} else if (claim.offerType === 'teaching')")
      )
      return (
        bookBranch.includes('createDownloadGrant(') &&
        bookBranch.includes('sendEmail(') &&
        bookBranch.includes('result.isNew') &&
        webhookRoute.includes('if (!result.isNew) return')
      )
    })(),
  ],
  [
    'even if a legacy approval email failed to send, the buyer still has a working self-serve path: My Books mints a fresh grant for any purchase they own, regardless of which provider recorded it',
    myBooksDownloadRoute.includes('createDownloadGrant(') && myBooksDownloadRoute.includes('purchase.userId !== userId'),
  ],
  [
    'evidence screenshots from already-submitted claims are still stored outside /public and still never served without an admin finance:read check',
    !evidenceStorage.includes("join(process.cwd(), 'public'") && adminEvidenceRoute.includes("requireCrmApi('finance:read')"),
  ],
  [
    'the admin claims list route still exists and requires finance:read, so a developer re-adding the submission flow later has a working review queue to resume from',
    adminListRoute.includes("requireCrmApi('finance:read')"),
  ],
  [
    'the admin payment-claims page tells the admin new submissions are no longer accepted, so a pending-review workflow is not silently mistaken for a live feature',
    /no longer accept/i.test(adminClaimsPage),
  ],
  [
    'the booking-confirm verified-provider set still recognizes an approved Paybill claim as valid (historical bookings paid this way must not be treated as unverified)',
    read('src/app/api/booking/confirm/route.ts').includes("'paybill_checkout'") &&
      read('src/app/api/booking/confirm/route.ts').includes("'paybill'"),
  ],

  // --- Paystack/PayPal remain the only live options -----------------------
  [
    'Paystack and PayPal remain available on every checkout surface that used to also offer Paybill',
    bookCheckout.includes("'/api/books/checkout'") &&
      bookCheckout.includes('checkout-paypal') &&
      teachingCheckout.includes("'/api/teachings/checkout'") &&
      teachingCheckout.includes('checkout-paypal') &&
      courseCheckout.includes('/api/courses/checkout') &&
      courseCheckout.includes('checkout-paypal') &&
      coachingCheckout.includes('/api/coaching/checkout') &&
      coachingCheckout.includes('checkout-paypal') &&
      journalSubscribe.includes('/api/journal/checkout') &&
      journalSubscribe.includes('checkout-paypal') &&
      membershipSubscribe.includes('/api/parental-guidance/membership/checkout') &&
      membershipSubscribe.includes('checkout-paypal') &&
      donationOptions.includes('/api/payments/initiate') &&
      donationOptions.includes('paypal-donate'),
  ],
  [
    'the coaching category picker no longer advertises three payment methods, only Paystack and PayPal',
    coachingPicker.includes('Choose Paystack or PayPal') && !/paybill/i.test(coachingPicker),
  ],
  [
    'the coaching offers data file itself (prices, categories) is untouched by the payment-method removal: this was a checkout-surface change, not a catalog change',
    coachingOffersDataFile.includes("category: 'parenting-mentorship'") && coachingOffersDataFile.includes('coachingOffers'),
  ],
  [
    'the whole Paybill-removal surface contains no em dash characters',
    !checkoutSurface.includes('—') && !service.includes('—') && !adminClaimsPage.includes('—'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
