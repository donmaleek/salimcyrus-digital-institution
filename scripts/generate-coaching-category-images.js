#!/usr/bin/env node
// Generates the 7 coaching category card images (one abstract gold-on-navy
// mark per category, matching the site's brand palette) and seeds the DB
// rows that make the Book Now picker use them instead of the initials
// fallback. No external image-generation API is used or needed: each
// image is a small, hand-authored SVG rasterized with sharp (already a
// project dependency), so the whole set is deterministic and reproducible
// from this file alone. Re-running it regenerates and re-uploads every
// image; it is always safe to run again.
//
// Usage: node scripts/generate-coaching-category-images.js

const path = require('path')
const fs = require('fs')
const { PrismaClient } = require('@prisma/client')
const sharp = require('sharp')
const { coachingCategorySvgs } = require('./lib/coaching-category-svg')

const IMAGE_SIZE = 640

function coachingImagesStorageDir() {
  return path.resolve(process.env.COACHING_IMAGES_STORAGE_DIR ?? path.join(process.cwd(), 'CoachingImages'))
}

async function main() {
  const db = new PrismaClient()
  const outDir = coachingImagesStorageDir()
  fs.mkdirSync(outDir, { recursive: true })

  try {
    for (const [slug, svg] of Object.entries(coachingCategorySvgs(IMAGE_SIZE))) {
      const fileName = `${slug}.webp`
      const filePath = path.join(outDir, fileName)
      await sharp(Buffer.from(svg)).webp({ quality: 92 }).toFile(filePath)

      const imagePath = `/api/coaching/image/${fileName}`
      await db.coachingCategoryImage.upsert({
        where: { categorySlug: slug },
        create: { categorySlug: slug, imagePath },
        update: { imagePath },
      })
      console.log(`${slug} -> ${filePath} (${imagePath})`)
    }
  } finally {
    await db.$disconnect()
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
