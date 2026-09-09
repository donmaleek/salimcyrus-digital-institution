import { NextRequest, NextResponse } from 'next/server'
import { createReadStream } from 'fs'
import { Readable } from 'stream'
import { teachingFilePath, teachingFileExists, teachingFileSize } from '@/lib/api/teachings-storage'

function contentTypeFor(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (ext === 'webm') return 'video/webm'
  if (ext === 'mov') return 'video/quicktime'
  return 'video/mp4'
}

/**
 * Streams a short, ungated teaser clip with Range support, so the browser
 * can play it on hover (like a YouTube preview) without buffering the
 * whole thing first. Deliberately no auth check and no purchase check:
 * this is a separate, purpose-made teaser file (previewFileName), never
 * the actual purchase-gated teaching (videoFileName, served only by
 * /api/teachings/stream/[teachingId]) — playing this can never leak paid
 * content, because the paid video is never written here.
 */
export async function GET(request: NextRequest, { params }: { params: { fileName: string } }) {
  const fileName = params.fileName
  if (!teachingFileExists(fileName)) {
    return NextResponse.json({ error: 'Preview not found.' }, { status: 404 })
  }

  const filePath = teachingFilePath(fileName)
  const fileSize = teachingFileSize(fileName)
  const contentType = contentTypeFor(fileName)
  const range = request.headers.get('range')

  if (!range) {
    const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream
    return new NextResponse(stream, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(fileSize),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
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
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
