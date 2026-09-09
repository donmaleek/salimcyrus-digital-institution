const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')

const adminTeachingsRoute = read('src/app/api/admin/teachings/route.ts')
const adminBooksRoute = read('src/app/api/admin/books/route.ts')
const thumbnailRoute = read('src/app/api/teachings/thumbnail/[fileName]/route.ts')
const coverRoute = read('src/app/api/books/cover/[fileName]/route.ts')
const bookCover = read('src/components/books/BookCover/index.tsx')
const teachingDetail = read('src/app/(site)/teachings/[slug]/page.tsx')

const checks = [
  [
    'admin teaching uploads no longer write the thumbnail into /public (Next.js production only recognizes files present in /public at process start, so anything written there after boot 404s until a restart)',
    !adminTeachingsRoute.includes("public/images/teachings") &&
      adminTeachingsRoute.includes('/api/teachings/thumbnail/'),
  ],
  [
    'admin book uploads no longer write the cover into /public, same reasoning',
    !adminBooksRoute.includes("public/images/books") && adminBooksRoute.includes('/api/books/cover/'),
  ],
  [
    'the thumbnail and cover files are written next to the video/PDF in the same private storage directory, not a new untracked location',
    adminTeachingsRoute.includes('teachingFilePath(thumbFileName)') &&
      adminBooksRoute.includes('bookFilePath(coverFileName)'),
  ],
  [
    'the thumbnail and cover serving routes read from disk on every request (readFileSync in the request handler), not a cached/static snapshot',
    thumbnailRoute.includes('readFileSync(teachingFilePath(fileName))') &&
      coverRoute.includes('readFileSync(bookFilePath(fileName))'),
  ],
  [
    'thumbnail and cover routes require no authentication: they are meant to be publicly visible, unlike the video/PDF itself',
    !thumbnailRoute.includes('requireCrmApi') && !coverRoute.includes('requireCrmApi'),
  ],
  [
    'thumbnail and cover routes are publicly cacheable, not marked private/no-store like the purchase-gated content routes',
    thumbnailRoute.includes("'public, max-age") && coverRoute.includes("'public, max-age"),
  ],
  [
    'public-facing book covers and teaching thumbnails render with unoptimized, avoiding a dependency on the image optimizer (sharp is not installed in production)',
    bookCover.includes('unoptimized') && teachingDetail.includes('unoptimized'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
