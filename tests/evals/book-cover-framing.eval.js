/**
 * Full-cover framing eval. Run: node tests/evals/book-cover-framing.eval.js
 * Outcome: 100% of book image placements retain the whole source rectangle,
 * at rest and on hover, for portrait, square and landscape uploads on mobile
 * and desktop. Uses real Tailwind output and browser-computed image geometry.
 * Uploads are stored verbatim; no re-upload or database migration is required.
 * Regression pattern: never use object-cover or hover zoom for book artwork.
 */
const assert = require('node:assert/strict')
const postcss = require('postcss')
const tailwind = require('tailwindcss')
const { chromium } = require('@playwright/test')
const { coverClasses } = require('../regressions/book-cover-framing.test')

async function main() {
  const placements = coverClasses()
  assert.equal(placements.length, 7)
  const { css } = await postcss([tailwind({
    content: [{ raw: placements.map(({ classes }) => classes).join(' '), extension: 'html' }],
    corePlugins: { preflight: false },
  })]).process('@tailwind utilities;', { from: undefined })
  const browser = await chromium.launch({ headless: true })
  let checks = 0
  try {
    const page = await browser.newPage()
    for (const viewport of [375, 1440]) {
      await page.setViewportSize({ width: viewport, height: 900 })
      for (const [width, height] of [[600, 1000], [800, 1000], [1000, 1000], [1200, 600]]) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="navy"/><rect width="100%" height="40" fill="red"/><rect y="${height - 40}" width="100%" height="40" fill="lime"/></svg>`
        for (const { file, classes } of placements) {
          await page.setContent(`<style>${css}</style><div class="group" style="position:relative;width:160px;height:200px;overflow:hidden"><img class="${classes}" style="position:absolute;width:100%;height:100%" src="data:image/svg+xml,${encodeURIComponent(svg)}"></div>`)
          await page.locator('img').evaluate((img) => img.decode())
          for (const hover of [false, true]) {
            await page.mouse.move(hover ? 80 : 300, hover ? 80 : 300)
            const result = await page.locator('img').evaluate((img) => {
              const style = getComputedStyle(img)
              const box = img.getBoundingClientRect()
              const parent = img.parentElement.getBoundingClientRect()
              const scale = style.objectFit === 'contain'
                ? Math.min(box.width / img.naturalWidth, box.height / img.naturalHeight)
                : Math.max(box.width / img.naturalWidth, box.height / img.naturalHeight)
              return { fit: style.objectFit, width: img.naturalWidth * scale,
                height: img.naturalHeight * scale, frameWidth: parent.width, frameHeight: parent.height }
            })
            assert.equal(result.fit, 'contain', file)
            assert.ok(result.width <= result.frameWidth + 0.01, `${file}: clipped sides`)
            assert.ok(result.height <= result.frameHeight + 0.01, `${file}: clipped top/bottom`)
            checks++
          }
        }
      }
    }
    console.log(`PASS ${checks} full-cover browser checks across 7 placements, 4 source ratios, 2 viewports, rest/hover`)
  } finally {
    await browser.close()
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
