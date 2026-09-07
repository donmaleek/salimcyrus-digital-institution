const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')

const overview = read('src/app/(dashboard)/dashboard/page.tsx')
const myBooks = read('src/app/(dashboard)/dashboard/my-books/page.tsx')
const downloadRoute = read(
  'src/app/api/books/my-purchases/[purchaseId]/download/route.ts'
)
const navLayout = read('src/components/dashboard/DashboardLayout/index.tsx')

const checks = [
  [
    'My Books is a real nav destination, not just described in a coming-soon panel',
    navLayout.includes("{ label: 'My Books', href: '/dashboard/my-books' }"),
  ],
  [
    'My Books page scopes purchases to the signed-in user (not a global list)',
    myBooks.includes('db.bookPurchase.findMany({ where: { userId }') ,
  ],
  [
    'download route verifies the purchase belongs to the caller before minting a grant (no cross-account access by guessing an id)',
    downloadRoute.includes('purchase.userId !== userId') && downloadRoute.includes('404'),
  ],
  [
    'dashboard overview stats are computed from real purchase/booking data, not hardcoded',
    overview.includes('db.bookPurchase.findMany') &&
      overview.includes('purchases.length') &&
      overview.includes('db.booking.findMany'),
  ],
  [
    'dashboard never claims a "current subscription" that does not exist in this codebase',
    !overview.includes('subscription') && !myBooks.includes('subscription'),
  ],
  [
    'recommended books come from the real catalog, excluding what the member already owns',
    overview.includes('!ownedSlugs.has(book.slug)') && myBooks.includes('!ownedSlugs.has(book.slug)'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
