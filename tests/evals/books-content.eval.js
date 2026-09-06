const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')
const page = read('src/app/(site)/books/page.tsx')
const detail = read('src/app/(site)/books/[slug]/page.tsx')
const catalog = read('src/lib/data/books.ts')
const booksExperience = [page, detail, catalog].join('\n')
const covers = fs
  .readdirSync(path.join(root, 'public/images/books'))
  .filter((file) => file.endsWith('.webp'))

const checks = [
  [
    'Books experience contains no em dash characters',
    !booksExperience.includes('—'),
  ],
  [
    'catalog contains 11 distinct confirmed titles',
    (catalog.match(/\n  book\(/g) || []).length === 11,
  ],
  [
    'every title uses the shared KES 1,499 price',
    catalog.includes('BOOK_PRICE_KES = 1499'),
  ],
  ['every catalog title has an optimized cover', covers.length === 11],
  [
    'catalog provides title-specific WhatsApp ordering',
    catalog.includes('encodeURIComponent(message)') &&
      catalog.includes('WHATSAPP_NUMBER'),
  ],
  [
    'catalog uses a responsive three-column layout',
    page.includes('sm:grid-cols-2 lg:grid-cols-3'),
  ],
  [
    'books have both order and detail routes',
    page.includes('book.purchaseUrl') && page.includes('Details'),
  ],
  [
    'detail pages preserve 4:5 cover artwork',
    detail.includes('aspect-[4/5]') && detail.includes('object-cover'),
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
