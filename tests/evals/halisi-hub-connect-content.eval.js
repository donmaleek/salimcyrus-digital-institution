const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')
const routes = [
  'src/app/(site)/halisi-hub-connect/page.tsx',
  'src/app/(site)/halisi-hub-connect/mission/page.tsx',
  'src/app/(site)/halisi-hub-connect/community/page.tsx',
  'src/app/(site)/halisi-hub-connect/impact/page.tsx',
]
const pages = routes.map(read)
const hub = pages[0]
const impact = pages[3]
const experience = pages
  .concat([
    read('src/components/layout/Footer/index.tsx'),
    read('src/components/layout/Footer/NewsletterSignup.tsx'),
  ])
  .join('\n')

const checks = [
  [
    'Halisi Hub route family contains no em dash characters',
    !experience.includes('—'),
  ],
  [
    'hub defines four institutional commitments',
    ['01', '02', '03', '04'].every((number) =>
      hub.includes(`    '${number}',`)
    ),
  ],
  [
    'hub explains a four-stage operating model',
    ['Listen', 'Teach', 'Practice', 'Multiply'].every((term) =>
      hub.includes(`'${term}',`)
    ),
  ],
  [
    'hub provides mission, community, and impact pathways',
    [
      '/halisi-hub-connect/mission',
      '/halisi-hub-connect/community',
      '/halisi-hub-connect/impact',
    ].every((route) => hub.includes(route)),
  ],
  [
    'hub provides support and contact participation routes',
    ['/support-the-mission', '/contact'].every((route) =>
      hub.includes(`href="${route}"`)
    ),
  ],
  [
    'hub defines four measurable outcome areas',
    ['Participation', 'Formation', 'Belonging', 'Contribution'].every((term) =>
      hub.includes(`'${term}',`)
    ),
  ],
  [
    'impact page does not publish placeholder counters',
    !impact.includes('border-dashed') &&
      !impact.includes('text-3xl font-bold text-navy-300'),
  ],
  [
    'impact page distinguishes six evidence categories',
    [
      'Participation',
      'Formation',
      'Belonging',
      'Contribution',
      'Continuity',
      'Stories',
    ].every((term) => impact.includes(`'${term}',`)),
  ],
  [
    'impact page states its verification standard',
    impact.includes('figures that can be traced to a defined source'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks)
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
