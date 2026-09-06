/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('../../../../../lib/db', () => ({
  db: {
    bookDownloadGrant: { findUnique: jest.fn(), update: jest.fn() },
  },
}))
jest.mock('../../../../../lib/api/books-storage', () => ({
  bookFileExists: jest.fn(),
  bookFilePath: jest.fn((name: string) => `/fake/storage/${name}`),
}))
jest.mock('fs', () => ({
  // A real (empty) Readable so Readable.toWeb() accepts it; none of these
  // tests need actual file bytes, just a valid stream shape.
  createReadStream: jest.fn(() => {
    const { Readable } = jest.requireActual('stream')
    return Readable.from([])
  }),
  statSync: jest.fn(() => ({ size: 1024 })),
}))

import { GET } from './route'
import { db } from '@/lib/db'
import { bookFileExists } from '@/lib/api/books-storage'
import { hashDownloadToken } from '@/lib/api/book-download-tokens'

const mockFindUnique = db.bookDownloadGrant.findUnique as jest.Mock
const mockUpdate = db.bookDownloadGrant.update as jest.Mock
const mockFileExists = bookFileExists as jest.Mock

function makeRequest() {
  return new NextRequest('https://salimcyrus.com/api/books/download/abc')
}

describe('GET /api/books/download/[token]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 404 when the token matches no grant', async () => {
    mockFindUnique.mockResolvedValue(null)

    const response = await GET(makeRequest(), { params: { token: 'unknown' } })

    expect(response.status).toBe(404)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('returns 410 when the grant has expired', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'g1',
      tokenExpiresAt: undefined,
      expiresAt: new Date('2020-01-01'),
      downloadCount: 0,
      maxDownloads: 5,
      purchase: { id: 'p1', bookSlug: 'the-cost-of-infidelity' },
    })

    const response = await GET(makeRequest(), { params: { token: 'abc' } })
    const body = await response.json()

    expect(response.status).toBe(410)
    expect(body.error).toMatch(/expired/i)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('returns 410 when the grant is exhausted', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'g1',
      expiresAt: new Date('2999-01-01'),
      downloadCount: 5,
      maxDownloads: 5,
      purchase: { id: 'p1', bookSlug: 'the-cost-of-infidelity' },
    })

    const response = await GET(makeRequest(), { params: { token: 'abc' } })
    const body = await response.json()

    expect(response.status).toBe(410)
    expect(body.error).toMatch(/limit/i)
  })

  it('returns 503 when the grant is valid but the file is missing on disk', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'g1',
      expiresAt: new Date('2999-01-01'),
      downloadCount: 0,
      maxDownloads: 5,
      purchase: { id: 'p1', bookSlug: 'the-cost-of-infidelity' },
    })
    mockFileExists.mockReturnValue(false)

    const response = await GET(makeRequest(), { params: { token: 'abc' } })

    expect(response.status).toBe(503)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('serves the file and increments downloadCount on a valid grant', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'g1',
      expiresAt: new Date('2999-01-01'),
      downloadCount: 1,
      maxDownloads: 5,
      purchase: { id: 'p1', bookSlug: 'the-cost-of-infidelity' },
    })
    mockFileExists.mockReturnValue(true)

    const response = await GET(makeRequest(), { params: { token: 'abc' } })

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/pdf')
    expect(response.headers.get('Content-Disposition')).toContain('the-cost-of-infidelity.pdf')
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'g1' },
      data: { downloadCount: { increment: 1 }, lastDownloadedAt: expect.any(Date) },
    })
  })

  it('looks up the grant by the SHA-256 hash of the raw token, never the raw token itself', async () => {
    mockFindUnique.mockResolvedValue(null)
    await GET(makeRequest(), { params: { token: 'my-raw-token' } })
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { tokenHash: hashDownloadToken('my-raw-token') },
      include: { purchase: true },
    })
  })
})
