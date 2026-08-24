const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')
const hero = read('src/components/layout/PageHero/index.tsx')
const routes = [
  'src/app/(site)/books/page.tsx',
  'src/app/(site)/knowledge-centre/page.tsx',
  'src/app/(site)/halisi-hub-connect/page.tsx',
  'src/app/(site)/journal/page.tsx',
  'src/app/(site)/ask-salim/page.tsx',
  'src/app/(site)/contact/page.tsx',
]
const pages = routes.map(read)

const checks = [
  [
    'shared hero uses a content-safe mobile minimum height',
    hero.includes('min-h-[780px]') && hero.includes('lg:min-h-0'),
  ],
  [
    'mobile hero title uses a controlled display size',
    hero.includes('text-[2.75rem]') && hero.includes('sm:text-6xl'),
  ],
  [
    'hero actions fill the safe width on mobile only',
    hero.includes('[&>a]:w-full') && hero.includes('sm:[&>a]:w-auto'),
  ],
  [
    'hero reserves space for the mobile header and scroll cue',
    hero.includes('pb-28 pt-24'),
  ],
  [
    'all six pages use compact mobile section spacing',
    pages.every((page) => page.includes('py-16 sm:py-24')),
  ],
  [
    'desktop section spacing remains unchanged',
    pages.every((page) => page.includes('sm:py-24')),
  ],
  [
    'audited pages no longer use desktop section spacing on mobile',
    pages.every((page) => !page.includes('py-20 sm:py-24')),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks)
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
