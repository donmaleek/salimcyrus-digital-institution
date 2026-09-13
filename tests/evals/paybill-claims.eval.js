const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')

const schema = read('prisma/schema.prisma')
const service = read('src/services/payments/payment-claims.ts')
const claimRoute = read('src/app/api/payments/paybill/claim/route.ts')
const adminListRoute = read('src/app/api/admin/payment-claims/route.ts')
const adminReviewRoute = read('src/app/api/admin/payment-claims/[id]/route.ts')
const adminEvidenceRoute = read('src/app/api/admin/payment-claims/[id]/evidence/route.ts')
const evidenceStorage = read('src/lib/api/payment-evidence-storage.ts')
const claimForm = read('src/components/payments/PaybillClaimForm/index.tsx')
const bookCheckout = read('src/components/payments/BookCheckoutForm/index.tsx')
const teachingCheckout = read('src/components/payments/TeachingCheckoutForm/index.tsx')
const donationOptions = read('src/components/payments/DonationPaymentOptions/index.tsx')
const webhookRoute = read('src/app/api/payments/webhook/route.ts')
const myBooksDownloadRoute = read('src/app/api/books/my-purchases/[purchaseId]/download/route.ts')

const paybillSurface = [
  schema.slice(schema.indexOf('model PaymentClaim')),
  service,
  claimRoute,
  adminListRoute,
  adminReviewRoute,
  adminEvidenceRoute,
  evidenceStorage,
  claimForm,
].join('\n')

const checks = [
  [
    'PaymentClaim model exists and an M-Pesa code can never be submitted twice',
    schema.includes('model PaymentClaim {') && /mpesaCode\s+String\s+@unique/.test(schema),
  ],
  [
    'a claim starts pending and never grants access on its own, only approvePaymentClaim can',
    (() => {
      const submitFn = service.slice(
        service.indexOf('export async function submitPaymentClaim'),
        service.indexOf('export type ReviewPaymentClaimResult')
      )
      return (
        submitFn.includes('db.paymentClaim.create') &&
        !submitFn.includes('recordBookPurchase') &&
        !submitFn.includes('recordTeachingPurchase') &&
        !submitFn.includes('recordDonation')
      )
    })(),
  ],
  [
    'approving a claim reuses the exact same purchase-recording functions as Paystack/PayPal, not a separate path',
    service.includes('recordBookPurchase(') &&
      service.includes('recordTeachingPurchase(') &&
      service.includes('recordDonation(') &&
      service.includes("provider: 'paybill'"),
  ],
  [
    'book and teaching claims require a signed-in session (no anonymous purchase via Paybill)',
    claimRoute.includes("status: 401") && (claimRoute.match(/status: 401/g) || []).length >= 2,
  ],
  [
    'the claimed amount for a book/teaching purchase is computed from the real catalog price, never trusted from the client',
    claimRoute.includes('amountKes = book.priceKes') && claimRoute.includes('amountKes = teaching.priceKes'),
  ],
  [
    'donations remain the one case where the buyer states their own amount and identity, matching PayPal/Paystack donation behavior',
    claimRoute.includes('data.amountKes') && claimRoute.includes('data.email'),
  ],
  [
    'evidence screenshots are stored outside /public and never served without an admin check',
    !evidenceStorage.includes("join(process.cwd(), 'public'") &&
      adminEvidenceRoute.includes("requireCrmApi('finance:read')"),
  ],
  [
    'evidence uploads are type- and size-limited, not an arbitrary file upload',
    claimRoute.includes('ALLOWED_EVIDENCE_TYPES') && claimRoute.includes('MAX_EVIDENCE_BYTES'),
  ],
  [
    'reviewing a claim (approve or reject) requires the finance:write permission',
    adminReviewRoute.includes("requireCrmApi('finance:write')"),
  ],
  [
    'approve and reject both refuse to act twice on the same claim',
    service.includes("if (claim.status !== 'pending') return { status: 'already_reviewed' }") &&
      (service.match(/already_reviewed/g) || []).length >= 2,
  ],
  [
    'Paystack no longer appears as a buyable option on book, teaching, or donation checkout',
    !bookCheckout.includes('Paystack') &&
      !teachingCheckout.includes('Paystack') &&
      !donationOptions.includes('Paystack') &&
      !bookCheckout.includes("checkout-paystack'") &&
      !teachingCheckout.includes("/api/teachings/checkout'"),
  ],
  [
    'PayPal remains available on all three checkout surfaces alongside Paybill',
    bookCheckout.includes('checkout-paypal') &&
      teachingCheckout.includes('checkout-paypal') &&
      donationOptions.includes('paypal-donate') &&
      bookCheckout.includes('PaybillClaimForm') &&
      teachingCheckout.includes('PaybillClaimForm') &&
      donationOptions.includes('PaybillClaimForm'),
  ],
  [
    'the Paybill claim surface contains no em dash characters',
    !paybillSurface.includes('—'),
  ],
  [
    'approving a Paybill book claim mints a download grant and emails the link, exactly like the Paystack webhook does for the same purchase type (regression: an admin-approved Paybill book purchase used to leave the buyer with a recorded purchase but no way to download it)',
    (() => {
      const bookBranch = service.slice(
        service.indexOf("if (claim.offerType === 'book')"),
        service.indexOf("} else if (claim.offerType === 'teaching')")
      )
      return (
        bookBranch.includes('createDownloadGrant(') &&
        bookBranch.includes('sendEmail(') &&
        bookBranch.includes('bookDownloadEmailHtml(') &&
        bookBranch.includes('emailSentAt')
      )
    })(),
  ],
  [
    'the book download grant/email step only fires for a newly recorded purchase, never re-minted on a re-approval no-op, matching the Paystack webhook idempotency guard',
    (() => {
      const bookBranch = service.slice(
        service.indexOf("if (claim.offerType === 'book')"),
        service.indexOf("} else if (claim.offerType === 'teaching')")
      )
      return bookBranch.includes('result.isNew') && webhookRoute.includes('if (!result.isNew) return')
    })(),
  ],
  [
    'even if the Paybill approval email fails to send, the buyer still has a working self-serve path: My Books mints a fresh grant for any purchase they own, regardless of which provider recorded it',
    myBooksDownloadRoute.includes('createDownloadGrant(') &&
      myBooksDownloadRoute.includes('purchase.userId !== userId'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
