/**
 * @jest-environment node
 */
jest.mock('fs', () => ({
  readFileSync: jest.fn(() => Buffer.from('fake image bytes')),
}))
jest.mock('../../../../../lib/api/teachings-storage', () => ({
  teachingFilePath: jest.fn((name: string) => `/teachings/${name}`),
  teachingFileExists: jest.fn(),
}))

import { GET } from './route'
import { teachingFileExists } from '@/lib/api/teachings-storage'

const mockFileExists = teachingFileExists as jest.Mock

describe('GET /api/teachings/thumbnail/[fileName]', () => {
  beforeEach(() => jest.clearAllMocks())

  it('requires no authentication (thumbnails are public, unlike the video itself)', async () => {
    mockFileExists.mockReturnValue(true)
    const response = await GET(new Request('https://salimcyrus.com/x'), {
      params: { fileName: 'leading-a-family-thumb.webp' },
    })
    expect(response.status).toBe(200)
  })

  it('returns 404 when the thumbnail is missing on disk', async () => {
    mockFileExists.mockReturnValue(false)
    const response = await GET(new Request('https://salimcyrus.com/x'), {
      params: { fileName: 'missing-thumb.webp' },
    })
    expect(response.status).toBe(404)
  })

  it('reads the file fresh from disk on every request, not from a build-time snapshot', async () => {
    const { readFileSync } = jest.requireMock('fs')
    mockFileExists.mockReturnValue(true)
    await GET(new Request('https://salimcyrus.com/x'), { params: { fileName: 'leading-a-family-thumb.png' } })
    expect(readFileSync).toHaveBeenCalledWith('/teachings/leading-a-family-thumb.png')
  })

  it('sets the correct content type per extension', async () => {
    mockFileExists.mockReturnValue(true)
    const png = await GET(new Request('https://salimcyrus.com/x'), { params: { fileName: 'a-thumb.png' } })
    expect(png.headers.get('Content-Type')).toBe('image/png')
    const jpg = await GET(new Request('https://salimcyrus.com/x'), { params: { fileName: 'a-thumb.jpg' } })
    expect(jpg.headers.get('Content-Type')).toBe('image/jpeg')
    const webp = await GET(new Request('https://salimcyrus.com/x'), { params: { fileName: 'a-thumb.webp' } })
    expect(webp.headers.get('Content-Type')).toBe('image/webp')
  })

  it('is publicly cacheable, not private (thumbnails carry no purchase-gated content)', async () => {
    mockFileExists.mockReturnValue(true)
    const response = await GET(new Request('https://salimcyrus.com/x'), {
      params: { fileName: 'leading-a-family-thumb.webp' },
    })
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600')
  })
})
