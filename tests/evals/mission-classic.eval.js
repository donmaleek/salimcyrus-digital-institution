const fs = require('node:fs')
const source = fs.readFileSync('src/app/(site)/halisi-hub-connect/mission/page.tsx', 'utf8')
const checks = {
  'shared responsive hero retained': source.includes('<PageHero'),
  'purpose, commitments, participation have labeled sections': ['purpose-heading', 'pillars-heading', 'participate-heading'].every(id => source.includes(`aria-labelledby="${id}"`)),
  'editorial hierarchy uses existing serif and palette': ['font-heading', 'bg-cream', 'bg-navy', 'border-navy-200'].every(token => source.includes(token)),
  'four original commitments preserved': ['Mentorship', 'Community', 'Masterclasses & Programs', 'Community Initiatives'].every(title => source.includes(`title: '${title}'`)),
  'no placeholder statistics or decorative card grid': !/rounded-2xl|\d+\+|Lorem ipsum/.test(source),
  'participation offers community, impact, and contact': ['/halisi-hub-connect/community', '/halisi-hub-connect/impact', '/contact'].every(route => source.includes(`href="${route}"`)),
}
Object.entries(checks).forEach(([name, passed]) => console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`))
if (Object.values(checks).some(passed => !passed)) process.exit(1)
