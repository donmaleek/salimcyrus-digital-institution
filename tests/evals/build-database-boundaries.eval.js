const fs = require('node:fs')
const path = require('node:path')
const root = path.resolve(__dirname, '../..')
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8')
const slots = read('src/app/api/booking/available-slots/route.ts')
const sitemap = read('src/app/sitemap.ts')
const checks = [
  [
    'live availability is never pre-rendered',
    slots.includes("dynamic = 'force-dynamic'"),
  ],
  [
    'sitemap preserves public routes during a database outage',
    sitemap.includes('.catch((error: unknown)') &&
      sitemap.includes('return []') &&
      sitemap.includes('staticRoutes.map'),
  ],
]
const failures = checks.filter(([, pass]) => !pass)
for (const [name, pass] of checks)
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
