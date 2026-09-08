import { NextRequest, NextResponse } from 'next/server'
import { createReadStream } from 'fs'
import { Readable } from 'stream'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { teachingFilePath, teachingFileExists, teachingFileSize } from '@/lib/api/teachings-storage'

function contentTypeFor(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (ext === 'webm') return 'video/webm'
  if (ext === 'mov') return 'video/quicktime'
  return 'video/mp4'
}

/**
 * Purchase-gated video streaming with HTTP Range support. Unlike the book
 * download route (a one-shot full-file download tied to an emailed,
 * count-limited token), a teaching is watched live in the browser by a
 * signed-in member. Access is a direct session + purchase check per
 * request, and Range support lets the player seek without downloading the
 * whole file first, which matters at video file sizes.
 */
export async function GET(request: NextRequest, { params }: { params: { teachingId: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin === true
  if (!userId) {
    return NextResponse.json({ error: 'Sign in to watch this teaching.' }, { status: 401 })
  }

  const teaching = await db.teaching.findUnique({ where: { id: params.teachingId } })
  if (!teaching || teaching.status !== 'published') {
    return NextResponse.json({ error: 'Teaching not found.' }, { status: 404 })
  }

  if (!isAdmin) {
    const purchase = await db.teachingPurchase.findFirst({
      where: { teachingId: teaching.id, userId },
    })
    if (!purchase) {
      return NextResponse.json({ error: 'Purchase this teaching to watch it.' }, { status: 403 })
    }
  }

  if (!teachingFileExists(teaching.videoFileName)) {
    console.error('Teaching stream: file missing', { teachingId: teaching.id })
    return NextResponse.json(
      { error: 'This video is temporarily unavailable. Contact support for help.' },
      { status: 503 }
    )
  }

  const filePath = teachingFilePath(teaching.videoFileName)
  const fileSize = teachingFileSize(teaching.videoFileName)
  const contentType = contentTypeFor(teaching.videoFileName)
  const range = request.headers.get('range')

  if (!range) {
    const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream
    return new NextResponse(stream, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(fileSize),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'private, no-store',
      },
    })
  }

  const match = /bytes=(\d*)-(\d*)/.exec(range)
  if (!match) {
    return NextResponse.json({ error: 'Invalid range header.' }, { status: 416 })
  }
  const start = match[1] ? parseInt(match[1], 10) : 0
  const end = match[2] ? parseInt(match[2], 10) : fileSize - 1
  if (Number.isNaN(start) || Number.isNaN(end) || start > end || end >= fileSize) {
    return new NextResponse(null, { status: 416, headers: { 'Content-Range': `bytes */${fileSize}` } })
  }

  const chunkSize = end - start + 1
  const stream = Readable.toWeb(createReadStream(filePath, { start, end })) as ReadableStream

  return new NextResponse(stream, {
    status: 206,
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(chunkSize),
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'private, no-store',
    },
  })
}
