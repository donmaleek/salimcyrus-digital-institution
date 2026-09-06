const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')

const schema = read('prisma/schema.prisma')
const submitRoute = read('src/app/api/books/[slug]/reviews/route.ts')
const moderationRoute = read('src/app/api/admin/books/reviews/[id]/route.ts')
const detail = read('src/app/(site)/books/[slug]/page.tsx')
const listing = read('src/app/(site)/books/page.tsx')
const reviewsSection = read('src/components/books/BookReviewsSection/index.tsx')
const starRating = read('src/components/books/StarRating/index.tsx')
const adminPage = read('src/app/(dashboard)/dashboard/admin/crm/books/page.tsx')

const checks = [
  [
    'a review can only be created against a real purchase (structurally, not just by convention)',
    schema.includes('purchaseId   String       @unique') &&
      submitRoute.includes('db.bookPurchase.findFirst') &&
      submitRoute.includes("status: 403"),
  ],
  [
    'one review per purchase is enforced before insert, not just by the unique constraint failing loudly',
    submitRoute.includes('purchase.review') && submitRoute.includes('409'),
  ],
  [
    'new reviews start pending and are excluded from the public rating until approved',
    schema.includes('@default("pending")') &&
      detail.includes("status: 'approved'") &&
      listing.includes("status: 'approved'"),
  ],
  [
    'moderation requires admin auth, not just being logged in',
    moderationRoute.includes("requireCrmApi('content:write')") &&
      moderationRoute.includes('403'),
  ],
  [
    'star rating never renders for an unrated book (no fake "0 stars" placeholder)',
    starRating.includes('if (count === 0) return null'),
  ],
  [
    'reviews section shows an honest empty state, not fabricated stars, when nothing is approved yet',
    reviewsSection.includes('No reviews yet') && reviewsSection.includes('Be the first to review'),
  ],
  [
    'detail page exposes an aggregateRating in structured data only when real reviews exist',
    detail.includes('summary.count > 0') && detail.includes('AggregateRating'),
  ],
  [
    'admin can moderate reviews from the same page that manages the book catalog',
    adminPage.includes('BookReviewModerationManager') && adminPage.includes("status: 'pending'"),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
