#!/usr/bin/env node
// Seeds the 12 Parental Guidance curriculum modules plus the flagship
// "Foundations of Intentional Parenting" course as draft Course rows (see
// scripts/lib/parental-guidance-curriculum.js for the source content, all
// transcribed/adapted from the curriculum document, nothing invented).
// Idempotent: skips a course whose slug already exists, so re-running this
// after an admin has edited a seeded course never clobbers their changes.
// Every course ships status: "draft" with placeholder prices (clearly
// marked below) since the source document does not specify real prices;
// an admin must review pricing and hit Publish in /dashboard/admin/courses
// before any of this is purchasable.

const { PrismaClient } = require('@prisma/client')
const { chromium } = require('@playwright/test')
const { renderWorksheetPdf } = require('./lib/render-worksheet-pdf')
const { mkdirSync } = require('fs')
const { join, resolve } = require('path')
const { CATEGORY, modules, flagship, lessonText } = require('./lib/parental-guidance-curriculum')

// Mirrors src/lib/api/course-resources-storage.ts's courseResourcesStorageDir
// exactly (a plain CJS script cannot import a TS module directly; every
// other generator script in this directory follows the same rule).
function courseResourcesStorageDir() {
  return resolve(process.env.COURSE_RESOURCES_STORAGE_DIR ?? join(process.cwd(), 'CourseResources'))
}

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Placeholder draft pricing, clearly round numbers an admin will replace.
// The source document explicitly defers real pricing to the business
// ("Prices should be set after reviewing production costs and the
// intended audience"), so these are never meant to go live unedited.
const MODULE_PLACEHOLDER_PRICE_KES = 300
const MODULE_PLACEHOLDER_PRICE_USD = 2
const FLAGSHIP_PLACEHOLDER_PRICE_KES = 2500
const FLAGSHIP_PLACEHOLDER_PRICE_USD = 19

async function main() {
  const db = new PrismaClient()
  const resourcesDir = courseResourcesStorageDir()
  mkdirSync(resourcesDir, { recursive: true })

  async function attachResource({ lessonId, title, moduleName, intro, practice, reflection }) {
    const fileName = `${lessonId}.pdf`
    await renderWorksheetPdf({
      chromium,
      title,
      moduleName,
      intro,
      prompts: [practice],
      reflection,
      outputPath: join(resourcesDir, fileName),
    })
    await db.courseLesson.update({ where: { id: lessonId }, data: { resourceFileName: fileName } })
  }

  // --- 12 standalone modules -------------------------------------------
  for (const mod of modules) {
    const slug = slugify(mod.title)
    const existing = await db.course.findUnique({ where: { slug } })
    if (existing) {
      console.log(`Skip (already seeded): ${mod.title}`)
      continue
    }

    const course = await db.course.create({
      data: {
        slug,
        title: mod.title,
        description: mod.description,
        kind: 'course',
        category: CATEGORY,
        level: 'all-levels',
        priceKes: MODULE_PLACEHOLDER_PRICE_KES,
        priceUsd: MODULE_PLACEHOLDER_PRICE_USD,
        outcomes: mod.outcomes,
        status: 'draft',
        sections: {
          create: [
            {
              title: 'Lesson',
              position: 1,
              lessons: {
                create: [
                  {
                    title: mod.title.replace(/^\d+\.\s*/, ''),
                    content: lessonText(mod.lesson),
                    resourceLabel: mod.resourceLabel,
                    position: 1,
                  },
                ],
              },
            },
          ],
        },
      },
      include: { sections: { include: { lessons: true } } },
    })

    const lesson = course.sections[0].lessons[0]
    await attachResource({
      lessonId: lesson.id,
      title: mod.resourceLabel,
      moduleName: mod.title,
      intro: mod.lesson.teach,
      practice: mod.lesson.practice,
      reflection: mod.lesson.reflection,
    })
    console.log(`Created: ${mod.title} (${lesson.id})`)
  }

  // --- Flagship course ----------------------------------------------------
  const flagshipSlug = slugify(flagship.title)
  const existingFlagship = await db.course.findUnique({ where: { slug: flagshipSlug } })
  if (existingFlagship) {
    console.log(`Skip (already seeded): ${flagship.title}`)
  } else {
    const course = await db.course.create({
      data: {
        slug: flagshipSlug,
        title: flagship.title,
        subtitle: flagship.subtitle,
        description: flagship.description,
        kind: 'course',
        category: CATEGORY,
        level: 'beginner',
        priceKes: FLAGSHIP_PLACEHOLDER_PRICE_KES,
        priceUsd: FLAGSHIP_PLACEHOLDER_PRICE_USD,
        outcomes: flagship.outcomes,
        status: 'draft',
        featured: true,
        sections: {
          create: [
            {
              title: 'The Foundations of Intentional Parenting',
              position: 1,
              lessons: {
                create: flagship.lessons.map((lesson, index) => ({
                  title: lesson.title,
                  content: lesson.content,
                  resourceLabel: lesson.resourceLabel,
                  position: index + 1,
                  isPreview: index === 0,
                })),
              },
            },
          ],
        },
      },
      include: { sections: { include: { lessons: { orderBy: { position: 'asc' } } } } },
    })

    for (const lesson of course.sections[0].lessons) {
      const source = flagship.lessons.find((l) => l.title === lesson.title)
      if (!source.resourceLabel) continue
      const moduleMatch = modules.find((m) => m.resourceLabel === source.resourceLabel)
      await attachResource({
        lessonId: lesson.id,
        title: source.resourceLabel,
        moduleName: flagship.title,
        intro: moduleMatch ? moduleMatch.lesson.teach : '',
        practice: moduleMatch ? moduleMatch.lesson.practice : '',
        reflection: moduleMatch ? moduleMatch.lesson.reflection : '',
      })
    }
    console.log(`Created: ${flagship.title} (${course.id})`)
  }

  await db.$disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
