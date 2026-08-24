const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const page = fs.readFileSync(
  path.join(root, 'src/app/(site)/work-with-salim/page.tsx'),
  'utf8'
)
const programs = fs.readFileSync(
  path.join(root, 'src/lib/data/programs.ts'),
  'utf8'
)
const expectedPrograms = [
  'The Identity Reformation Program',
  'Kingdom Mentality Masterclass',
  'Defining Manhood Bootcamp',
  'Relationship Intelligence Program',
  'The Discipline and Execution System',
  'Hekima Inner Circle',
  'Healing and Restoration Intensive',
]

const checks = [
  ['page contains no em dash characters', !page.includes('—')],
  [
    'page offers coaching, speaking, and consulting',
    ['Private Coaching', 'Speaking', 'Consulting'].every((item) =>
      page.includes(item)
    ),
  ],
  [
    'all published programs are available to the page',
    expectedPrograms.every((name) => programs.includes(name)) &&
      page.includes('programs.map'),
  ],
  [
    'program pricing shows KES and USD',
    page.includes("formatPrice(program.priceKes, 'KES')") &&
      page.includes("formatPrice(program.priceUsd, 'USD')"),
  ],
  ['all coaching formats are rendered', page.includes('coachingOffers.map')],
  ['five-step method is rendered', page.includes('coachingProcess.map')],
  [
    'page has clear contact routes',
    page.includes('/contact') && page.includes('WHATSAPP_URL'),
  ],
  [
    'placeholder card grid is gone',
    !page.includes('grid gap-6 sm:grid-cols-3'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks)
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
