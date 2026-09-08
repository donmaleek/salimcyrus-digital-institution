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

// Product-detail pages are deliberately exempt: a book's page is a
// marketplace listing (breadcrumb, buy box, product details), not editorial
// content, and a generic marketing hero banner above the buy box is exactly
// the opposite of the Amazon/Kindle-style product page it's meant to read
// as. Same reasoning class as the redirect exemption below — a page that
// structurally can't/shouldn't carry the shared hero, not an oversight.
const HERO_EXEMPT_PAGES = [
  path.join(pageRoot, 'books', '[slug]', 'page.tsx'),
  path.join(pageRoot, 'teachings', '[slug]', 'page.tsx'),
]

const pagesWithoutSharedHero = collectPages(pageRoot)
  .filter((file) => file !== path.join(pageRoot, 'page.tsx'))
  .filter((file) => !HERO_EXEMPT_PAGES.includes(file))
  .filter((file) => {
    const source = fs.readFileSync(file, 'utf8')
    // Pure server-redirect pages (permanentRedirect/redirect with no JSX
    // return) never render anything, so they can't have a hero.
    if (source.includes('permanentRedirect(') || /\bredirect\(/.test(source)) {
      return false
    }
    return !source.includes('<PageHero') && !source.includes('<NotPublished')
  })

const checks = [
  [
    'shared hero uses the same full-bleed structure site-wide',
    pageHero.includes('data-testid="page-hero"'),
  ],
  [
    'shared hero has responsive full-width imagery',
    pageHero.includes("sizes: '100vw'"),
  ],
  [
    'topic images fill their breakpoint-specific canvas',
    pageHero.includes('object-cover object-center'),
  ],
  [
    'hero guarantees a tall mobile canvas and a distinct desktop height',
    pageHero.includes('min-h-[780px]') &&
      pageHero.includes('lg:h-[calc(56.2799vw-100px)]'),
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
  ...generatedAssets.map((asset) => [
    `${asset.replace('.webp', '-mobile.webp')} exists`,
    fs.existsSync(
      path.join(
        root,
        'public/images/salim',
        asset.replace('.webp', '-mobile.webp')
      )
    ),
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
