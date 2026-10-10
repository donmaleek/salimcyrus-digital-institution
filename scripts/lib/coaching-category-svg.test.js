const { coachingCategorySvgs } = require('./coaching-category-svg')
const { coachingCategories } = require('../../src/lib/data/coaching-offers')

describe('coachingCategorySvgs', () => {
  it('generates exactly one image per coaching category, keyed by the real category slugs', () => {
    const svgs = coachingCategorySvgs(640)
    const expectedSlugs = coachingCategories.map((c) => c.slug).sort()
    expect(Object.keys(svgs).sort()).toEqual(expectedSlugs)
  })

  it('every generated image is valid, well-formed SVG at the requested size', () => {
    const svgs = coachingCategorySvgs(640)
    for (const svg of Object.values(svgs)) {
      expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640"')
      expect(svg).toContain('</svg>')
    }
  })

  it('scales every image to whatever size is requested, not just the default', () => {
    const svgs = coachingCategorySvgs(128)
    expect(svgs.standard).toContain('width="128" height="128"')
  })

  it('uses the exact brand gold/navy palette from tailwind.config.js, not arbitrary colors', () => {
    const svgs = coachingCategorySvgs(640)
    for (const svg of Object.values(svgs)) {
      expect(svg).toContain('#0F1B2D') // navy DEFAULT
      expect(svg).toContain('#C9A227') // gold DEFAULT
    }
  })

  it('produces a visually distinct mark per category: no two categories share identical icon markup', () => {
    const svgs = coachingCategorySvgs(640)
    const iconBodies = Object.values(svgs).map((svg) => svg.slice(svg.indexOf('<g transform=')))
    expect(new Set(iconBodies).size).toBe(iconBodies.length)
  })

  it('contains no em dash characters in its source comments', () => {
    const source = require('fs').readFileSync(require.resolve('./coaching-category-svg'), 'utf8')
    expect(source).not.toContain('—')
  })
})
