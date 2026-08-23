const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const source = fs.readFileSync(
  path.join(root, 'src/components/sections/home/Hero/index.tsx'),
  'utf8',
)
const asset = path.join(root, 'public/images/salim/keynote-hero.webp')
const mobileAsset = path.join(root, 'public/images/salim/keynote-hero-mobile.webp')
const reusedAsset = path.join(root, 'public/images/salim/speaking-keynote.webp')
const speakingPage = fs.readFileSync(
  path.join(root, 'src/app/(site)/work-with-salim/speaking/page.tsx'),
  'utf8',
)
const pageHero = fs.readFileSync(
  path.join(root, 'src/components/layout/PageHero/index.tsx'),
  'utf8',
)

const checks = [
  ['generated keynote image exists', fs.existsSync(asset)],
  ['dedicated mobile keynote image exists', fs.existsSync(mobileAsset)],
  ['first generated image is retained', fs.existsSync(reusedAsset)],
  ['first image is reused on the speaking hero', speakingPage.includes('/images/salim/speaking-keynote.webp')],
  ['landscape page heroes reserve a restrained desktop column', pageHero.includes('minmax(400px,560px)')],
  ['page heroes use restrained desktop spacing', pageHero.includes('lg:py-24')],
  ['page hero titles use executive display sizing', pageHero.includes('lg:text-7xl')],
  ['above-the-fold page hero images load with priority', /<Image[\s\S]*?priority/.test(pageHero)],
  ['hero images are preload-prioritized', /priority: true/.test(source)],
  ['images have responsive sizing', /sizes: '100vw'/.test(source)],
  ['mobile art direction is selected by media query', /max-width: 639px/.test(source)],
  ['mobile art direction uses the portrait image', source.includes('/images/salim/keynote-hero-mobile.webp')],
  ['mobile crop protects Salim on the right', /object-\[72%_center\]/.test(source)],
  ['mobile contrast gradient is present', /bg-gradient-to-b/.test(source)],
  ['desktop contrast gradient is present', /lg:bg-gradient-to-r/.test(source)],
  ['desktop hero preserves the source aspect ratio', /lg:aspect-\[1672\/941\]/.test(source)],
  ['hero has an accessible labelled region', /aria-labelledby="home-hero-title"/.test(source)],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
}

if (failures.length) process.exit(1)
