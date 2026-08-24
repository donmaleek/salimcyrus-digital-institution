const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')
const page = read('src/app/(site)/journal/page.tsx')
const entryPage = read('src/app/(site)/journal/[slug]/page.tsx')
const data = read('src/lib/data/journal.ts')
const experience = [page, entryPage, data].join('\n')

const checks = [
  [
    'Journal experience contains no em dash characters',
    !experience.includes('—'),
  ],
  [
    'one verified published essay is identified',
    data.includes("publishedAt: 'September 4, 2025'") &&
      data.includes('https://salimcyrus.com/people-vent-on-social-media'),
  ],
  [
    'six distinct editorial themes are defined',
    (data.match(/question: '/g) || []).length === 6,
  ],
  [
    'five future essays are honestly labeled as editorial development',
    (data.match(/premise:/g) || []).length === 5 &&
      page.includes('In editorial development'),
  ],
  [
    'Journal provides a four-step reading method',
    [
      'Read slowly',
      'Name the tension',
      'Test the idea',
      'Choose a response',
    ].every((step) => page.includes(step)),
  ],
  [
    'published entry has a four-part argument map',
    [
      'Public expression can begin with private silence',
      'Visibility is not the same as understanding',
      'Listening is a relational responsibility',
      'The repair begins offline',
    ].every((idea) => entryPage.includes(`title: '${idea}'`)),
  ],
  [
    'published entry links to the original complete essay',
    entryPage.includes('Read the Original Essay') &&
      entryPage.includes('entry.originalUrl'),
  ],
  [
    'generic dashed placeholder cards are gone',
    !experience.includes('border-dashed') &&
      !experience.includes('Planned</p>'),
  ],
  [
    'Journal connects readers to deeper routes',
    ['/knowledge-centre', '/ask-salim'].every((route) =>
      page.includes(`href="${route}"`)
    ),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks)
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
