import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { bookFilePath, bookFileExists } from '@/lib/api/books-storage'

function contentTypeFor(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (ext === 'png') return 'image/png'
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
  return 'image/webp'
}

/**
 * Serves a book cover read fresh from disk on every request. Deliberately
 * not a /public file: Next.js's production server only recognizes files
 * present in public/ at process start, so anything an admin uploads
 * afterward 404s until the app is restarted (see the matching teaching
 * thumbnail route for the same reasoning). Covers are meant to be publicly
 * visible (unlike the PDF itself), so this route has no auth check, just
 * a real filesystem read each time.
 */
export async function GET(_request: Request, { params }: { params: { fileName: string } }) {
  const fileName = params.fileName
  if (!bookFileExists(fileName)) {
    return NextResponse.json({ error: 'Cover not found.' }, { status: 404 })
  }

  const buffer = readFileSync(bookFilePath(fileName))
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentTypeFor(fileName),
      'Content-Length': String(buffer.length),
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
