const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')

const suspensionLib = read('src/lib/suspension.ts')
const middleware = read('src/middleware.ts')
const toggleScript = read('scripts/toggle-site.js')
const envExample = read('.env.example')
const readme = read('README.md')
const dashboardLayout = read('src/components/dashboard/DashboardLayout/index.tsx')
const adminTeachingsPage = read('src/app/(dashboard)/dashboard/admin/teachings/page.tsx')

const checks = [
  [
    'suspension defaults to live (fail-safe): isAppSuspended only returns true for the exact string "true", never a generic truthy check that a stray env var could accidentally trip',
    suspensionLib.includes("env.APP_SUSPENDED === 'true'"),
  ],
  [
    'the bypass check refuses to match when no server-side secret is configured, so an unset SUSPENSION_BYPASS_TOKEN can never be bypassed by an empty/undefined provided token',
    /if \(!expectedToken \|\| !providedToken\) return false/.test(suspensionLib),
  ],
  [
    'the suspended page reads like an infrastructure/hosting problem, with no mention of payment, billing, invoices, or the client by name, so a suspended site never embarrasses the client publicly',
    !/pay|bill|invoice|overdue|salim/i.test(suspensionLib.slice(suspensionLib.indexOf('suspendedPageHtml'))),
  ],
  [
    'middleware checks suspension before anything else and returns a real 503 (not a 200 page pretending to be down, and not a 404/403 that looks like a bug) with a Retry-After header',
    middleware.includes("status: 503") && middleware.includes('Retry-After'),
  ],
  [
    'middleware matcher only carves out the two admin video-upload endpoints (Next 15.5 truncates middleware-buffered bodies at 10MB); pages and every other API route are still suspended',
    (middleware.match(/matcher:/g) || []).length === 1 &&
      middleware.includes('api/admin/courses/[^/]+/lessons/[^/]+/video$') &&
      middleware.includes('api/admin/teachings$') &&
      !/matcher:\s*\[\s*'\/api/.test(middleware),
  ],
  [
    'a valid bypass token both unblocks the current request and persists via a cookie, so the developer is not forced to keep the token in every URL',
    middleware.includes('response.cookies.set') && middleware.includes('NextResponse.next()'),
  ],
  [
    'the bypass cookie is httpOnly and secure, so it cannot be read by page JavaScript or sent over plain HTTP',
    middleware.includes('httpOnly: true') && middleware.includes('secure: true'),
  ],
  [
    'the toggle script is idempotent (reports "no change" rather than restarting PM2 needlessly when already in the requested state) and never leaves a duplicate APP_SUSPENDED line',
    toggleScript.includes('Already') && toggleScript.includes('No change made'),
  ],
  [
    'the toggle script only runs its CLI entrypoint when executed directly, so its pure read/write logic stays unit-testable as a plain module',
    toggleScript.includes('require.main === module'),
  ],
  [
    'both new env vars are documented in .env.example with no real secret committed',
    envExample.includes('APP_SUSPENDED=') &&
      envExample.includes('SUSPENSION_BYPASS_TOKEN=') &&
      !/SUSPENSION_BYPASS_TOKEN=\S/.test(envExample),
  ],
  [
    'the operational procedure is documented in README so the developer does not have to re-derive it later',
    readme.includes('toggle-site.js') && readme.includes('bypass'),
  ],
  [
    'the client-facing admin dashboard has no suspend/resume control of its own: this is a developer-only lever the client cannot see or flip',
    !dashboardLayout.toLowerCase().includes('suspend') &&
      !adminTeachingsPage.toLowerCase().includes('suspend'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
