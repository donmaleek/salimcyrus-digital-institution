import { NextRequest, NextResponse } from 'next/server'
import { mkdirSync, writeFileSync } from 'fs'
import { requireCrmApi } from '@/services/crm/access'
import { db } from '@/lib/db'
import { courseResourcesStorageDir, courseResourceFilePath } from '@/lib/api/course-resources-storage'

const MAX_RESOURCE_BYTES = 10 * 1024 * 1024

/**
 * Lets an admin attach or replace the downloadable PDF on a course lesson
 * (a worksheet, planner, or checklist), same storage-dir pattern as a book
 * PDF or a teaching's thumbnail/preview. The filename is deterministic
 * (lessonId.pdf), so re-uploading simply overwrites the previous file in
 * place; no orphaned files accumulate on disk across edits.
 */
export async function POST(request: NextRequest, props: { params: Promise<{ id: string; lessonId: string }> }) {
  const params = await props.params
  if (!(await requireCrmApi('content:write'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const lesson = await db.courseLesson.findUnique({
    where: { id: params.lessonId },
    include: { section: true },
  })
  if (!lesson || lesson.section.courseId !== params.id) {
    return NextResponse.json({ error: 'Lesson not found.' }, { status: 404 })
  }

  const form = await request.formData().catch(() => null)
  if (!form) {
    return NextResponse.json({ error: 'Invalid form submission.' }, { status: 400 })
  }

  const label = form.get('label')
  const file = form.get('resource')
  if (typeof label !== 'string' || label.trim().length < 2) {
    return NextResponse.json({ error: 'Enter a label for this resource.' }, { status: 400 })
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'Attach a PDF file.' }, { status: 400 })
  }
  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'The resource must be a PDF.' }, { status: 400 })
  }
  if (file.size > MAX_RESOURCE_BYTES) {
    return NextResponse.json({ error: 'The PDF must be smaller than 10MB.' }, { status: 400 })
  }

  const fileName = `${lesson.id}.pdf`
  mkdirSync(courseResourcesStorageDir(), { recursive: true })
  writeFileSync(courseResourceFilePath(fileName), Buffer.from(await file.arrayBuffer()))

  const updated = await db.courseLesson.update({
    where: { id: lesson.id },
    data: { resourceLabel: label.trim(), resourceFileName: fileName },
  })
  return NextResponse.json({ lesson: updated })
}
