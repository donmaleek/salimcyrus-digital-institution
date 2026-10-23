import { NextRequest, NextResponse } from 'next/server'
import { mkdirSync } from 'fs'
import { rename, unlink } from 'fs/promises'
import { randomUUID } from 'crypto'
import { requireCrmApi } from '@/services/crm/access'
import { db } from '@/lib/db'
import { courseVideosStorageDir, courseVideoFilePath } from '@/lib/api/course-videos-storage'
import { streamMultipartUpload, MultipartFileTooLargeError } from '@/lib/api/multipart-upload'
import { compressCourseVideoInBackground } from '@/services/courses/video-compression'

const ALLOWED_VIDEO_TYPES: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
}
// Streamed straight to disk as bytes arrive (see streamMultipartUpload),
// never buffered whole in memory, so this is a storage-policy ceiling,
// not a memory-safety bound. Same limit as teaching video uploads.
const MAX_VIDEO_BYTES = 2 * 1024 * 1024 * 1024 // 2GB

/**
 * Uploads (or replaces) the self-hosted video for one lesson, the secure
 * alternative to the legacy videoUrl iframe embed: the raw file is saved
 * immediately so the lesson is playable right away, then background
 * ffmpeg compression (see video-compression.ts) re-encodes it to the same
 * standard used for teaching videos and flips videoProcessingStatus to
 * 'ready'. Only ever reachable for a lesson that already exists (see
 * CourseEditor: a brand-new, unsaved lesson draft has no id yet).
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

  mkdirSync(courseVideosStorageDir(), { recursive: true })

  let videoTypeRejected = false
  let tempPath: string | null = null
  let tempExt = ''
  let claimed = false

  function destinationFor(fieldName: string, _fileName: string, mimeType: string) {
    if (fieldName !== 'video') return null
    const ext = ALLOWED_VIDEO_TYPES[mimeType]
    if (!ext) { videoTypeRejected = true; return null }
    tempExt = ext
    tempPath = courseVideoFilePath(`.upload-${randomUUID()}.${ext}`)
    return { path: tempPath, maxBytes: MAX_VIDEO_BYTES }
  }

  try {
    await streamMultipartUpload(request, destinationFor)
  } catch (error) {
    if (error instanceof MultipartFileTooLargeError) {
      return NextResponse.json({ error: 'Video file is too large.' }, { status: 413 })
    }
    return NextResponse.json({ error: 'Invalid form submission.' }, { status: 400 })
  }

  try {
    if (videoTypeRejected) {
      return NextResponse.json({ error: 'Video must be MP4, WebM, or MOV.' }, { status: 400 })
    }
    if (!tempPath) {
      return NextResponse.json({ error: 'Attach a video file.' }, { status: 400 })
    }

    const rawFileName = `${lesson.id}.upload.${tempExt}`
    await rename(tempPath, courseVideoFilePath(rawFileName))
    claimed = true

    const updated = await db.courseLesson.update({
      where: { id: lesson.id },
      data: { videoFileName: rawFileName, videoProcessingStatus: 'processing' },
    })

    // Not awaited: the raw upload is already safely on disk and playable,
    // so the request returns now. See video-compression.ts.
    compressCourseVideoInBackground({
      lessonId: lesson.id,
      rawPath: courseVideoFilePath(rawFileName),
      rawFileName,
    }).catch(() => undefined)

    return NextResponse.json({ lesson: updated })
  } finally {
    if (tempPath && !claimed) {
      await unlink(tempPath).catch(() => undefined)
    }
  }
}
