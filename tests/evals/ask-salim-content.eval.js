const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')
const page = read('src/app/(site)/ask-salim/page.tsx')
const answer = read('src/app/(site)/ask-salim/[slug]/page.tsx')
const form = read('src/components/forms/AskSalimForm/index.tsx')
const shared = read('src/components/sections/shared/NotPublished/index.tsx')
const experience = [page, answer, form, shared].join('\n')

const checks = [
  [
    'Ask Salim experience contains no em dash characters',
    !experience.includes('—'),
  ],
  [
    'page explains the four-stage answer process',
    ['Ask', 'Review', 'Respond', 'Publish'].every((step) =>
      page.includes(`'${step}',`)
    ),
  ],
  [
    'page provides six well-formed question examples',
    [
      'Relationships',
      'Identity',
      'Manhood',
      'Purpose',
      'Kingdom Life',
      'Leadership',
    ].every((category) => page.includes(`'${category}',`)),
  ],
  [
    'page defines five public-answer selection standards',
    (page.match(/^  'The /gm) || []).length >= 3 &&
      page.includes('Submission does not guarantee a response'),
  ],
  [
    'page states professional and emergency boundaries',
    /not emergency\s+support/.test(page) &&
      /local\s+emergency services/.test(page),
  ],
  [
    'form uses honest prepare-email language',
    form.includes('Prepare Email') && !form.includes('Submit Question'),
  ],
  [
    'form preserves content after preparing the email',
    !form.includes("setQuestion('')") && !form.includes("setName('')"),
  ],
  [
    'form supports context and publication preferences',
    form.includes('Helpful context') && form.includes('Publication preference'),
  ],
  [
    'form protects input length and identifies fields accessibly',
    form.includes('maxLength={questionLimit}') &&
      form.includes('htmlFor="question"'),
  ],
  [
    'page offers a private coaching route',
    page.includes('href="/work-with-salim/coaching"'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks)
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
