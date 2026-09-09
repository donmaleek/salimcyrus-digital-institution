import { NextRequest, NextResponse } from 'next/server'
import { mkdirSync, writeFileSync } from 'fs'
import { z } from 'zod'
import { requireCrmApi } from '@/services/crm/access'
import { db } from '@/lib/db'
import { books } from '@/lib/data/books'
import { slugify } from '@/lib/utils/slugify'
import { booksStorageDir, bookFilePath } from '@/lib/api/books-storage'

const ALLOWED_PDF_TYPE = 'application/pdf'
const ALLOWED_COVER_TYPES = new Set(['image/webp', 'image/jpeg', 'image/png'])
const MAX_PDF_BYTES = 200 * 1024 * 1024 // 200MB, generous for a text-heavy PDF
const MAX_COVER_BYTES = 8 * 1024 * 1024 // 8MB

const metaSchema = z.object({
  title: z.string().trim().min(1).max(200),
  subtitle: z.string().trim().max(200).optional(),
  description: z.string().trim().min(1).max(5000),
  priceKes: z.coerce.number().int().min(1).max(1_000_000),
  priceUsd: z.coerce.number().int().min(1).max(10_000),
  pageCount: z.coerce.number().int().min(1).max(5000).optional(),
  publish: z.coerce.boolean().optional(),
})

export async function GET() {
  if (!(await requireCrmApi('content:write'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const uploadedBooks = await db.book.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ books: uploadedBooks })
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
    subtitle: form.get('subtitle') || undefined,
    description: form.get('description'),
    priceKes: form.get('priceKes'),
    priceUsd: form.get('priceUsd'),
    pageCount: form.get('pageCount') || undefined,
    publish: form.get('publish'),
  })
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Fill in a title, description, and both prices.' },
      { status: 400 }
    )
  }

  const pdfFile = form.get('pdf')
  if (!(pdfFile instanceof File) || pdfFile.size === 0) {
    return NextResponse.json({ error: 'Attach the book PDF.' }, { status: 400 })
  }
  if (pdfFile.type !== ALLOWED_PDF_TYPE) {
    return NextResponse.json({ error: 'The book file must be a PDF.' }, { status: 400 })
  }
  if (pdfFile.size > MAX_PDF_BYTES) {
    return NextResponse.json({ error: 'PDF file is too large.' }, { status: 413 })
  }

  const coverFile = form.get('cover')
  if (!(coverFile instanceof File) || coverFile.size === 0) {
    return NextResponse.json({ error: 'Attach a cover image.' }, { status: 400 })
  }
  const coverExt =
    coverFile.type === 'image/png' ? 'png' : coverFile.type === 'image/jpeg' ? 'jpg' : coverFile.type === 'image/webp' ? 'webp' : null
  if (!coverExt || !ALLOWED_COVER_TYPES.has(coverFile.type)) {
    return NextResponse.json({ error: 'Cover must be a WebP, JPEG, or PNG image.' }, { status: 400 })
  }
  if (coverFile.size > MAX_COVER_BYTES) {
    return NextResponse.json({ error: 'Cover image is too large.' }, { status: 413 })
  }

  const baseSlug = slugify(parsed.data.title) || 'book'
  let slug = baseSlug
  let suffix = 2
  const slugTaken = async (candidate: string) =>
    books.some((b) => b.slug === candidate) || Boolean(await db.book.findUnique({ where: { slug: candidate } }))
  while (await slugTaken(slug)) {
    slug = `${baseSlug}-${suffix}`
    suffix += 1
  }

  const fileName = `${slug}.pdf`
  mkdirSync(booksStorageDir(), { recursive: true })
  const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer())
  writeFileSync(bookFilePath(fileName), pdfBuffer)

  const coverFileName = `${slug}.${coverExt}`
  const publicDir = `${process.cwd()}/public/images/books`
  mkdirSync(publicDir, { recursive: true })
  const coverBuffer = Buffer.from(await coverFile.arrayBuffer())
  writeFileSync(`${publicDir}/${coverFileName}`, coverBuffer)
  const coverPath = `/images/books/${coverFileName}`

  const book = await db.book.create({
    data: {
      slug,
      title: parsed.data.title,
      subtitle: parsed.data.subtitle,
      description: parsed.data.description,
      priceKes: parsed.data.priceKes,
      priceUsd: parsed.data.priceUsd,
      pageCount: parsed.data.pageCount,
      fileName,
      coverPath,
      status: parsed.data.publish ? 'available' : 'draft',
    },
  })

  return NextResponse.json({ book })
}
