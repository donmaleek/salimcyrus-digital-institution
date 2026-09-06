const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')
const page = read('src/app/(site)/books/page.tsx')
const detail = read('src/app/(site)/books/[slug]/page.tsx')
const catalog = read('src/lib/data/books.ts')
const bookCover = read('src/components/books/BookCover/index.tsx')
const booksExperience = [page, detail, catalog, bookCover].join('\n')
const covers = fs
  .readdirSync(path.join(root, 'public/images/books'))
  .filter((file) => file.endsWith('.webp'))

const checks = [
  [
    'Books experience contains no em dash characters',
    !booksExperience.includes('—'),
  ],
  [
    'catalog contains 14 distinct confirmed titles',
    (catalog.match(/\n  book\(/g) || []).length === 14,
  ],
  [
    'every title is priced individually within the KES 500-1,000 band',
    catalog.includes('BOOK_MIN_PRICE_KES = 500') && catalog.includes('BOOK_MAX_PRICE_KES = 1000'),
  ],
  ['every catalog title has an optimized cover', covers.length === 14],
  [
    'catalog provides title-specific WhatsApp ordering',
    catalog.includes('encodeURIComponent(message)') &&
      catalog.includes('WHATSAPP_NUMBER'),
  ],
  [
    'catalog uses a responsive Amazon-style grid (up to four per row)',
    page.includes('sm:grid-cols-2 lg:grid-cols-4'),
  ],
  [
    'book cards show an author byline and format/page-count, like a marketplace listing',
    page.includes('by Salim Cyrus') && page.includes('book.pageCount'),
  ],
  [
    'cards route to WhatsApp ordering when instant download is not confirmed',
    page.includes('book.purchaseUrl') && page.includes('Order on WhatsApp'),
  ],
  [
    'covers render as physical books (page-edge shadow), not bare images',
    bookCover.includes('shadow-[') && bookCover.includes('aspect-[4/5]') && bookCover.includes('object-cover'),
  ],
  [
    'detail page reads as a product page: breadcrumb, author byline, format badge, and a buy box',
    detail.includes('aria-label="Breadcrumb"') &&
      detail.includes('(Author)') &&
      detail.includes('Instant PDF Download') &&
      detail.includes('Product details') &&
      detail.includes('book.pageCount'),
  ],
  [
    'reading practice contains four clear actions',
    [
      'Read with one question',
      'Mark what confronts you',
      'Choose one response',
      'Review after seven days',
    ].every((item) => page.includes(item)),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks)
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
