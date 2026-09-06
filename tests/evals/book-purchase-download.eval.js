const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')

const schema = read('prisma/schema.prisma')
const webhook = read('src/app/api/payments/webhook/route.ts')
const checkout = read('src/app/api/books/checkout/route.ts')
const download = read('src/app/api/books/download/[token]/route.ts')
const verify = read('src/app/api/books/verify/route.ts')
const purchases = read('src/services/payments/book-purchases.ts')
const tokens = read('src/lib/api/book-download-tokens.ts')
const storage = read('src/lib/api/books-storage.ts')
const gitignore = read('.gitignore')
const booksData = read('src/lib/data/books.ts')

const checks = [
  [
    'book PDFs are never committed to git',
    gitignore.includes('/Books/'),
  ],
  [
    'download tokens are hashed before storage, never stored raw',
    tokens.includes('createHash') &&
      purchases.includes('tokenHash') &&
      !purchases.includes('rawToken,\n') &&
      download.includes('hashDownloadToken(params.token)'),
  ],
  [
    'download route looks up by hash, never by the raw token value',
    download.includes('where: { tokenHash }') && !download.includes('where: { tokenHash: params.token }'),
  ],
  [
    'download grants expire and have a download cap, enforced before serving the file',
    schema.includes('expiresAt') &&
      schema.includes('maxDownloads') &&
      download.includes('checkDownloadGrant') &&
      download.indexOf('checkDownloadGrant(grant)') < download.indexOf('createReadStream('),
  ],
  [
    'a purchase can carry more than one download grant (webhook email + return-page reveal never collide)',
    schema.includes('grants            BookDownloadGrant[]') || schema.includes('BookDownloadGrant[]'),
  ],
  [
    'book checkout embeds a per-book offer_name, not just an amount (amount alone cannot distinguish same-priced books)',
    purchases.includes("`${BOOK_OFFER_PREFIX}${slug}`") &&
      read('src/services/payments/paystack.ts').includes('bookOfferName(slug)'),
  ],
  [
    'checkout refuses books with no confirmed file rather than charging for an undeliverable download',
    checkout.includes('!book.fileName') && checkout.includes('409'),
  ],
  [
    'checkout fails closed (not silently free) when Paystack is unconfigured',
    checkout.includes('PAYSTACK_SECRET_KEY') && checkout.includes('503'),
  ],
  [
    'the return-page verify path re-checks payment status with Paystack directly, not just the query string',
    verify.includes('verifyPaystackTransaction') && verify.includes("data.status !== 'success'"),
  ],
  [
    'verify cross-checks the payment metadata against the requested book slug (prevents reusing a reference from a different purchase)',
    verify.includes('data.metadata?.offer_name !== bookOfferName(slug)') && verify.includes('403'),
  ],
  [
    'purchase recording is idempotent on the Paystack reference (safe if webhook and return-page both fire)',
    purchases.includes('paystackReference: reference') &&
      purchases.includes('if (existing) return') &&
      purchases.includes("isolationLevel: 'Serializable'"),
  ],
  [
    'email delivery failure never blocks or fails the payment recording',
    webhook.includes('emailResult.sent') &&
      webhook.includes('console.warn') &&
      webhook.match(/await handleBookPurchase\([\s\S]*?\)\s*\n\s*return NextResponse\.json\(\{ status: 'ok' \}\)/),
  ],
  [
    'webhook routes book offers to the book handler before falling through to the coaching/donation path',
    webhook.indexOf('slugFromBookOfferName') < webhook.indexOf('matchOfferByAmount(amount)'),
  ],
  [
    'book storage directory is configurable and never served statically from /public',
    storage.includes('BOOKS_STORAGE_DIR') && !storage.includes('public/'),
  ],
  [
    'ambiguous or missing book-to-file mappings are explicitly tracked, not silently guessed',
    fs.existsSync(path.join(root, 'docs/book-file-mapping-todo.md')) &&
      booksData.includes('the-unhealed-traumas-of-our-parents') &&
      !booksData.match(/book\(\s*'the-unhealed-traumas-of-our-parents'[\s\S]*?fileName:/),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
}
if (failures.length) process.exit(1)
