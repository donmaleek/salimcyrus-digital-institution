const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const source = fs.readFileSync(
  path.join(root, 'src/components/sections/home/SocialProofBar/index.tsx'),
  'utf8'
)
const hero = fs.readFileSync(
  path.join(root, 'src/components/sections/home/Hero/index.tsx'),
  'utf8'
)
const page = fs.readFileSync(path.join(root, 'src/app/(site)/page.tsx'), 'utf8')
const css = fs.readFileSync(path.join(root, 'src/styles/globals.css'), 'utf8')
const logos = [
  'disrupt-africa.png',
  'entrepreneur.png',
  'own.png',
  'think-sales-profit.png',
  'forbes.png',
  'goalcast.png',
]

const checks = [
  ['strip is inside the homepage hero', hero.includes('<SocialProofBar />')],
  [
    'strip is not rendered as a separate page section',
    !page.includes('<SocialProofBar />'),
  ],
  [
    'strip has a forty-pixel desktop gap above the scroll cue',
    source.includes('bottom-20') && source.includes('lg:bottom-[120px]'),
  ],
  [
    'strip has an accessible label',
    source.includes('aria-label="Media recognition"'),
  ],
  [
    'logos repeat for a seamless loop',
    source.includes('<LogoGroup />') && source.includes('<LogoGroup hidden />'),
  ],
  ['continuous animation exists', css.includes('@keyframes media-logo-scroll')],
  ['hover pauses the strip', css.includes('animation-play-state: paused')],
  [
    'reduced motion disables animation',
    /prefers-reduced-motion[\s\S]*media-logo-track[\s\S]*animation: none/.test(
      css
    ),
  ],
  ...logos.map((logo) => [
    `${logo} exists and is rendered`,
    fs.existsSync(path.join(root, 'public/images/media-logos', logo)) &&
      source.includes(logo),
  ]),
  ['University of Nairobi is rendered', source.includes("initials: 'UON'")],
  ['Kashari Soft Consultants is rendered', source.includes("initials: 'KSC'")],
  ['Mount Kenya University is rendered', source.includes("initials: 'MKU'")],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks)
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
