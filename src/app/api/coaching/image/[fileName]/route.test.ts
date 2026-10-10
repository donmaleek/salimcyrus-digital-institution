/**
 * @jest-environment node
 */
jest.mock('fs', () => ({
  readFileSync: jest.fn(() => Buffer.from('fake image bytes')),
}))
jest.mock('../../../../../lib/api/coaching-storage', () => ({
  coachingImageFilePath: jest.fn((name: string) => `/coaching-images/${name}`),
  coachingImageFileExists: jest.fn(),
}))

import { GET } from './route'
import { coachingImageFileExists } from '@/lib/api/coaching-storage'

const mockFileExists = coachingImageFileExists as jest.Mock

describe('GET /api/coaching/image/[fileName]', () => {
  beforeEach(() => jest.clearAllMocks())

  it('requires no authentication (category images are public marketing images)', async () => {
    mockFileExists.mockReturnValue(true)
    const response = await GET(new Request('https://salimcyrus.com/x'), {
      params: Promise.resolve({ fileName: 'identity-alignment.webp' }),
    })
    expect(response.status).toBe(200)
  })

  it('returns 404 when the image is missing on disk', async () => {
    mockFileExists.mockReturnValue(false)
    const response = await GET(new Request('https://salimcyrus.com/x'), {
      params: Promise.resolve({ fileName: 'missing.webp' }),
    })
    expect(response.status).toBe(404)
  })

  it('reads the file fresh from disk on every request, not from a build-time snapshot', async () => {
    const { readFileSync } = jest.requireMock('fs')
    mockFileExists.mockReturnValue(true)
    await GET(new Request('https://salimcyrus.com/x'), { params: Promise.resolve({ fileName: 'couples.png' }) })
    expect(readFileSync).toHaveBeenCalledWith('/coaching-images/couples.png')
  })

  it('sets the correct content type per extension', async () => {
    mockFileExists.mockReturnValue(true)
    const png = await GET(new Request('https://salimcyrus.com/x'), { params: Promise.resolve({ fileName: 'a.png' }) })
    expect(png.headers.get('Content-Type')).toBe('image/png')
    const jpg = await GET(new Request('https://salimcyrus.com/x'), { params: Promise.resolve({ fileName: 'a.jpg' }) })
    expect(jpg.headers.get('Content-Type')).toBe('image/jpeg')
    const webp = await GET(new Request('https://salimcyrus.com/x'), { params: Promise.resolve({ fileName: 'a.webp' }) })
    expect(webp.headers.get('Content-Type')).toBe('image/webp')
  })

  it('is publicly cacheable', async () => {
    mockFileExists.mockReturnValue(true)
    const response = await GET(new Request('https://salimcyrus.com/x'), {
      params: Promise.resolve({ fileName: 'identity-alignment.webp' }),
    })
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600')
  })
})
