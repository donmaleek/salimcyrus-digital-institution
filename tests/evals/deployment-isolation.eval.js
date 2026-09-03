const fs = require('node:fs')
const path = require('node:path')

const root = path.join(__dirname, '../..')
const compose = fs.readFileSync(
  path.join(root, 'infrastructure/docker/docker-compose.yml'),
  'utf8'
)

const checks = [
  ['fixed project namespace', /^name: salimcyrus$/m.test(compose)],
  [
    'loopback-only host publication',
    compose.includes('127.0.0.1:${SALIMCYRUS_PORT:-3014}:3000'),
  ],
  ['no shared infrastructure services', !/^\s{2}(cms|nginx|proxy|database|db):$/m.test(compose)],
  ['service health check', /^\s{4}healthcheck:$/m.test(compose)],
  ['scoped deployment command', compose.includes('docker compose --project-name salimcyrus')],
  ['proxy validation guidance', compose.includes('nginx -t')],
]

const failed = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'}: ${name}`)
}

if (failed.length) {
  process.exitCode = 1
} else {
  console.log(`Deployment isolation score: ${checks.length}/${checks.length}`)
}
