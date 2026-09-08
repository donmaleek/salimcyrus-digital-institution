/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('../../../../../lib/auth', () => ({ authOptions: {} }))
jest.mock('../../../../../lib/db', () => ({
  db: { teaching: { findUnique: jest.fn() }, teachingPurchase: { findFirst: jest.fn() } },
}))
jest.mock('../../../../../lib/api/teachings-storage', () => ({
  teachingFilePath: jest.fn(() => '/tmp/fake-video.mp4'),
  teachingFileExists: jest.fn(() => true),
  teachingFileSize: jest.fn(() => 1000),
}))
jest.mock('fs', () => ({ createReadStream: jest.fn(() => require('stream').Readable.from(['x'])) }))

import { GET } from './route'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { teachingFileExists } from '@/lib/api/teachings-storage'

const mockGetServerSession = getServerSession as jest.Mock
const mockFindTeaching = db.teaching.findUnique as jest.Mock
const mockFindPurchase = db.teachingPurchase.findFirst as jest.Mock
const mockFileExists = teachingFileExists as jest.Mock

function request(headers: Record<string, string> = {}) {
  return new NextRequest('https://salimcyrus.com/api/teachings/stream/t1', { headers })
}

describe('GET /api/teachings/stream/[teachingId]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFileExists.mockReturnValue(true)
  })

  it('returns 401 when signed out', async () => {
    mockGetServerSession.mockResolvedValue(null)
    const response = await GET(request(), { params: { teachingId: 't1' } })
    expect(response.status).toBe(401)
  })

  it('returns 404 for an unpublished or unknown teaching', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindTeaching.mockResolvedValue({ id: 't1', status: 'draft' })
    const response = await GET(request(), { params: { teachingId: 't1' } })
    expect(response.status).toBe(404)
  })

  it('returns 403 when the caller has not purchased this teaching', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindTeaching.mockResolvedValue({ id: 't1', status: 'published', videoFileName: 'x.mp4' })
    mockFindPurchase.mockResolvedValue(null)
    const response = await GET(request(), { params: { teachingId: 't1' } })
    expect(response.status).toBe(403)
  })

  it('lets an admin stream without a purchase record (preview)', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'admin-1', isAdmin: true } })
    mockFindTeaching.mockResolvedValue({ id: 't1', status: 'published', videoFileName: 'x.mp4' })
    const response = await GET(request(), { params: { teachingId: 't1' } })
    expect(response.status).toBe(200)
    expect(mockFindPurchase).not.toHaveBeenCalled()
  })

  it('streams the full file with 200 when no Range header is sent', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindTeaching.mockResolvedValue({ id: 't1', status: 'published', videoFileName: 'x.mp4' })
    mockFindPurchase.mockResolvedValue({ id: 'purchase-1' })
    const response = await GET(request(), { params: { teachingId: 't1' } })
    expect(response.status).toBe(200)
    expect(response.headers.get('Accept-Ranges')).toBe('bytes')
  })

  it('returns 206 with a Content-Range for a partial request (seeking)', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindTeaching.mockResolvedValue({ id: 't1', status: 'published', videoFileName: 'x.mp4' })
    mockFindPurchase.mockResolvedValue({ id: 'purchase-1' })
    const response = await GET(request({ range: 'bytes=100-199' }), { params: { teachingId: 't1' } })
    expect(response.status).toBe(206)
    expect(response.headers.get('Content-Range')).toBe('bytes 100-199/1000')
    expect(response.headers.get('Content-Length')).toBe('100')
  })

  it('returns 416 for a range that exceeds the file size', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindTeaching.mockResolvedValue({ id: 't1', status: 'published', videoFileName: 'x.mp4' })
    mockFindPurchase.mockResolvedValue({ id: 'purchase-1' })
    const response = await GET(request({ range: 'bytes=900-1999' }), { params: { teachingId: 't1' } })
    expect(response.status).toBe(416)
  })

  it('returns 503 when the video file is missing on disk', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindTeaching.mockResolvedValue({ id: 't1', status: 'published', videoFileName: 'x.mp4' })
    mockFindPurchase.mockResolvedValue({ id: 'purchase-1' })
    mockFileExists.mockReturnValue(false)
    const response = await GET(request(), { params: { teachingId: 't1' } })
    expect(response.status).toBe(503)
  })
})
