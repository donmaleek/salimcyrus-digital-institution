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
const accountPage = read('src/app/(dashboard)/dashboard/my-account/page.tsx')
const accountForm = read('src/components/forms/AccountForm/index.tsx')
const avatarRoute = read('src/app/api/account/avatar/route.ts')
const passwordRoute = read('src/app/api/account/password/route.ts')

const checks = [
  [
    'My Books is a real nav destination, not just described in a coming-soon panel',
    navLayout.includes("label: 'My Books'") && navLayout.includes("href: '/dashboard/my-books'"),
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
  [
    'mobile clients retain direct navigation to every member destination',
    navLayout.includes('Dashboard mobile navigation') && navLayout.includes('grid-cols-6'),
  ],
  [
    'account page provides profile photo and password management',
    accountPage.includes('hasProfileImage') && accountForm.includes('Upload Photo') && accountForm.includes('Update Password'),
  ],
  [
    'profile photos stay behind authenticated storage rather than public files',
    avatarRoute.includes("getServerSession(authOptions)") && avatarRoute.includes("'Cache-Control': 'private, no-store'"),
  ],
  [
    'password changes verify the current hash and write a fresh bcrypt hash',
    passwordRoute.includes('bcrypt.compare') && passwordRoute.includes('bcrypt.hash') && passwordRoute.includes('currentPassword'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
