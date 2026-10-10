import { NextRequest, NextResponse } from 'next/server'
import { mkdirSync, writeFileSync, unlink } from 'fs'
import { promisify } from 'util'
import { z } from 'zod'
import { requireCrmApi } from '@/services/crm/access'
import { db } from '@/lib/db'
import { booksStorageDir, bookFilePath } from '@/lib/api/books-storage'
import { BOOK_MAX_PRICE_KES } from '@/lib/data/books'

const updateSchema = z.object({
  status: z.enum(['draft', 'available']),
})

const ALLOWED_PDF_TYPE = 'application/pdf'
const ALLOWED_COVER_TYPES = new Set(['image/webp', 'image/jpeg', 'image/png'])
const MAX_PDF_BYTES = 200 * 1024 * 1024
const MAX_COVER_BYTES = 8 * 1024 * 1024

const unlinkAsync = promisify(unlink)

const editSchema = z.object({
  title: z.string().trim().min(1).max(200),
  subtitle: z.string().trim().max(200).optional(),
  description: z.string().trim().min(1).max(5000),
  priceKes: z.coerce.number().int().min(1).max(BOOK_MAX_PRICE_KES),
  priceUsd: z.coerce.number().int().min(1).max(10_000),
  pageCount: z.coerce.number().int().min(1).max(5000).optional(),
})

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  if (!(await requireCrmApi('content:write'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const parsed = updateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const existing = await db.book.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const book = await db.book.update({
    where: { id: params.id },
    data: { status: parsed.data.status },
  })

  return NextResponse.json({ book })
}

/**
 * Full metadata edit, with the PDF and/or cover optionally replaced
 * in place (same slug, same final filenames) rather than requiring the
 * book be deleted and re-uploaded. The slug itself never changes on
 * edit: purchases, download grants, and the public URL all key off it.
 */
export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  if (!(await requireCrmApi('content:write'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const existing = await db.book.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const form = await request.formData().catch(() => null)
  if (!form) {
    return NextResponse.json({ error: 'Invalid form submission.' }, { status: 400 })
  }

  const parsed = editSchema.safeParse({
    title: form.get('title'),
    subtitle: form.get('subtitle') || undefined,
    description: form.get('description'),
    priceKes: form.get('priceKes'),
    priceUsd: form.get('priceUsd'),
    pageCount: form.get('pageCount') || undefined,
  })
  if (!parsed.success) {
    return NextResponse.json(
      { error: `Fill in a title, description, and both prices (KES capped at ${BOOK_MAX_PRICE_KES}).` },
      { status: 400 }
    )
  }

  mkdirSync(booksStorageDir(), { recursive: true })

  let fileName = existing.fileName
  const pdfFile = form.get('pdf')
  if (pdfFile instanceof File && pdfFile.size > 0) {
    if (pdfFile.type !== ALLOWED_PDF_TYPE) {
      return NextResponse.json({ error: 'The book file must be a PDF.' }, { status: 400 })
    }
    if (pdfFile.size > MAX_PDF_BYTES) {
      return NextResponse.json({ error: 'PDF file is too large.' }, { status: 413 })
    }
    const buffer = Buffer.from(await pdfFile.arrayBuffer())
    writeFileSync(bookFilePath(fileName), buffer)
  }

  let coverPath = existing.coverPath
  const coverFile = form.get('cover')
  if (coverFile instanceof File && coverFile.size > 0) {
    const coverExt =
      coverFile.type === 'image/png' ? 'png' : coverFile.type === 'image/jpeg' ? 'jpg' : coverFile.type === 'image/webp' ? 'webp' : null
    if (!coverExt || !ALLOWED_COVER_TYPES.has(coverFile.type)) {
      return NextResponse.json({ error: 'Cover must be a WebP, JPEG, or PNG image.' }, { status: 400 })
    }
    if (coverFile.size > MAX_COVER_BYTES) {
      return NextResponse.json({ error: 'Cover image is too large.' }, { status: 413 })
    }
    const newCoverFileName = `${existing.slug}-cover.${coverExt}`
    const buffer = Buffer.from(await coverFile.arrayBuffer())
    writeFileSync(bookFilePath(newCoverFileName), buffer)

    const previousCoverFileName = existing.coverPath.split('/').pop()
    if (previousCoverFileName && previousCoverFileName !== newCoverFileName) {
      await unlinkAsync(bookFilePath(previousCoverFileName)).catch(() => undefined)
    }
    coverPath = `/api/books/cover/${newCoverFileName}`
  }

  const book = await db.book.update({
    where: { id: params.id },
    data: {
      title: parsed.data.title,
      subtitle: parsed.data.subtitle,
      description: parsed.data.description,
      priceKes: parsed.data.priceKes,
      priceUsd: parsed.data.priceUsd,
      pageCount: parsed.data.pageCount,
      fileName,
      coverPath,
    },
  })

  return NextResponse.json({ book })
}

export async function DELETE(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  if (!(await requireCrmApi('content:write'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const existing = await db.book.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await db.book.delete({ where: { id: params.id } })
  return NextResponse.json({ status: 'ok' })
}
