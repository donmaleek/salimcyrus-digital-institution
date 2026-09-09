const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const files = [
  'src/app/(site)/page.tsx',
  'src/components/sections/home/Hero/index.tsx',
  'src/components/sections/home/InstitutionalOverview/index.tsx',
  'src/components/sections/home/ServicesOverview/index.tsx',
  'src/components/sections/home/FeaturedContent/index.tsx',
  'src/components/sections/home/TransformativeResults/index.tsx',
  'src/components/sections/home/CtaSection/index.tsx',
]
const source = files.map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('\n')

const checks = [
  ['homepage presents verified credentials', source.includes('Certified Life Coach') && source.includes('Advanced Emotional Intelligence')],
  ['homepage explains four need-based entry paths', ['I need clarity now', 'I want structured formation', 'I want ideas I can study', 'I want community and contribution'].every((text) => source.includes(text))],
  ['academy programs come from canonical data', source.includes("import { programs } from '@/lib/data/programs'")],
  ['books come from the canonical merged catalog (static + admin-uploaded)', source.includes("import { getAvailableBooks } from '@/lib/data/book-catalog'")],
  ['all institutional destinations are represented', ['/academy', '/books', '/knowledge-centre', '/halisi-hub-connect', '/journal', '/ask-salim', '/contact'].every((href) => source.includes(`href=\"${href}\"`) || source.includes(`href: '${href}'`))],
  ['homepage has no em dash characters', !source.includes('—')],
  ['homepage uses specific next actions', source.includes('Find Your Starting Point') && source.includes('Contact the Institution')],
  ['new sections expose stable test identifiers', ['home-authority', 'home-academy', 'home-books', 'home-community-journal', 'home-pathways', 'home-knowledge'].every((id) => source.includes(id))],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
