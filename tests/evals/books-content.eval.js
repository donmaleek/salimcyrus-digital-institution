const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')
const page = read('src/app/(site)/books/page.tsx')
const booksExperience = [
  page,
  read('src/app/(site)/books/[slug]/page.tsx'),
  read('src/lib/data/books.ts'),
].join('\n')

const checks = [
  [
    'Books experience contains no em dash characters',
    !booksExperience.includes('—'),
  ],
  [
    'available and upcoming books come from catalog data',
    page.includes("books.filter((book) => book.status === 'available')") &&
      page.includes("books.filter((book) => book.status === 'upcoming')"),
  ],
  [
    'all three catalog titles have editorial guides',
    [
      'concealed-redemption',
      'the-great-deception',
      'the-greatest-tragedy',
    ].every((slug) => page.includes(`'${slug}'`)),
  ],
  [
    'available books retain verified KES pricing',
    page.includes('formatPrice(book.priceKes!)') && page.includes('KES 1,499'),
  ],
  [
    'books have both purchase and detail routes',
    page.includes('book.paystackUrl!') && page.includes('Read About the Book'),
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
  [
    'upcoming title has a notification route',
    page.includes('Get Release Updates') && page.includes('/contact'),
  ],
  [
    'generic book card grid is gone',
    !page.includes('mt-14 grid gap-8 sm:grid-cols-2'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks)
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
