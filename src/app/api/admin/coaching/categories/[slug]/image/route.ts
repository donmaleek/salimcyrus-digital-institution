import { NextRequest, NextResponse } from 'next/server'
import { mkdirSync, writeFileSync } from 'fs'
import { requireCrmApi } from '@/services/crm/access'
import { db } from '@/lib/db'
import { coachingCategories } from '@/lib/data/coaching-offers'
import { coachingImagesStorageDir, coachingImageFilePath } from '@/lib/api/coaching-storage'

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
}
const MAX_IMAGE_BYTES = 8 * 1024 * 1024 // 8MB, generous for a card photo

/** Uploads (or replaces) the card image for one coaching category. */
export async function POST(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  if (!(await requireCrmApi('content:write'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const params = await props.params
  if (!coachingCategories.some((category) => category.slug === params.slug)) {
    return NextResponse.json({ error: 'Unknown coaching category.' }, { status: 404 })
  }

  const form = await request.formData().catch(() => null)
  if (!form) {
    return NextResponse.json({ error: 'Invalid form submission.' }, { status: 400 })
  }

  const imageFile = form.get('image')
  if (!(imageFile instanceof File) || imageFile.size === 0) {
    return NextResponse.json({ error: 'Attach an image.' }, { status: 400 })
  }
  const ext = ALLOWED_IMAGE_TYPES[imageFile.type]
  if (!ext) {
    return NextResponse.json({ error: 'Image must be WebP, JPEG, or PNG.' }, { status: 400 })
  }
  if (imageFile.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: 'Image is too large.' }, { status: 413 })
  }

  const fileName = `${params.slug}.${ext}`
  mkdirSync(coachingImagesStorageDir(), { recursive: true })
  const buffer = Buffer.from(await imageFile.arrayBuffer())
  writeFileSync(coachingImageFilePath(fileName), buffer)
  const imagePath = `/api/coaching/image/${fileName}`

  const image = await db.coachingCategoryImage.upsert({
    where: { categorySlug: params.slug },
    create: { categorySlug: params.slug, imagePath },
    update: { imagePath },
  })

  return NextResponse.json({ image })
}

/** Removes the uploaded image, reverting the category card to its built-in fallback. */
export async function DELETE(_request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  if (!(await requireCrmApi('content:write'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const params = await props.params
  await db.coachingCategoryImage.deleteMany({ where: { categorySlug: params.slug } })
  return NextResponse.json({ status: 'ok' })
}
