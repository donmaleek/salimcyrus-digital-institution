const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')
const page = read('src/app/(site)/contact/page.tsx')
const form = read('src/components/forms/ContactForm/index.tsx')
const experience = [page, form].join('\n')

const expectedRoutes = [
  '/work-with-salim/coaching',
  '/work-with-salim/speaking',
  '/work-with-salim/consulting',
  '/halisi-hub-connect',
  '/media/press-kit',
  '/ask-salim',
]

const checks = [
  [
    'Contact experience contains no em dash characters',
    !experience.includes('—'),
  ],
  [
    'Contact defines six specialist pathways',
    expectedRoutes.every((route) => page.includes(`href: '${route}'`)),
  ],
  [
    'Contact explains its distinction from Ask Salim',
    /Ask Salim remains separate/.test(page) && /public\s+answers/.test(page),
  ],
  [
    'Contact provides direct email and WhatsApp methods',
    page.includes('mailto:${CONTACT_EMAIL}') &&
      page.includes('href={WHATSAPP_URL}'),
  ],
  [
    'Contact defines a five-item message checklist',
    (page.match(/^  '.*'/gm) || []).length >= 5 &&
      page.includes('A Useful First Message'),
  ],
  [
    'Contact states booking and engagement expectations',
    /does not confirm a\s+booking/.test(page) &&
      /Formal work begins only after/.test(page),
  ],
  [
    'form submits into the owned follow-up workflow',
    form.includes("fetch('/api/contact'") && form.includes('Send Enquiry'),
  ],
  [
    'form clears the draft only after the server accepts it',
    form.includes('if(!response.ok)') && form.includes('setValues({ enquiryType:'),
  ],
  [
    'form collects enquiry type and organization context',
    form.includes('Enquiry type') && form.includes('Organization'),
  ],
  [
    'form has accessible limits and autocomplete hints',
    form.includes('maxLength={messageLimit}') &&
      form.includes('autoComplete="email"'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks)
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
