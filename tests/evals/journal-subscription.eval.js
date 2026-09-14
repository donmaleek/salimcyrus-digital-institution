const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')

const schema = read('prisma/schema.prisma')
const service = read('src/services/payments/journal-subscriptions.ts')
const claims = read('src/services/payments/payment-claims.ts')
const claimRoute = read('src/app/api/payments/paybill/claim/route.ts')
const checkoutPaypal = read('src/app/api/journal/checkout-paypal/route.ts')
const verifyPaypal = read('src/app/api/journal/verify-paypal/route.ts')
const entryPage = read('src/app/(site)/journal/[slug]/page.tsx')
const indexPage = read('src/app/(site)/journal/page.tsx')
const subscribeForm = read('src/components/payments/JournalSubscribeForm/index.tsx')
const paybillForm = read('src/components/payments/PaybillClaimForm/index.tsx')
const adminClaimsPage = read('src/app/(dashboard)/dashboard/admin/payment-claims/page.tsx')
const myJournalPage = read('src/app/(dashboard)/dashboard/my-journal/page.tsx')
const dashboardLayout = read('src/components/dashboard/DashboardLayout/index.tsx')

const surface = [service, claims, claimRoute, checkoutPaypal, verifyPaypal, entryPage, indexPage, subscribeForm, myJournalPage].join('\n')

const checks = [
  [
    'JournalSubscription is append-only per payment (idempotent on [provider, externalReference]), not a single mutable row keyed by user',
    /model JournalSubscription \{[\s\S]*?@@unique\(\[provider, externalReference\]\)/.test(schema) &&
      !/model JournalSubscription \{[\s\S]*?@@unique\(\[userId\]\)/.test(schema),
  ],
  [
    'access is computed as "any row still in the future", not a boolean flag that a lapsed subscription would leave stuck on',
    service.includes('expiresAt: { gt: new Date() }') && service.includes('getActiveJournalSubscription'),
  ],
  [
    'renewing an active subscription stacks the new 30 days onto the existing expiry rather than resetting from today, so an admin taking time to approve a Paybill claim never costs the subscriber paid-for time',
    service.includes('active.expiresAt.getTime() > Date.now() ? active.expiresAt : new Date()'),
  ],
  [
    'the fixed price (500 KES / $4, the same ~129.4 KES/USD rate used for books and courses) is defined once and reused everywhere, never hand-typed in a second place',
    service.includes('JOURNAL_SUBSCRIPTION_PRICE_KES = 500') &&
      service.includes('JOURNAL_SUBSCRIPTION_PRICE_USD = 4') &&
      claimRoute.includes('JOURNAL_SUBSCRIPTION_PRICE_KES') &&
      checkoutPaypal.includes('JOURNAL_SUBSCRIPTION_PRICE_USD'),
  ],
  [
    'approving a journal Paybill claim reuses recordJournalSubscription, the same idempotent path PayPal verification uses, not a separate one-off implementation',
    claims.includes("claim.offerType === 'journal'") &&
      claims.includes('recordJournalSubscription(') &&
      verifyPaypal.includes('recordJournalSubscription('),
  ],
  [
    'a journal claim always requires a signed-in account (a subscription with nowhere to attach is meaningless), unlike donations',
    /if \(!claim\.userId\) return \{ status: 'offer_missing' \}\s*\n\s*await recordJournalSubscription/.test(claims) &&
      claimRoute.includes("Sign in to subscribe to the Journal"),
  ],
  [
    'the PayPal verify route rejects a captured amount or reference that does not match this account and this subscription price (tamper guard, matching the book/teaching/course pattern)',
    verifyPaypal.includes('journal:${userId}') &&
      verifyPaypal.includes('JOURNAL_SUBSCRIPTION_PRICE_USD * 100'),
  ],
  [
    'PayPal and Paybill are both offered for the subscription, matching every other paid surface on the site',
    subscribeForm.includes('/api/journal/checkout-paypal') && subscribeForm.includes("PaybillClaimForm"),
  ],
  [
    'the Paybill claim form accepts journal as a real offer type, not silently falling through to donation handling',
    paybillForm.includes("'journal'"),
  ],
  [
    'the admin payment-claims queue labels a journal claim distinctly, not lumped into the "Support the Mission" donation fallback (the same mislabeling bug fixed for coaching claims earlier)',
    adminClaimsPage.includes("claim.offerType === 'journal'") &&
      adminClaimsPage.includes('Journal Subscription'),
  ],
  [
    'the essay page always shows at least the opening paragraph to everyone (SEO/conversion teaser), and only the remainder is paywalled',
    entryPage.includes('paragraphs.slice(0, 1)') && entryPage.includes('subscribed ? paragraphs'),
  ],
  [
    'a subscribed reader sees no paywall panel at all (lockedParagraphCount is 0 once subscribed)',
    entryPage.includes('lockedParagraphCount > 0') &&
      entryPage.includes('paragraphs.length - visibleParagraphs.length'),
  ],
  [
    'a signed-out reader hitting the paywall is offered sign-in/register with a callbackUrl back to the exact essay, not dropped at a generic login page',
    entryPage.includes('/login?callbackUrl=') &&
      entryPage.includes('/register?callbackUrl=') &&
      entryPage.includes('encodeURIComponent(`/journal/${entry.slug}`)'),
  ],
  [
    'gating reads live access from the database per request (force-dynamic), never a value baked in at build time',
    entryPage.includes("export const dynamic = 'force-dynamic'") &&
      entryPage.includes('hasActiveJournalSubscription('),
  ],
  [
    'the Journal index page stays fully public (titles and summaries), the paywall never blocks discovery, only the full essay body',
    indexPage.includes('db.journalEntry.findMany') && !indexPage.includes('hasActiveJournalSubscription'),
  ],
  [
    'members have a dedicated status page showing their renewal date and a working renew action',
    myJournalPage.includes('getActiveJournalSubscription(') &&
      myJournalPage.includes('JournalSubscribeForm') &&
      dashboardLayout.includes('/dashboard/my-journal'),
  ],
  [
    'the whole Journal subscription surface contains no em dash characters',
    !surface.includes('—'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
