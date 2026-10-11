const fs = require('node:fs')
const page = fs.readFileSync('src/app/(site)/halisi-hub-connect/community/page.tsx', 'utf8')
const plans = fs.readFileSync('src/components/sections/community/MembershipPlans/index.tsx', 'utf8')
const checks = {
  'classic hierarchy matches mission palette and typography': ['font-heading', 'bg-cream', 'bg-navy', 'border-navy-200'].every(token => page.includes(token)),
  'shared responsive hero retained': page.includes('<PageHero'),
  'belonging, rhythm and membership sections labeled': ['belong-heading', 'rhythm-heading', 'membership-heading'].every(id => page.includes(`aria-labelledby="${id}"`)),
  'membership prices unchanged': ['price: 500,', 'price: 1500,', 'price: 5000,'].every(token => plans.includes(token)),
  'enquiry route is clear and no implied checkout': plans.includes('Enquire About {plan.name}') && page.replace(/\s+/g, ' ').includes('This page does not collect payment or activate a membership.'),
  'plans remain legible on tablets': plans.includes('lg:grid-cols-3') && !plans.includes('sm:grid-cols-3'),
  'mission and impact pathways preserved': ['/halisi-hub-connect/mission', '/halisi-hub-connect/impact'].every(route => page.includes(`href="${route}"`)),
}
Object.entries(checks).forEach(([name, passed]) => console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`))
if (Object.values(checks).some(passed => !passed)) process.exit(1)
