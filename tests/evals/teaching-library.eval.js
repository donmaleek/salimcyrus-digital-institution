const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')

const schema = read('prisma/schema.prisma')
const storage = read('src/lib/api/teachings-storage.ts')
const stream = read('src/app/api/teachings/stream/[teachingId]/route.ts')
const teachingPurchases = read('src/services/payments/teaching-purchases.ts')
const paystackCheckout = read('src/app/api/teachings/checkout/route.ts')
const paystackVerify = read('src/app/api/teachings/verify/route.ts')
const paypalCheckout = read('src/app/api/teachings/checkout-paypal/route.ts')
const paypalVerify = read('src/app/api/teachings/verify-paypal/route.ts')
const adminCollection = read('src/app/api/admin/teachings/route.ts')
const adminSingle = read('src/app/api/admin/teachings/[id]/route.ts')
const paystackLib = read('src/services/payments/paystack.ts')
const webhook = read('src/app/api/payments/webhook/route.ts')

const teachingLibrarySurface = [
  schema.slice(schema.indexOf('model Teaching')),
  storage,
  stream,
  teachingPurchases,
  paystackCheckout,
  paystackVerify,
  paypalCheckout,
  paypalVerify,
  adminCollection,
  adminSingle,
].join('\n')

const checks = [
  [
    'Teaching and TeachingPurchase models exist, with purchases tied to a real account (userId required)',
    schema.includes('model Teaching {') &&
      schema.includes('model TeachingPurchase {') &&
      schema.includes('userId            String\n  user              User     @relation'),
  ],
  [
    'teaching purchases are unique per provider + externalReference, same idempotency shape as books',
    schema.includes('@@unique([provider, externalReference])') &&
      (schema.match(/@@unique\(\[provider, externalReference\]\)/g) || []).length === 2,
  ],
  [
    'video streaming requires a signed-in session (no anonymous access to purchased content)',
    stream.includes('getServerSession(authOptions)') && stream.includes('status: 401'),
  ],
  [
    'video streaming checks for an actual purchase before serving the file (unless the caller is an admin previewing)',
    stream.includes('teachingPurchase.findFirst') || stream.includes('teachingPurchase.findUnique'),
  ],
  [
    'video streaming supports HTTP Range requests (206 partial content) for real seeking, not just full-file download',
    stream.includes('206') && stream.includes('Content-Range') && stream.includes('Accept-Ranges'),
  ],
  [
    'video files are never served from /public (paywalled content stays outside the static asset tree)',
    !storage.includes("join(process.cwd(), 'public'") && storage.includes('TEACHINGS_STORAGE_DIR'),
  ],
  [
    'Paystack teaching checkout requires an account, same as books (no anonymous purchase path)',
    paystackCheckout.includes('getServerSession(authOptions)') && paystackCheckout.includes('status: 401'),
  ],
  [
    'Paystack teaching checkout only allows buying published teachings, not drafts',
    paystackCheckout.includes("status !== 'published'"),
  ],
  [
    'Paystack teaching verify cross-checks the offer name AND the buyer identity (reference-reuse guard)',
    paystackVerify.includes('teachingOfferName(teaching.slug)') &&
      paystackVerify.includes('data.metadata?.user_id !== userId') &&
      paystackVerify.includes('status: 403'),
  ],
  [
    'PayPal teaching checkout prices in USD and embeds a tamper-checkable reference (teaching + account)',
    paypalCheckout.includes('amountUsd: teaching.priceUsd') &&
      paypalCheckout.includes('referenceId: `teaching:${teaching.id}:${userId}`'),
  ],
  [
    'PayPal teaching capture verifies the reference_id matches this exact session and teaching (tamper guard)',
    paypalVerify.includes('captured.referenceId !== `teaching:${teachingId}:${userId}`') &&
      paypalVerify.includes('status: 403'),
  ],
  [
    'PayPal teaching capture uses the session identity for the purchase record, never PayPal payer info',
    paypalVerify.includes('email: session.user.email') && !paypalVerify.includes('captured.payerEmail'),
  ],
  [
    'teaching purchases require a userId (unlike books, there is no pre-account-gate legacy case to support)',
    teachingPurchases.includes('userId: string') && !teachingPurchases.includes('userId?: string'),
  ],
  [
    'teaching purchase currency is explicitly one of KES or USD, never left to silently default',
    teachingPurchases.includes("currency: 'KES' | 'USD'"),
  ],
  [
    'the webhook attributes a teaching purchase to an account via metadata.user_id, never guessing from the payer email',
    webhook.includes('slugFromTeachingOfferName') &&
      webhook.includes('userId: metadata?.user_id') &&
      paystackLib.includes('user_id: userId'),
  ],
  [
    'admin teaching uploads require the content:write permission (not open to any authenticated user)',
    adminCollection.includes("requireCrmApi('content:write')") &&
      adminSingle.includes("requireCrmApi('content:write')"),
  ],
  [
    'admin upload rejects unrecognized video formats and enforces a hard size cap',
    adminCollection.includes('ALLOWED_VIDEO_TYPES') && adminCollection.includes('MAX_VIDEO_BYTES'),
  ],
  [
    'admin upload avoids slug collisions deterministically instead of trusting the title to be unique',
    adminCollection.includes('while (await db.teaching.findUnique({ where: { slug } }))'),
  ],
  [
    'the Teaching Library surface contains no em dash characters',
    !teachingLibrarySurface.includes('—'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
