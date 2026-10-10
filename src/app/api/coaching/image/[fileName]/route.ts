import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { coachingImageFilePath, coachingImageFileExists } from '@/lib/api/coaching-storage'

function contentTypeFor(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (ext === 'png') return 'image/png'
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
  return 'image/webp'
}

/**
 * Serves an admin-uploaded coaching category card image read fresh from
 * disk on every request. Not a /public file: Next.js's production server
 * only recognizes files present in public/ at process start, so anything
 * uploaded afterward 404s until a restart (same fix already used for
 * teaching thumbnails and book covers). No access gate: these images are
 * meant to be publicly visible, exactly like every other marketing image
 * on the site.
 */
export async function GET(_request: Request, props: { params: Promise<{ fileName: string }> }) {
  const params = await props.params
  const fileName = params.fileName
  if (!coachingImageFileExists(fileName)) {
    return NextResponse.json({ error: 'Image not found.' }, { status: 404 })
  }

  const buffer = readFileSync(coachingImageFilePath(fileName))
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentTypeFor(fileName),
      'Content-Length': String(buffer.length),
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
