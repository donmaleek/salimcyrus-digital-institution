/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('../../../../../lib/api/teachings-storage', () => ({
  teachingFilePath: jest.fn(() => '/tmp/fake-preview.mp4'),
  teachingFileExists: jest.fn(() => true),
  teachingFileSize: jest.fn(() => 1000),
}))
jest.mock('fs', () => ({ createReadStream: jest.fn(() => require('stream').Readable.from(['x'])) }))

import { GET } from './route'
import { teachingFileExists } from '@/lib/api/teachings-storage'

const mockFileExists = teachingFileExists as jest.Mock

function request(headers: Record<string, string> = {}) {
  return new NextRequest('https://salimcyrus.com/api/teachings/preview/x-preview.mp4', { headers })
}

describe('GET /api/teachings/preview/[fileName]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFileExists.mockReturnValue(true)
  })

  it('requires no authentication and no purchase (a preview is a separate, ungated teaser file)', async () => {
    const response = await GET(request(), { params: { fileName: 'x-preview.mp4' } })
    expect(response.status).toBe(200)
  })

  it('returns 404 when the preview file is missing on disk', async () => {
    mockFileExists.mockReturnValue(false)
    const response = await GET(request(), { params: { fileName: 'missing-preview.mp4' } })
    expect(response.status).toBe(404)
  })

  it('streams the full file with 200 when no Range header is sent', async () => {
    const response = await GET(request(), { params: { fileName: 'x-preview.mp4' } })
    expect(response.status).toBe(200)
    expect(response.headers.get('Accept-Ranges')).toBe('bytes')
  })

  it('returns 206 with a Content-Range for a partial request (seeking)', async () => {
    const response = await GET(request({ range: 'bytes=100-199' }), { params: { fileName: 'x-preview.mp4' } })
    expect(response.status).toBe(206)
    expect(response.headers.get('Content-Range')).toBe('bytes 100-199/1000')
    expect(response.headers.get('Content-Length')).toBe('100')
  })

  it('returns 416 for a range that exceeds the file size', async () => {
    const response = await GET(request({ range: 'bytes=900-1999' }), { params: { fileName: 'x-preview.mp4' } })
    expect(response.status).toBe(416)
  })

  it('is publicly cacheable, not private (a preview clip carries no paid content)', async () => {
    const response = await GET(request(), { params: { fileName: 'x-preview.mp4' } })
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600')
  })
})
