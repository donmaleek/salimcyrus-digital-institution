const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')

const catalog = read('src/lib/data/alignment-sessions.ts')
const detail = read('src/app/(site)/work-with-salim/coaching/[slug]/page.tsx')
const coaching = read('src/app/(site)/work-with-salim/coaching/page.tsx')
const sitemap = read('src/app/sitemap.ts')
const heroVisuals = read('src/lib/data/hero-visuals.ts')
const sessionSlugs = [
  'identity-life-alignment',
  'single-motherhood-life-alignment',
]

const checks = [
  [
    'both supplied alignment-session concepts have dedicated public routes',
    sessionSlugs.every((slug) => catalog.includes(`slug: '${slug}'`)),
  ],
  [
    'the coaching page introduces both pathways without presenting downloadable brochures',
    coaching.includes('Private Alignment Sessions') &&
      coaching.includes('alignmentSessions.map') &&
      !coaching.includes('.pdf'),
  ],
  [
    'each detail page has clear audience, themes, process, principle, and booking sections',
    ['Who this is for', 'What we explore', 'The Salim Cyrus approach', 'A defining principle', 'Book a Private Session'].every((text) =>
      detail.includes(text)
    ),
  ],
  [
    'both detail pages use the shared full-bleed hero with distinct content-specific images',
    detail.includes('<PageHero') &&
      heroVisuals.includes('identity-life-alignment-hero.webp') &&
      heroVisuals.includes('single-motherhood-life-alignment-hero.webp') &&
      fs.existsSync(
        path.join(
          root,
          'public/images/alignment/identity-life-alignment-hero.webp'
        )
      ) &&
      fs.existsSync(
        path.join(
          root,
          'public/images/alignment/single-motherhood-life-alignment-hero.webp'
        )
      ),
  ],
  [
    'each alignment hero has a mobile-specific crop',
    fs.existsSync(
      path.join(
        root,
        'public/images/alignment/identity-life-alignment-hero-mobile.webp'
      )
    ) &&
      fs.existsSync(
        path.join(
          root,
          'public/images/alignment/single-motherhood-life-alignment-hero-mobile.webp'
        )
      ),
  ],
  [
    'the identity pathway expressly rejects coercion and points serious mental-health needs to licensed care',
    catalog.includes('You will not be pressured, shamed, humiliated') &&
      detail.includes('do not promise to change or eliminate sexual orientation') &&
      detail.includes('licensed or emergency support'),
  ],
  [
    'the single-motherhood pathway centers dignity, children, boundaries, and identity beyond motherhood',
    ['does not diminish your dignity', 'Children & new relationships', 'Boundaries & co-parenting', 'Identity beyond motherhood'].every((text) =>
      catalog.includes(text)
    ),
  ],
  [
    'the pages provide both direct booking and a lower-pressure confidential enquiry route',
    detail.includes('/book-now#choose-session') &&
      detail.includes('Ask Confidentially') &&
      detail.includes('WHATSAPP_URL'),
  ],
  [
    'both pages are discoverable in the sitemap',
    sessionSlugs.every((slug) => sitemap.includes(`/work-with-salim/coaching/${slug}`)),
  ],
  [
    'the new alignment-session copy contains no em dash characters',
    ![catalog, detail].join('\n').includes('—'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
