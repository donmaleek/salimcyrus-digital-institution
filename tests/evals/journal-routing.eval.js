const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const legacyRoute = fs.readFileSync(
  path.join(root, 'src/app/(site)/people-vent-on-social-media-because-they-arent-heard-in-person/page.tsx'),
  'utf8'
)
const sitemap = fs.readFileSync(path.join(root, 'src/app/sitemap.ts'), 'utf8')
const nextConfig = fs.readFileSync(path.join(root, 'next.config.js'), 'utf8')
const journalPage = fs.readFileSync(
  path.join(root, 'src/app/(site)/journal/[slug]/page.tsx'),
  'utf8'
)

const checks = [
  ['legacy route uses a permanent redirect', legacyRoute.includes('permanentRedirect(journalPath)')],
  ['Next routing returns a permanent HTTP redirect', nextConfig.includes('async redirects()') && nextConfig.includes('permanent: true')],
  ['legacy route targets the canonical journal path', legacyRoute.includes('/journal/people-vent-on-social-media-because-they-arent-heard-in-person')],
  ['journal entries are included in the sitemap', sitemap.includes('db.journalEntry') && sitemap.includes('/journal/${entry.slug}')],
  ['journal metadata declares its canonical URL', journalPage.includes("alternates: { canonical: `/journal/${entry.slug}` }")],
  ['journal page no longer links to the removed source URL', !journalPage.includes('entry.originalUrl')],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
