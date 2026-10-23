const fs = require('node:fs')
const path = require('node:path')

const surfaces = [
  'src/components/books/BookCover/index.tsx',
  'src/components/dashboard/BookManager/index.tsx',
  'src/components/dashboard/BookEditForm/index.tsx',
  'src/app/(dashboard)/dashboard/page.tsx',
  'src/app/(dashboard)/dashboard/my-books/page.tsx',
]

// Exported fixtures are shared by the browser eval so every book image,
// including recommendations, must meet the same full-artwork contract.
function coverClasses() {
  return surfaces.flatMap((file) => {
    const source = fs.readFileSync(path.resolve(__dirname, '../..', file), 'utf8')
    return [...source.matchAll(/<Image\b[\s\S]*?\/>/g)].map(([image]) => ({
      file,
      classes: image.match(/className="([^"]+)"/)?.[1] ?? '',
    }))
  })
}

if (typeof describe === 'function') {
  describe('book covers preserve the complete uploaded artwork', () => {
    test.each(coverClasses())('$file: $classes', ({ classes }) => {
      expect(classes.split(/\s+/)).toContain('object-contain')
      expect(classes).not.toMatch(/object-cover|scale-/)
    })
    test('all seven cover placements remain covered', () => {
      expect(coverClasses()).toHaveLength(7)
    })
  })
}

module.exports = { coverClasses }
