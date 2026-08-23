const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const navigation = fs.readFileSync(
  path.join(root, 'src/components/layout/Header/Navigation.tsx'),
  'utf8'
)
const header = fs.readFileSync(
  path.join(root, 'src/components/layout/Header/index.tsx'),
  'utf8'
)

const checks = [
  [
    'desktop navigation has intentional item gaps',
    navigation.includes('items-center gap-2 xl:flex'),
  ],
  [
    'navigation labels have wider horizontal padding',
    navigation.includes('px-3 py-3'),
  ],
  [
    'navigation labels use refined letter spacing',
    navigation.includes('tracking-[0.035em]'),
  ],
  [
    'header provides room for expanded navigation',
    header.includes('max-w-[1440px]'),
  ],
  [
    'header overlays every hero without a background',
    header.includes('absolute inset-x-0 top-0 z-50 bg-transparent'),
  ],
  [
    'header no longer switches to a solid page background',
    !header.includes('sticky top-0') && !header.includes('bg-navy'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks)
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
