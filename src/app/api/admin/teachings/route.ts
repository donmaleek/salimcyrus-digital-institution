import { NextRequest, NextResponse } from 'next/server'
import { mkdirSync, writeFileSync } from 'fs'
import { z } from 'zod'
import { requireCrmApi } from '@/services/crm/access'
import { db } from '@/lib/db'
import { slugify } from '@/lib/utils/slugify'
import { teachingsStorageDir, teachingFilePath } from '@/lib/api/teachings-storage'
import { TEACHING_CATEGORIES } from '@/lib/data/teaching-categories'

const ALLOWED_VIDEO_TYPES: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
}
const ALLOWED_THUMBNAIL_TYPES = new Set(['image/webp', 'image/jpeg', 'image/png'])
// The whole upload is buffered in memory (formData()'s only option without a
// custom multipart streaming parser), so this cap also bounds peak memory
// use per upload. This server has plenty of headroom (60GB+) but it's
// shared with other unrelated sites, kept well below what would be
// individually safe to leave margin for them.
const MAX_VIDEO_BYTES = 2 * 1024 * 1024 * 1024 // 2GB

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

export async function POST(request: NextRequest) {
  if (!(await requireCrmApi('content:write'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const form = await request.formData().catch(() => null)
  if (!form) {
    return NextResponse.json({ error: 'Invalid form submission.' }, { status: 400 })
  }

  const parsed = metaSchema.safeParse({
    title: form.get('title'),
    description: form.get('description'),
    category: form.get('category'),
    priceKes: form.get('priceKes'),
    priceUsd: form.get('priceUsd'),
    publish: form.get('publish'),
  })
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Fill in a title, description, category, and both prices.' },
      { status: 400 }
    )
  }

  const videoFile = form.get('video')
  if (!(videoFile instanceof File) || videoFile.size === 0) {
    return NextResponse.json({ error: 'Attach a video file.' }, { status: 400 })
  }
  const videoExt = ALLOWED_VIDEO_TYPES[videoFile.type]
  if (!videoExt) {
    return NextResponse.json(
      { error: 'Video must be MP4, WebM, or MOV.' },
      { status: 400 }
    )
  }
  if (videoFile.size > MAX_VIDEO_BYTES) {
    return NextResponse.json({ error: 'Video file is too large.' }, { status: 413 })
  }

  const baseSlug = slugify(parsed.data.title) || 'teaching'
  let slug = baseSlug
  let suffix = 2
  while (await db.teaching.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix}`
    suffix += 1
  }

  const videoFileName = `${slug}.${videoExt}`
  mkdirSync(teachingsStorageDir(), { recursive: true })
  const videoBuffer = Buffer.from(await videoFile.arrayBuffer())
  writeFileSync(teachingFilePath(videoFileName), videoBuffer)

  let thumbnailPath: string | null = null
  const thumbnailFile = form.get('thumbnail')
  if (thumbnailFile instanceof File && thumbnailFile.size > 0) {
    if (!ALLOWED_THUMBNAIL_TYPES.has(thumbnailFile.type)) {
      return NextResponse.json(
        { error: 'Thumbnail must be WebP, JPEG, or PNG.' },
        { status: 400 }
      )
    }
    const thumbExt = thumbnailFile.type === 'image/png' ? 'png' : thumbnailFile.type === 'image/jpeg' ? 'jpg' : 'webp'
    const thumbFileName = `${slug}-thumb.${thumbExt}`
    // Written next to the video, under TEACHINGS_STORAGE_DIR, and served
    // through /api/teachings/thumbnail/[fileName] rather than /public:
    // Next.js's production server only recognizes /public files present
    // at process start, so anything written there after boot 404s until
    // the app is restarted. This route reads from disk on every request.
    mkdirSync(teachingsStorageDir(), { recursive: true })
    const thumbBuffer = Buffer.from(await thumbnailFile.arrayBuffer())
    writeFileSync(teachingFilePath(thumbFileName), thumbBuffer)
    thumbnailPath = `/api/teachings/thumbnail/${thumbFileName}`
  }

  const teaching = await db.teaching.create({
    data: {
      slug,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      priceKes: parsed.data.priceKes,
      priceUsd: parsed.data.priceUsd,
      videoFileName,
      thumbnailPath,
      status: parsed.data.publish ? 'published' : 'draft',
    },
  })

  return NextResponse.json({ teaching })
}
