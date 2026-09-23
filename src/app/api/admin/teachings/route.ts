import { NextRequest, NextResponse } from 'next/server'
import { mkdirSync } from 'fs'
import { rename, unlink } from 'fs/promises'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { requireCrmApi } from '@/services/crm/access'
import { db } from '@/lib/db'
import { slugify } from '@/lib/utils/slugify'
import { teachingsStorageDir, teachingFilePath } from '@/lib/api/teachings-storage'
import { TEACHING_CATEGORIES } from '@/lib/data/teaching-categories'
import { streamMultipartUpload, MultipartFileTooLargeError } from '@/lib/api/multipart-upload'
import { compressTeachingVideoInBackground } from '@/services/teachings/video-compression'
import {
  ALLOWED_VIDEO_TYPES,
  ALLOWED_THUMBNAIL_TYPES,
  MAX_PREVIEW_BYTES,
  saveTeachingThumbnailFromPath,
  saveTeachingPreviewFromPath,
} from '@/services/teachings/teaching-assets'

// Purely a policy ceiling now, not a memory-safety bound: the upload is
// streamed straight to disk as bytes arrive (see streamMultipartUpload),
// never buffered whole in memory, so this cap only guards against runaway
// storage use, not process memory.
const MAX_VIDEO_BYTES = 2 * 1024 * 1024 * 1024 // 2GB
const MAX_THUMBNAIL_BYTES = 15 * 1024 * 1024 // 15MB, generous for a cover image

const metaSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(5000),
  category: z.enum(TEACHING_CATEGORIES),
  priceKes: z.coerce.number().int().min(0).max(1_000_000),
  priceUsd: z.coerce.number().int().min(0).max(10_000),
  publish: z.coerce.boolean().optional(),
})

export async function GET() {
  if (!(await requireCrmApi('content:write'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const teachings = await db.teaching.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ teachings })
}

interface PendingUpload {
  fieldName: 'video' | 'thumbnail' | 'preview'
  tempPath: string
  ext: string
  mimeType: string
  claimed: boolean
}

export async function POST(request: NextRequest) {
  if (!(await requireCrmApi('content:write'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  mkdirSync(teachingsStorageDir(), { recursive: true })

  let videoTypeRejected = false
  let thumbnailTypeRejected = false
  let previewTypeRejected = false
  const pending: PendingUpload[] = []

  function destinationFor(fieldName: string, _fileName: string, mimeType: string) {
    if (fieldName === 'video') {
      const ext = ALLOWED_VIDEO_TYPES[mimeType]
      if (!ext) { videoTypeRejected = true; return null }
      const entry: PendingUpload = { fieldName: 'video', tempPath: teachingFilePath(`.upload-${randomUUID()}.${ext}`), ext, mimeType, claimed: false }
      pending.push(entry)
      return { path: entry.tempPath, maxBytes: MAX_VIDEO_BYTES }
    }
    if (fieldName === 'thumbnail') {
      const ext = ALLOWED_THUMBNAIL_TYPES[mimeType]
      if (!ext) { thumbnailTypeRejected = true; return null }
      const entry: PendingUpload = { fieldName: 'thumbnail', tempPath: teachingFilePath(`.upload-${randomUUID()}.${ext}`), ext, mimeType, claimed: false }
      pending.push(entry)
      return { path: entry.tempPath, maxBytes: MAX_THUMBNAIL_BYTES }
    }
    if (fieldName === 'preview') {
      const ext = ALLOWED_VIDEO_TYPES[mimeType]
      if (!ext) { previewTypeRejected = true; return null }
      const entry: PendingUpload = { fieldName: 'preview', tempPath: teachingFilePath(`.upload-${randomUUID()}.${ext}`), ext, mimeType, claimed: false }
      pending.push(entry)
      return { path: entry.tempPath, maxBytes: MAX_PREVIEW_BYTES }
    }
    return null
  }

  async function cleanupUnclaimed() {
    await Promise.all(
      pending.filter((entry) => !entry.claimed).map((entry) => unlink(entry.tempPath).catch(() => undefined))
    )
  }

  let fields: Record<string, string>
  try {
    const result = await streamMultipartUpload(request, destinationFor)
    fields = result.fields
  } catch (error) {
    if (error instanceof MultipartFileTooLargeError) {
      const label = error.fieldName === 'video' ? 'Video file' : error.fieldName === 'preview' ? 'Preview clip' : 'File'
      return NextResponse.json({ error: `${label} is too large.` }, { status: 413 })
    }
    return NextResponse.json({ error: 'Invalid form submission.' }, { status: 400 })
  }

  try {
    const parsed = metaSchema.safeParse(fields)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Fill in a title, description, category, and both prices.' },
        { status: 400 }
      )
    }

    const video = pending.find((entry) => entry.fieldName === 'video')
    if (videoTypeRejected) {
      return NextResponse.json({ error: 'Video must be MP4, WebM, or MOV.' }, { status: 400 })
    }
    if (!video) {
      return NextResponse.json({ error: 'Attach a video file.' }, { status: 400 })
    }
    if (thumbnailTypeRejected) {
      return NextResponse.json({ error: 'Thumbnail must be WebP, JPEG, or PNG.' }, { status: 400 })
    }
    if (previewTypeRejected) {
      return NextResponse.json({ error: 'Preview clip must be MP4, WebM, or MOV.' }, { status: 400 })
    }

    const baseSlug = slugify(parsed.data.title) || 'teaching'
    let slug = baseSlug
    let suffix = 2
    while (await db.teaching.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix}`
      suffix += 1
    }

    const rawVideoFileName = `${slug}.upload.${video.ext}`
    await rename(video.tempPath, teachingFilePath(rawVideoFileName))
    video.claimed = true

    let thumbnailPath: string | null = null
    const thumbnail = pending.find((entry) => entry.fieldName === 'thumbnail')
    if (thumbnail) {
      const result = await saveTeachingThumbnailFromPath(slug, thumbnail.tempPath, thumbnail.mimeType)
      thumbnail.claimed = true
      if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })
      thumbnailPath = result.value
    }

    let previewFileName: string | null = null
    const preview = pending.find((entry) => entry.fieldName === 'preview')
    if (preview) {
      const result = await saveTeachingPreviewFromPath(slug, preview.tempPath, preview.mimeType)
      preview.claimed = true
      if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })
      previewFileName = result.value
    }

    const teaching = await db.teaching.create({
      data: {
        slug,
        title: parsed.data.title,
        description: parsed.data.description,
        category: parsed.data.category,
        priceKes: parsed.data.priceKes,
        priceUsd: parsed.data.priceUsd,
        videoFileName: rawVideoFileName,
        thumbnailPath,
        previewFileName,
        processingStatus: 'processing',
        status: parsed.data.publish ? 'published' : 'draft',
      },
    })

    // Not awaited: the raw upload is already safely on disk and playable,
    // so the request returns now. Compression (which can take minutes on a
    // multi-GB file) keeps running in this long-lived server process and
    // updates the row itself when it finishes. See video-compression.ts.
    compressTeachingVideoInBackground({
      teachingId: teaching.id,
      rawPath: teachingFilePath(rawVideoFileName),
      rawFileName: rawVideoFileName,
      slug,
    }).catch(() => undefined)

    return NextResponse.json({ teaching })
  } finally {
    await cleanupUnclaimed()
  }
}
