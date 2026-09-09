const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')

const schema = read('prisma/schema.prisma')
const catalog = read('src/lib/data/book-catalog.ts')
const adminRoute = read('src/app/api/admin/books/route.ts')
const adminIdRoute = read('src/app/api/admin/books/[id]/route.ts')
const uploadForm = read('src/components/dashboard/BookUploadForm/index.tsx')
const manager = read('src/components/dashboard/BookManager/index.tsx')
const detailPage = read('src/app/(site)/books/[slug]/page.tsx')
const listingPage = read('src/app/(site)/books/page.tsx')
const homeSection = read('src/components/sections/home/InstitutionalOverview/index.tsx')
const homePage = read('src/app/(site)/page.tsx')
const bookPurchases = read('src/services/payments/book-purchases.ts')
const downloadRoute = read('src/app/api/books/download/[token]/route.ts')
const reviewsRoute = read('src/app/api/books/[slug]/reviews/route.ts')
const verifyRoute = read('src/app/api/books/verify/route.ts')
const verifyPaypalRoute = read('src/app/api/books/verify-paypal/route.ts')
const nav = read('src/components/dashboard/DashboardLayout/index.tsx')

const uploadSurface = [
  schema.slice(schema.indexOf('model Book {'), schema.indexOf('model BookPurchase')),
  catalog,
  adminRoute,
  adminIdRoute,
  uploadForm,
  manager,
].join('\n')

const checks = [
  [
    'Book model exists, distinct from BookPurchase, with a required PDF file and cover image',
    schema.includes('model Book {') &&
      /fileName\s+String\s*\n/.test(schema.slice(schema.indexOf('model Book {'))) &&
      /coverPath\s+String\s*\n/.test(schema.slice(schema.indexOf('model Book {'))),
  ],
  [
    'uploading a book requires the content:write permission, same gate as Teaching Library',
    adminRoute.includes("requireCrmApi('content:write')"),
  ],
  [
    'the PDF and cover are validated by real MIME type and size, not just a file extension',
    adminRoute.includes("ALLOWED_PDF_TYPE = 'application/pdf'") &&
      adminRoute.includes('ALLOWED_COVER_TYPES') &&
      adminRoute.includes('MAX_PDF_BYTES') &&
      adminRoute.includes('MAX_COVER_BYTES'),
  ],
  [
    'a new admin book cannot collide with an existing static book slug, not just other admin books',
    adminRoute.includes('books.some((b) => b.slug === candidate)') &&
      adminRoute.includes('db.book.findUnique'),
  ],
  [
    'the uploaded PDF is stored using the exact same private, non-public storage as the original 14 books',
    adminRoute.includes("from '@/lib/api/books-storage'") && !adminRoute.includes("join(process.cwd(), 'public'"),
  ],
  [
    'admin uploads start as a draft by default; publish is an explicit choice',
    adminRoute.includes("status: parsed.data.publish ? 'available' : 'draft'"),
  ],
  [
    'reviewing or deleting a book requires the same content:write permission',
    adminIdRoute.includes("requireCrmApi('content:write')") &&
      (adminIdRoute.match(/requireCrmApi\('content:write'\)/g) || []).length >= 2,
  ],
  [
    'the catalog merge is unconditional for existing-purchase lookups (download, purchase recording), never gated on status',
    catalog.includes('export async function getBookBySlug') &&
      !catalog.slice(catalog.indexOf('export async function getBookBySlug'), catalog.indexOf('export async function getAvailableBooks')).includes("status: 'available'"),
  ],
  [
    'the public listing and homepage only ever show available admin books, never drafts',
    catalog.slice(catalog.indexOf('export async function getAvailableBooks')).includes("where: { status: 'available' }"),
  ],
  [
    'the book detail page 404s a book that is not available, same rule for both catalogs',
    detailPage.includes("if (!book || book.status !== 'available') notFound()"),
  ],
  [
    'the money-critical paths (purchase recording, PayPal capture, download, Paystack verify, reviews) all resolve books through the merged catalog, not the static array alone',
    bookPurchases.includes('getBookBySlug') &&
      downloadRoute.includes('getBookBySlug') &&
      reviewsRoute.includes('getBookBySlug') &&
      verifyRoute.includes('getBookBySlug') &&
      verifyPaypalRoute.includes('getBookBySlug'),
  ],
  [
    'the public books listing page reflects the real merged count, not a hardcoded "14 books" claim',
    !listingPage.includes('All 14 books') && listingPage.includes('getAvailableBooks'),
  ],
  [
    'the homepage book teaser is capped at a fixed size so it stays a clean grid as more books are added, and the page revalidates so new admin uploads actually show up',
    homeSection.includes('HOME_BOOK_TEASER_COUNT') && homePage.includes('export const revalidate'),
  ],
  [
    'the admin dashboard nav links to the new Books management page',
    nav.includes("{ label: 'Books', href: '/dashboard/admin/books' }"),
  ],
  [
    'the admin book upload surface contains no em dash characters',
    !uploadSurface.includes('—'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
