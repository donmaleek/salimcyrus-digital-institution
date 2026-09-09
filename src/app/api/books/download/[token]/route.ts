import { NextRequest, NextResponse } from 'next/server'
import { createReadStream, statSync } from 'fs'
import { Readable } from 'stream'
import { db } from '@/lib/db'
import { getBookBySlug } from '@/lib/data/book-catalog'
import { hashDownloadToken, checkDownloadGrant } from '@/lib/api/book-download-tokens'
import { bookFilePath, bookFileExists } from '@/lib/api/books-storage'

const GRANT_ERROR_MESSAGES: Record<'expired' | 'exhausted', string> = {
  expired:
    'This download link has expired. Reply to your purchase email or contact support for a new one.',
  exhausted:
    'This download link has reached its download limit. Contact support if you need another copy.',
}

interface RouteParams {
  params: { token: string }
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const tokenHash = hashDownloadToken(params.token)
  const grant = await db.bookDownloadGrant.findUnique({
    where: { tokenHash },
    include: { purchase: true },
  })

  if (!grant) {
    return NextResponse.json({ error: 'Download link not found.' }, { status: 404 })
  }

  const status = checkDownloadGrant(grant)
  if (status !== 'ok') {
    return NextResponse.json({ error: GRANT_ERROR_MESSAGES[status] }, { status: 410 })
  }

  const book = await getBookBySlug(grant.purchase.bookSlug)
  if (!book?.fileName || !bookFileExists(book.fileName)) {
    console.error('Book download: file missing for purchase', {
      purchaseId: grant.purchase.id,
      bookSlug: grant.purchase.bookSlug,
    })
    return NextResponse.json(
      { error: 'This book file is temporarily unavailable. Contact support for help.' },
      { status: 503 }
    )
  }

  await db.bookDownloadGrant.update({
    where: { id: grant.id },
    data: { downloadCount: { increment: 1 }, lastDownloadedAt: new Date() },
  })

  const filePath = bookFilePath(book.fileName)
  const { size } = statSync(filePath)
  const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Length': String(size),
      'Content-Disposition': `attachment; filename="${book.slug}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
