import { NextRequest, NextResponse } from 'next/server'
import { mkdirSync, writeFileSync } from 'fs'
import { z } from 'zod'
import { requireCrmApi } from '@/services/crm/access'
import { db } from '@/lib/db'
import { coachingCategories } from '@/lib/data/coaching-offers'
import { coachingImagesStorageDir, coachingImageFilePath } from '@/lib/api/coaching-storage'
import { generateCategoryImage } from '@/lib/api/image-generation'

const requestSchema = z.object({
  prompt: z.string().trim().min(3).max(1000),
})

/**
 * Generates a category card image from a text prompt and saves it exactly
 * like a manual upload would (same storage path, same DB row), so the
 * picker can't tell the difference between an admin-uploaded photo and an
 * AI-generated one. Uses OpenAI when OPENAI_API_KEY is set, otherwise the
 * free Pollinations model, so it works with no credential configured.
 */
export async function POST(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  if (!(await requireCrmApi('content:write'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const params = await props.params
  if (!coachingCategories.some((category) => category.slug === params.slug)) {
    return NextResponse.json({ error: 'Unknown coaching category.' }, { status: 404 })
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter a prompt describing the image.' }, { status: 400 })
  }

  let generated: Awaited<ReturnType<typeof generateCategoryImage>>
  try {
    generated = await generateCategoryImage(parsed.data.prompt)
  } catch (error) {
    console.error('AI category image generation failed', {
      slug: params.slug,
      error: error instanceof Error ? error.message : error,
    })
    return NextResponse.json({ error: 'Could not generate that image. Please try again.' }, { status: 502 })
  }

  const fileName = `${params.slug}.${generated.extension}`
  mkdirSync(coachingImagesStorageDir(), { recursive: true })
  writeFileSync(coachingImageFilePath(fileName), generated.buffer)
  const imagePath = `/api/coaching/image/${fileName}`

  const image = await db.coachingCategoryImage.upsert({
    where: { categorySlug: params.slug },
    create: { categorySlug: params.slug, imagePath },
    update: { imagePath },
  })

  return NextResponse.json({ image })
}
