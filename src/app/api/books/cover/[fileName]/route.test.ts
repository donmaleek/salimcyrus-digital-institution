/**
 * @jest-environment node
 */
jest.mock('fs', () => ({
  readFileSync: jest.fn(() => Buffer.from('fake image bytes')),
}))
jest.mock('../../../../../lib/api/books-storage', () => ({
  bookFilePath: jest.fn((name: string) => `/books/${name}`),
  bookFileExists: jest.fn(),
}))

import { GET } from './route'
import { bookFileExists } from '@/lib/api/books-storage'

const mockFileExists = bookFileExists as jest.Mock

describe('GET /api/books/cover/[fileName]', () => {
  beforeEach(() => jest.clearAllMocks())

  it('requires no authentication (covers are public, unlike the PDF itself)', async () => {
    mockFileExists.mockReturnValue(true)
    const response = await GET(new Request('https://salimcyrus.com/x'), {
      params: { fileName: 'leading-a-family-cover.webp' },
    })
    expect(response.status).toBe(200)
  })

  it('returns 404 when the cover is missing on disk', async () => {
    mockFileExists.mockReturnValue(false)
    const response = await GET(new Request('https://salimcyrus.com/x'), {
      params: { fileName: 'missing-cover.webp' },
    })
    expect(response.status).toBe(404)
  })

  it('reads the file fresh from disk on every request, not from a build-time snapshot', async () => {
    const { readFileSync } = jest.requireMock('fs')
    mockFileExists.mockReturnValue(true)
    await GET(new Request('https://salimcyrus.com/x'), { params: { fileName: 'leading-a-family-cover.png' } })
    expect(readFileSync).toHaveBeenCalledWith('/books/leading-a-family-cover.png')
  })

  it('sets the correct content type per extension', async () => {
    mockFileExists.mockReturnValue(true)
    const png = await GET(new Request('https://salimcyrus.com/x'), { params: { fileName: 'a-cover.png' } })
    expect(png.headers.get('Content-Type')).toBe('image/png')
    const jpg = await GET(new Request('https://salimcyrus.com/x'), { params: { fileName: 'a-cover.jpg' } })
    expect(jpg.headers.get('Content-Type')).toBe('image/jpeg')
    const webp = await GET(new Request('https://salimcyrus.com/x'), { params: { fileName: 'a-cover.webp' } })
    expect(webp.headers.get('Content-Type')).toBe('image/webp')
  })

  it('is publicly cacheable, not private (covers carry no purchase-gated content)', async () => {
    mockFileExists.mockReturnValue(true)
    const response = await GET(new Request('https://salimcyrus.com/x'), {
      params: { fileName: 'leading-a-family-cover.webp' },
    })
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600')
  })
})
