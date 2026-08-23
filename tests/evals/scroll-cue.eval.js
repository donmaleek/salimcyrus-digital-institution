const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const cue = fs.readFileSync(path.join(root, 'src/components/ui/ScrollCue/index.tsx'), 'utf8')
const homeHero = fs.readFileSync(
  path.join(root, 'src/components/sections/home/Hero/index.tsx'),
  'utf8',
)
const pageHero = fs.readFileSync(
  path.join(root, 'src/components/layout/PageHero/index.tsx'),
  'utf8',
)

const checks = [
  ['cue tells visitors to continue', cue.includes('Scroll to explore')],
  ['cue includes a downward chevron', cue.includes('m6 9 6 6 6-6')],
  ['animation respects reduced-motion preferences', cue.includes('motion-safe:animate-bounce')],
  ['homepage hero includes the cue', homeHero.includes('<ScrollCue />')],
  ['shared page heroes include the cue', pageHero.includes('<ScrollCue />')],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
