import { db } from '@/lib/db'
import { slugify } from '@/lib/utils/slugify'
import type { CourseInput } from './contracts'

export async function uniqueCourseSlug(title: string, excludeId?: string) {
  const base = slugify(title) || 'course'
  let slug = base
  let suffix = 2
  while (await db.course.findFirst({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) } })) {
    slug = `${base}-${suffix++}`
  }
  return slug
}

function nestedSections(sections: CourseInput['sections']) {
  return sections.map((section, sectionIndex) => ({
    title: section.title,
    description: section.description || null,
    position: sectionIndex + 1,
    lessons: {
      create: section.lessons.map((lesson, lessonIndex) => ({
        title: lesson.title,
        description: lesson.description || null,
        content: lesson.content || null,
        videoUrl: lesson.videoUrl || null,
        durationSeconds: lesson.durationMinutes ? lesson.durationMinutes * 60 : null,
        position: lessonIndex + 1,
        isPreview: lesson.isPreview,
      })),
    },
  }))
}

export async function createCourse(input: CourseInput) {
  return db.course.create({
    data: {
      slug: await uniqueCourseSlug(input.title), title: input.title, subtitle: input.subtitle || null,
      description: input.description, kind: input.kind, category: input.category, level: input.level,
      priceKes: input.priceKes, priceUsd: input.priceUsd, thumbnailUrl: input.thumbnailUrl || null,
      trailerUrl: input.trailerUrl || null, outcomes: input.outcomes, status: input.status,
      featured: input.featured, sections: { create: nestedSections(input.sections) },
    },
    include: { sections: { include: { lessons: true }, orderBy: { position: 'asc' } } },
  })
}

export async function updateCourse(id: string, input: CourseInput) {
  return db.$transaction(async (tx) => {
    const enrollmentCount = await tx.courseEnrollment.count({ where: { courseId: id } })
    if (enrollmentCount > 0) {
      throw new Error('COURSE_HAS_ENROLLMENTS')
    }
    await tx.courseSection.deleteMany({ where: { courseId: id } })
    return tx.course.update({
      where: { id },
      data: {
        slug: await uniqueCourseSlug(input.title, id), title: input.title, subtitle: input.subtitle || null,
        description: input.description, kind: input.kind, category: input.category, level: input.level,
        priceKes: input.priceKes, priceUsd: input.priceUsd, thumbnailUrl: input.thumbnailUrl || null,
        trailerUrl: input.trailerUrl || null, outcomes: input.outcomes, status: input.status,
        featured: input.featured, sections: { create: nestedSections(input.sections) },
      },
      include: { sections: { include: { lessons: true }, orderBy: { position: 'asc' } } },
    })
  })
}

export async function enrollUser(courseId: string, userId: string, reference: string, provider = 'admin', amountMinor = 0, currency = 'KES') {
  return db.courseEnrollment.upsert({
    where: { courseId_userId: { courseId, userId } },
    create: { courseId, userId, provider, externalReference: reference, amountMinor, currency },
    update: {},
  })
}

export function completionPercent(completed: number, total: number) {
  return total === 0 ? 0 : Math.round((completed / total) * 100)
}
