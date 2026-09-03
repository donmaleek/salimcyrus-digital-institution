const fs = require('node:fs')
const path = require('node:path')

const root = path.join(__dirname, '..')
const compose = fs.readFileSync(
  path.join(root, 'infrastructure/docker/docker-compose.yml'),
  'utf8'
)
const dockerignore = fs.readFileSync(path.join(root, '.dockerignore'), 'utf8')
const dockerfile = fs.readFileSync(
  path.join(root, 'infrastructure/docker/Dockerfile'),
  'utf8'
)

describe('shared-server deployment isolation', () => {
  test('uses a fixed, unique Compose project namespace', () => {
    expect(compose).toMatch(/^name: salimcyrus$/m)
    expect(compose).toContain('name: salimcyrus_internal')
  })

  test('publishes only a project-specific loopback port', () => {
    expect(compose).toContain('127.0.0.1:${SALIMCYRUS_PORT:-3014}:3000')
    expect(compose).not.toMatch(/^\s+- ['"]?(3000|1337):/m)
    expect(compose).not.toMatch(/0\.0\.0\.0:\$?\{?SALIMCYRUS_PORT/)
  })

  test('deploys only the application service', () => {
    expect(compose).toMatch(/^\s{2}web:$/m)
    expect(compose).not.toMatch(/^\s{2}(cms|nginx|proxy|database|db):$/m)
  })

  test('build context resolves from the Compose file location', () => {
    expect(compose).toMatch(/context: \.\.\/\.\./)
    expect(compose).toMatch(/dockerfile: infrastructure\/docker\/Dockerfile/)
    expect(compose).toMatch(/^\s{6}network: host$/m)
  })

  test('container has an explicit production listener and health check', () => {
    expect(compose).toMatch(/^\s{6}HOSTNAME: 0\.0\.0\.0$/m)
    expect(compose).toMatch(/^\s{6}PORT: 3000$/m)
    expect(compose).toMatch(/^\s{4}healthcheck:$/m)
  })

  test('build context cannot copy local or production secrets', () => {
    expect(dockerignore).toMatch(/^\.env$/m)
    expect(dockerignore).toMatch(/^\.env\.\*$/m)
    expect(dockerignore).toMatch(/^node_modules$/m)
  })

  test('copies the Prisma schema before dependency postinstall runs', () => {
    expect(dockerfile.indexOf('COPY prisma/schema.prisma')).toBeGreaterThan(-1)
    expect(dockerfile.indexOf('COPY prisma/schema.prisma')).toBeLessThan(
      dockerfile.indexOf('RUN npm ci')
    )
  })
})
