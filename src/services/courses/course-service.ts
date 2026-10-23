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

type PreservedLessonFields = {
  resourceLabel: string | null
  resourceFileName: string | null
  videoFileName: string | null
  videoProcessingStatus: string
  durationSeconds: number | null
}

/**
 * An admin resave of a course with zero enrollments deletes and recreates
 * every section/lesson row (see updateCourse), since the editor has no way
 * to express a partial reorder/edit otherwise. Left unhandled, that would
 * silently wipe any already-uploaded lesson video or downloadable resource
 * on every single save, including one that only changed the price. A
 * carried-over lesson is matched by the id the editor already sends for
 * anything it loaded from the server (see LessonDraft in CourseEditor);
 * a lesson with no id, or an id that does not match an existing row, is
 * treated as brand new and starts with no video/resource, exactly as it
 * should.
 *
 * Duration gets the same treatment, but only once a lesson has a
 * self-hosted video: background compression (see video-compression.ts)
 * probes the real duration from the file once it finishes, which is the
 * authoritative source from that point on. Without this, a routine resave
 * (fixing a typo in the title, say) would resend whatever duration the
 * admin typed into the form before the video was even uploaded, silently
 * clobbering the correct probed value. A lesson with no video keeps using
 * the admin's typed duration exactly as before.
 */
function nestedSections(sections: CourseInput['sections'], preserved?: Map<string, PreservedLessonFields>) {
  return sections.map((section, sectionIndex) => ({
    title: section.title,
    description: section.description || null,
    position: sectionIndex + 1,
    lessons: {
      create: section.lessons.map((lesson, lessonIndex) => {
        const carried = lesson.id ? preserved?.get(lesson.id) : undefined
        return {
          title: lesson.title,
          description: lesson.description || null,
          content: lesson.content || null,
          videoUrl: lesson.videoUrl || null,
          durationSeconds: carried?.videoFileName
            ? carried.durationSeconds
            : lesson.durationMinutes
              ? lesson.durationMinutes * 60
              : null,
          position: lessonIndex + 1,
          isPreview: lesson.isPreview,
          resourceLabel: carried?.resourceLabel ?? null,
          resourceFileName: carried?.resourceFileName ?? null,
          videoFileName: carried?.videoFileName ?? null,
          videoProcessingStatus: carried?.videoProcessingStatus ?? 'ready',
        }
      }),
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
      featured: input.featured, accessWindowDays: input.accessWindowDays ?? null,
      sections: { create: nestedSections(input.sections) },
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
    const existingLessons = await tx.courseLesson.findMany({
      where: { section: { courseId: id } },
      select: { id: true, resourceLabel: true, resourceFileName: true, videoFileName: true, videoProcessingStatus: true, durationSeconds: true },
    })
    const preserved = new Map(existingLessons.map((lesson) => [lesson.id, lesson]))

    await tx.courseSection.deleteMany({ where: { courseId: id } })
    return tx.course.update({
      where: { id },
      data: {
        slug: await uniqueCourseSlug(input.title, id), title: input.title, subtitle: input.subtitle || null,
        description: input.description, kind: input.kind, category: input.category, level: input.level,
        priceKes: input.priceKes, priceUsd: input.priceUsd, thumbnailUrl: input.thumbnailUrl || null,
        trailerUrl: input.trailerUrl || null, outcomes: input.outcomes, status: input.status,
        featured: input.featured, accessWindowDays: input.accessWindowDays ?? null,
        sections: { create: nestedSections(input.sections, preserved) },
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
