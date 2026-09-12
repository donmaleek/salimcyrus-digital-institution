const fs = require('node:fs')
const path = require('node:path')

const navigation = fs.readFileSync(
  path.resolve(__dirname, '../../src/components/layout/Header/Navigation.tsx'),
  'utf8'
)

const checks = [
  [
    'desktop navigation is client-controlled so route changes can close menus',
    navigation.includes("'use client'") && navigation.includes('usePathname'),
  ],
  [
    'submenu visibility is controlled by explicit state rather than persistent CSS group hover',
    navigation.includes('openMenu') &&
      !navigation.includes('group-hover:visible'),
  ],
  [
    'selecting a child closes its parent submenu',
    navigation.includes('onClick={() => setOpenMenu(null)}'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
}
if (failures.length) process.exit(1)
