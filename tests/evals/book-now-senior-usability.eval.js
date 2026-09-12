const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')
const picker = read('src/components/payments/CoachingCategoryPicker/index.tsx')
const page = read('src/app/(site)/book-now/page.tsx')
const surface = `${page}\n${picker}`

const checks = [
  [
    'all session types use a wrapping grid instead of hidden horizontal scrolling',
    picker.includes('grid gap-3 sm:grid-cols-2 lg:grid-cols-3') &&
      !picker.includes('overflow-x-auto'),
  ],
  [
    'the booking decision is presented as three plain steps',
    [
      'Choose the kind of help you need',
      'Choose your session',
      'Choose how to pay',
    ].every((label) => picker.includes(label)),
  ],
  [
    'each session type shows a description, a starting price, and a text selected state',
    picker.includes('{item.description}') &&
      picker.includes('From ${formatCurrency') &&
      picker.includes("isActive ? 'Selected' : 'Choose'"),
  ],
  [
    'decision controls use senior-friendly text and touch target sizes',
    picker.includes('min-h-[132px]') &&
      picker.includes('min-h-14') &&
      picker.includes('text-base font-bold'),
  ],
  [
    'category selection is reflected in the URL and can be restored',
    picker.includes("searchParams.get('category')") &&
      picker.includes("url.searchParams.set('category', nextCategory)"),
  ],
  [
    'the page promises price visibility before payment',
    page.includes('Every price is shown before') && page.includes('payment.'),
  ],
  [
    'the redesigned surface contains no em dash characters',
    !surface.includes('—'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
}
if (failures.length) process.exit(1)
