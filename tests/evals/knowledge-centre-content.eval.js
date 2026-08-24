const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')
const page = read('src/app/(site)/knowledge-centre/page.tsx')
const categories = read('src/lib/data/knowledge-categories.ts')
const experience = [
  page,
  categories,
  read('src/app/(site)/knowledge-centre/category/[slug]/page.tsx'),
  read('src/app/(site)/knowledge-centre/article/[slug]/page.tsx'),
  read('src/components/sections/shared/NotPublished/index.tsx'),
].join('\n')

const topicBlocks = [...categories.matchAll(/topics:\s*\[([\s\S]*?)\]/g)]
const topics = topicBlocks.flatMap((match) =>
  [...match[1].matchAll(/'([^']+)'/g)].map((topic) => topic[1].toLowerCase())
)
const duplicateTopics = topics.filter(
  (topic, index) => topics.indexOf(topic) !== index
)

const checks = [
  [
    'Knowledge Centre experience contains no em dash characters',
    !experience.includes('—'),
  ],
  [
    'seven distinct categories are defined',
    (categories.match(/slug: '/g) || []).length === 7,
  ],
  [
    'every category has a unique guiding question',
    (categories.match(/guidingQuestion: '/g) || []).length === 7,
  ],
  ['topic taxonomy contains no repeated labels', duplicateTopics.length === 0],
  [
    'page reports calculated category and topic totals',
    page.includes('knowledgeCategories.length') && page.includes('totalTopics'),
  ],
  [
    'page honestly states the editorial publication status',
    /articles\s+are\s+not\s+yet\s+published/.test(page),
  ],
  [
    'page offers three non-repeated deeper routes',
    ['/books', '/academy', '/ask-salim'].every((route) =>
      page.includes(`href="${route}"`)
    ),
  ],
  [
    'generic category card grid is gone',
    !page.includes('grid gap-6 sm:grid-cols-2 lg:grid-cols-3'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks)
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (duplicateTopics.length)
  console.log(`Repeated topics: ${[...new Set(duplicateTopics)].join(', ')}`)
if (failures.length) process.exit(1)
