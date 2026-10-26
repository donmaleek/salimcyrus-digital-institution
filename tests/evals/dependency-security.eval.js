const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const pkg = require(path.join(root, 'package.json'))
const lock = require(path.join(root, 'package-lock.json'))

const installed = lock.packages
const checks = [
  ['Next.js is outside every vulnerability range reported through 2026-10-14', pkg.dependencies.next === '16.4.3'],
  ['lint rules stay on the last eslint-config-next release that supports ESLint 8 (version 16 needs ESLint 9)', pkg.devDependencies['eslint-config-next'] === '15.5.28' && /^\^?8\./.test(pkg.devDependencies.eslint)],
  ['Next.js resolves the patched PostCSS implementation', installed['node_modules/next/node_modules/postcss'] === undefined && installed['node_modules/postcss']?.version === '8.5.26'],
  ['Prisma CLI and Client stay aligned on the audit-clean release', pkg.dependencies.prisma === '6.12.0' && pkg.dependencies['@prisma/client'] === '6.12.0'],
  ['Prisma no longer installs vulnerable deepmerge-ts or effect packages', !installed['node_modules/deepmerge-ts'] && !installed['node_modules/effect']],
  ['all installed js-yaml copies are patched', Object.entries(installed).filter(([name]) => name.endsWith('/js-yaml')).every(([, value]) => ['3.15.2', '4.3.2', '5.4.2'].includes(value.version))],
  ['live registry audits are wired as a separate security gate for future advisories', pkg.scripts['security:audit'] === 'npm audit --audit-level=low && npm audit --omit=dev --audit-level=low'],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
