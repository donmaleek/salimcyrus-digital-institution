const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')

const paypalLib = read('src/lib/api/paypal.ts')
const bookCheckout = read('src/app/api/books/checkout-paypal/route.ts')
const bookVerify = read('src/app/api/books/verify-paypal/route.ts')
const donate = read('src/app/api/payments/paypal-donate/route.ts')
const captureDonation = read('src/app/api/payments/paypal-capture-donation/route.ts')
const donations = read('src/services/payments/donations.ts')
const bookPurchases = read('src/services/payments/book-purchases.ts')
const schema = read('prisma/schema.prisma')
const books = read('src/lib/data/books.ts')
const donationOptions = read('src/components/payments/DonationPaymentOptions/index.tsx')

const checks = [
  [
    'PayPal integration targets the live API, matching the confirmed-live credentials (not sandbox)',
    paypalLib.includes('https://api-m.paypal.com') && !paypalLib.includes('sandbox.paypal.com'),
  ],
  [
    'every book has a static USD price, since PayPal cannot charge in KES',
    books.includes('priceUsd: number') && !books.includes('priceKes / 129.4)'),
  ],
  [
    'book purchase table distinguishes provider and currency (no mixing KES and USD under one summed field)',
    schema.includes('provider          String             @default("paystack")') &&
      schema.includes('currency          String             @default("KES")') &&
      schema.includes('@@unique([provider, externalReference])'),
  ],
  [
    'PayPal book checkout requires an account, same as Paystack (no bypass via a second provider)',
    bookCheckout.includes('getServerSession(authOptions)') && bookCheckout.includes('status: 401'),
  ],
  [
    'PayPal book capture verifies the reference_id matches this exact session and book (tamper guard)',
    bookVerify.includes('captured.referenceId !== `book:${slug}:${userId}`') &&
      bookVerify.includes('status: 403'),
  ],
  [
    'PayPal book capture uses the session identity for the purchase record, never PayPal payer info',
    bookVerify.includes('email: session.user.email') && !bookVerify.includes('captured.payerEmail'),
  ],
  [
    'book purchase amounts are tagged with their real currency, not left to default silently',
    bookPurchases.includes('currency,') && bookPurchases.includes("currency: 'KES' | 'USD'"),
  ],
  [
    'donations are not account-gated (PayPal payer identity is the trust boundary there, unlike books)',
    !captureDonation.includes('getServerSession') && donations.includes('email,\n  name,'),
  ],
  [
    'donation recording is idempotent and stamps currency on both CrmTransaction and CrmDonation',
    donations.includes('if (existingBooking || existingTransaction) return { isNew: false }') &&
      (donations.match(/currency,/g) || []).length >= 2,
  ],
  [
    'the old static "send money to this PayPal email" instruction is gone in favor of a real checkout',
    !donationOptions.includes('PAYPAL_EMAIL') && donationOptions.includes('/api/payments/paypal-donate'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
