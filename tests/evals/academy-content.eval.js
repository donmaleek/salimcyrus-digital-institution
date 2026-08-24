const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')
const academyFiles = [
  'src/app/(site)/academy/page.tsx',
  'src/app/(site)/academy/courses/page.tsx',
  'src/app/(site)/academy/masterclasses/page.tsx',
  'src/lib/data/programs.ts',
]
const content = academyFiles.map(read).join('\n')
const page = read('src/app/(site)/academy/page.tsx')

const checks = [
  ['Academy experience contains no em dash characters', !content.includes('—')],
  [
    'all seven programs are rendered from source data',
    page.includes('programs.map') && page.includes('Published programs'),
  ],
  [
    'program pricing clearly labels KES and USD',
    page.includes("formatPrice(program.priceKes, 'KES')") &&
      page.includes("formatPrice(program.priceUsd, 'USD')"),
  ],
  [
    'learning method has four explicit stages',
    [
      'Name the real issue',
      'Learn a clear framework',
      'Practice the change',
      'Review and strengthen',
    ].every((item) => page.includes(item)),
  ],
  [
    'six subject areas are explained',
    [
      'Identity',
      'Relationships',
      'Manhood',
      'Kingdom',
      'Execution',
      'Restoration',
    ].every((item) => page.includes(item)),
  ],
  [
    'live and planned learning are clearly separated',
    page.includes('Available Now') && page.includes('In Development'),
  ],
  [
    'Academy links to program and contact routes',
    page.includes('/academy/masterclasses') &&
      page.includes('/contact') &&
      page.includes('WHATSAPP_URL'),
  ],
  [
    'generic two-card Academy layout is gone',
    !page.includes('grid gap-6 sm:grid-cols-2'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks)
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
