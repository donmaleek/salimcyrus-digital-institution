const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const appDir = path.join(root, 'src/app')

// A route segment with a `loading.tsx` wraps every descendant page in an
// implicit Suspense boundary. On Next.js 14.2.35 (confirmed by direct
// testing, not assumption — see the removed src/app/(site)/loading.tsx and
// src/app/(dashboard)/dashboard/loading.tsx), that boundary causes the
// initial response to stream with a 200 status before a descendant page's
// notFound() call can take effect: the HTTP status is already committed by
// the time the not-found determination happens. A page that should 404
// instead returns 200 with the not-found UI's markup — wrong for SEO,
// monitoring, and any programmatic consumer.
//
// Until the Next.js major-version upgrade (tracked separately, out of scope
// here) potentially resolves this upstream, the fix is structural: no route
// segment that has a `loading.tsx` may contain a descendant page that calls
// notFound(). This eval enforces that invariant so the bug can't come back
// by someone adding a loading.tsx to a segment with notFound()-calling pages
// (or vice versa) without realizing the interaction.

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(full, files)
    } else {
      files.push(full)
    }
  }
  return files
}

const allFiles = walk(appDir)
const loadingFiles = allFiles.filter((f) => path.basename(f) === 'loading.tsx')
const notFoundPages = allFiles.filter(
  (f) => path.basename(f) === 'page.tsx' && fs.readFileSync(f, 'utf8').includes('notFound()')
)

function isAncestorSegment(loadingFile, pageFile) {
  const loadingSegment = path.dirname(loadingFile)
  const pageSegment = path.dirname(pageFile)
  return pageSegment === loadingSegment || pageSegment.startsWith(loadingSegment + path.sep)
}

const violations = []
for (const loadingFile of loadingFiles) {
  for (const pageFile of notFoundPages) {
    if (isAncestorSegment(loadingFile, pageFile)) {
      violations.push(
        `${path.relative(root, loadingFile)} wraps ${path.relative(root, pageFile)} (calls notFound())`
      )
    }
  }
}

const checks = [
  [
    'no loading.tsx wraps a page that calls notFound() (breaks the 404 status code — see comment above)',
    violations.length === 0,
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (violations.length) {
  console.log('Violations:')
  for (const v of violations) console.log(`  - ${v}`)
}
if (failures.length) process.exit(1)
