const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const aboutFiles = [
  'src/app/(site)/about/page.tsx',
  'src/components/sections/about/Story/index.tsx',
  'src/components/sections/about/OriginTimeline/index.tsx',
  'src/components/sections/about/Philosophy/index.tsx',
  'src/components/sections/about/FrameworksDisplay/index.tsx',
  'src/components/sections/about/Credentials/index.tsx',
]
const content = aboutFiles
  .map((relative) => fs.readFileSync(path.join(root, relative), 'utf8'))
  .join('\n')

const checks = [
  [
    'My Story section has no image component',
    !content.includes("from 'next/image'") && !content.includes('<Image'),
  ],
  ['About page contains no em dash characters', !content.includes('—')],
  [
    'credentials include all five source-site titles',
    [
      'Certified Life Coach',
      'Advanced Emotional Intelligence',
      'Strategic Accountability Coach',
      'Human Potential Practitioner',
      'Decision Architecture Specialist',
    ].every((credential) => content.includes(credential)),
  ],
  [
    'published works are named',
    content.includes('Concealed Redemption') &&
      content.includes('The Great Deception'),
  ],
  [
    'placeholder copy is gone',
    !content.includes('Coming soon') && !content.includes('is being written'),
  ],
  [
    'page explains philosophy and method',
    content.includes('Formation, not performance') &&
      content.includes('Frameworks that move ideas into action'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks)
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
