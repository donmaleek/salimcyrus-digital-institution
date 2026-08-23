const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const footer = fs.readFileSync(
  path.join(root, 'src/components/layout/Footer/index.tsx'),
  'utf8'
)
const imagePath = path.join(
  root,
  'public/images/salim/footer-auditorium.webp'
)

const checks = [
  ['footer background exists', fs.existsSync(imagePath)],
  ['footer background is lightweight', fs.statSync(imagePath).size < 100_000],
  ['footer renders the generated image', footer.includes('footer-auditorium.webp')],
  ['background image is decorative', footer.includes('alt=""')],
  ['footer has a contrast overlay', footer.includes('linear-gradient')],
  ['footer has a stable test identifier', footer.includes('data-testid="site-footer"')],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
}
if (failures.length) process.exit(1)
