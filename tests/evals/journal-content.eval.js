const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')
const page = read('src/app/(site)/journal/page.tsx')
const entryPage = read('src/app/(site)/journal/[slug]/page.tsx')
const data = read('src/lib/data/journal.ts')
const seedScript = read('scripts/seed-journal.js')
const experience = [page, entryPage, data].join('\n')

const checks = [
  [
    'Journal experience contains no em dash characters',
    !experience.includes('—'),
  ],
  [
    'journal reads from the database, not a static entries array (entries are authored at /dashboard/admin/journal)',
    page.includes('db.journalEntry.findMany') &&
      entryPage.includes('db.journalEntry.findFirst') &&
      !data.includes('publishedJournalEntries'),
  ],
  [
    'the one entry migrated from the old static file is seeded correctly',
    seedScript.includes(
      "const slug = 'people-vent-on-social-media-because-they-arent-heard-in-person'"
    ) &&
      seedScript.includes("publishedAt: new Date('2025-09-04')") &&
      seedScript.includes("status: 'published'"),
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
    'entry page renders each essay\'s own body, not a hardcoded argument map shared by every slug',
    entryPage.includes('entry.body') &&
      entryPage.includes('data-testid="essay-body"') &&
      // Regression guard: this exact hardcoded list used to render under
      // every slug regardless of which essay was actually being viewed.
      !entryPage.includes('Public expression can begin with private silence'),
  ],
  [
    'published entry continues into the Journal without a dead external link',
    entryPage.includes('Explore the Journal') &&
      !entryPage.includes('entry.originalUrl'),
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
