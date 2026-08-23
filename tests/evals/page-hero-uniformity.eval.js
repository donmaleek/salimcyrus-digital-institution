const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')
const pageHero = read('src/components/layout/PageHero/index.tsx')
const visuals = read('src/lib/data/hero-visuals.ts')
const generatedAssets = [
  'academy-hero.webp',
  'knowledge-hero.webp',
  'community-hero.webp',
  'coaching-hero.webp',
  'media-hero.webp',
]

const pageRoot = path.join(root, 'src/app/(site)')
function collectPages(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const location = path.join(directory, entry.name)
    if (entry.isDirectory()) return collectPages(location)
    return entry.name === 'page.tsx' ? [location] : []
  })
}

const pagesWithoutSharedHero = collectPages(pageRoot)
  .filter((file) => file !== path.join(pageRoot, 'page.tsx'))
  .filter((file) => {
    const source = fs.readFileSync(file, 'utf8')
    return !source.includes('<PageHero') && !source.includes('<NotPublished')
  })

const checks = [
  [
    'shared hero uses the same full-bleed structure site-wide',
    pageHero.includes('data-testid="page-hero"'),
  ],
  [
    'shared hero has responsive full-width imagery',
    pageHero.includes('sizes="100vw"'),
  ],
  [
    'topic images display without cropping',
    pageHero.includes('object-contain object-center'),
  ],
  [
    'hero reserves navigation height',
    pageHero.includes('h-[calc(100svh-64px)]'),
  ],
  [
    'shared hero includes the continuation cue',
    pageHero.includes('<ScrollCue />'),
  ],
  [
    'every non-home page uses the shared hero contract',
    pagesWithoutSharedHero.length === 0,
  ],
  ...generatedAssets.map((asset) => [
    `${asset} exists and is assigned`,
    fs.existsSync(path.join(root, 'public/images/salim', asset)) &&
      visuals.includes(asset),
  ]),
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks)
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (pagesWithoutSharedHero.length) {
  console.log(
    pagesWithoutSharedHero.map((file) => path.relative(root, file)).join('\n')
  )
}
if (failures.length) process.exit(1)
