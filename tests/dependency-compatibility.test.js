const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const pkg = require('../package.json')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')

describe('security dependency compatibility', () => {
  it('pins the audited framework and ORM versions together', () => {
    expect(pkg.dependencies.next).toBe('15.5.28')
    expect(pkg.devDependencies['eslint-config-next']).toBe('15.5.28')
    expect(pkg.dependencies.prisma).toBe('6.12.0')
    expect(pkg.dependencies['@prisma/client']).toBe('6.12.0')
    expect(pkg.overrides.next.postcss).toBe('8.5.26')
    expect(pkg.scripts['security:audit']).toContain('npm audit --audit-level=low')
    expect(pkg.scripts['security:audit']).toContain('npm audit --omit=dev --audit-level=low')
  })

  it('converts Prisma byte arrays to response-compatible buffers', () => {
    expect(read('src/app/api/account/avatar/route.ts')).toContain(
      'new NextResponse(Buffer.from(user.profileImageData)'
    )
    expect(read('src/app/api/journal/[id]/cover/route.ts')).toContain(
      'new NextResponse(Buffer.from(entry.coverImageData)'
    )
  })
})
