const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const source = fs.readFileSync(
  path.join(root, 'src/components/sections/home/Hero/index.tsx'),
  'utf8'
)
const asset = path.join(root, 'public/images/salim/keynote-hero.webp')
const mobileAsset = path.join(
  root,
  'public/images/salim/keynote-hero-mobile.webp'
)
const reusedAsset = path.join(root, 'public/images/salim/speaking-keynote.webp')
const speakingPage = fs.readFileSync(
  path.join(root, 'src/app/(site)/work-with-salim/speaking/page.tsx'),
  'utf8'
)
const pageHero = fs.readFileSync(
  path.join(root, 'src/components/layout/PageHero/index.tsx'),
  'utf8'
)

const checks = [
  ['generated keynote image exists', fs.existsSync(asset)],
  ['dedicated mobile keynote image exists', fs.existsSync(mobileAsset)],
  ['first generated image is retained', fs.existsSync(reusedAsset)],
  [
    'first image is reused on the speaking hero',
    speakingPage.includes('/images/salim/speaking-keynote.webp'),
  ],
  [
    'desktop heroes include the additional lower-edge trim',
    pageHero.includes('lg:h-[calc(56.2799vw-60px)]') &&
      pageHero.includes('lg:object-top'),
  ],
  [
    'mobile heroes match the portrait art ratio',
    pageHero.includes('aspect-[941/1672]'),
  ],
  [
    'page hero images fill their matching canvas',
    pageHero.includes('object-cover object-center'),
  ],
  ['page hero visual fills the section', /fill: true/.test(pageHero)],
  [
    'page hero titles use executive display sizing',
    pageHero.includes('lg:text-7xl'),
  ],
  [
    'above-the-fold page hero images load with priority',
    /priority: true/.test(pageHero),
  ],
  ['hero images are preload-prioritized', /priority: true/.test(source)],
  ['images have responsive sizing', /sizes: '100vw'/.test(source)],
  [
    'mobile art direction is selected by media query',
    /max-width: 1023px/.test(source),
  ],
  [
    'mobile art direction uses the portrait image',
    source.includes('/images/salim/keynote-hero-mobile.webp'),
  ],
  [
    'mobile portrait fills its matching frame',
    /aspect-\[941\/1672\]/.test(source) &&
      /object-cover object-center/.test(source),
  ],
  ['mobile contrast gradient is present', /bg-gradient-to-b/.test(source)],
  ['desktop contrast gradient is present', /lg:bg-gradient-to-r/.test(source)],
  [
    'homepage trims the same desktop lower edge',
    source.includes('lg:h-[calc(56.2799vw-60px)]') &&
      source.includes('lg:object-top'),
  ],
  [
    'hero has an accessible labelled region',
    /aria-labelledby="home-hero-title"/.test(source),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
}

if (failures.length) process.exit(1)
