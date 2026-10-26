/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('fs', () => ({
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}))
jest.mock('../../../../../../../../services/crm/access', () => ({
  requireCrmApi: jest.fn(),
}))
jest.mock('../../../../../../../../lib/db', () => ({
  db: { coachingCategoryImage: { upsert: jest.fn() } },
}))
jest.mock('../../../../../../../../lib/api/image-generation', () => ({
  generateCategoryImage: jest.fn(),
}))

import { POST } from './route'
import { requireCrmApi } from '@/services/crm/access'
import { db } from '@/lib/db'
import { generateCategoryImage } from '@/lib/api/image-generation'
import { writeFileSync } from 'fs'

const mockRequireCrmApi = requireCrmApi as jest.Mock
const mockUpsert = db.coachingCategoryImage.upsert as jest.Mock
const mockGenerateImage = generateCategoryImage as jest.Mock
const mockWriteFileSync = writeFileSync as jest.Mock

function params(slug: string) {
  return { params: Promise.resolve({ slug }) }
}

function request(body: unknown) {
  return new NextRequest('https://salimcyrus.com/api/admin/coaching/categories/identity-alignment/image/generate', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

describe('POST /api/admin/coaching/categories/[slug]/image/generate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireCrmApi.mockResolvedValue(true)
    mockUpsert.mockResolvedValue({ categorySlug: 'identity-alignment', imagePath: '/api/coaching/image/identity-alignment.png' })
    mockGenerateImage.mockResolvedValue({ buffer: Buffer.from('fake png bytes'), extension: 'png', provider: 'free' })
  })

  it('returns 403 without the content:write permission', async () => {
    mockRequireCrmApi.mockResolvedValue(false)
    const response = await POST(request({ prompt: 'a gold compass' }), params('identity-alignment'))
    expect(response.status).toBe(403)
    expect(mockGenerateImage).not.toHaveBeenCalled()
  })

  it('works with no API key configured, because the free model needs none', async () => {
    delete process.env.OPENAI_API_KEY
    const response = await POST(request({ prompt: 'a gold compass' }), params('identity-alignment'))
    expect(response.status).toBe(200)
    expect(mockGenerateImage).toHaveBeenCalledWith('a gold compass')
  })

  it('returns 404 for an unknown category slug', async () => {
    const response = await POST(request({ prompt: 'a gold compass' }), params('not-a-real-category'))
    expect(response.status).toBe(404)
    expect(mockGenerateImage).not.toHaveBeenCalled()
  })

  it('returns 400 for a missing or too-short prompt', async () => {
    const response = await POST(request({ prompt: 'x' }), params('identity-alignment'))
    expect(response.status).toBe(400)
    expect(mockGenerateImage).not.toHaveBeenCalled()
  })

  it('generates the image, saves it to the category slug filename, and upserts the same DB row a manual upload would', async () => {
    const response = await POST(request({ prompt: 'a minimalist gold compass on navy' }), params('identity-alignment'))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(mockGenerateImage).toHaveBeenCalledWith('a minimalist gold compass on navy')
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      expect.stringContaining('identity-alignment.png'),
      expect.any(Buffer)
    )
    expect(mockUpsert).toHaveBeenCalledWith({
      where: { categorySlug: 'identity-alignment' },
      create: { categorySlug: 'identity-alignment', imagePath: '/api/coaching/image/identity-alignment.png' },
      update: { imagePath: '/api/coaching/image/identity-alignment.png' },
    })
    expect(payload.image.imagePath).toBe('/api/coaching/image/identity-alignment.png')
  })

  it('returns 502 and never writes a file when the API call fails, so a failed generation never leaves a corrupt image on disk', async () => {
    mockGenerateImage.mockRejectedValue(new Error('rate limited'))
    const response = await POST(request({ prompt: 'a gold compass' }), params('identity-alignment'))
    expect(response.status).toBe(502)
    expect(mockWriteFileSync).not.toHaveBeenCalled()
    expect(mockUpsert).not.toHaveBeenCalled()
  })

  it('saves a JPEG from the free model under a .jpg name, so the serving route sends the right content type', async () => {
    mockGenerateImage.mockResolvedValue({ buffer: Buffer.from('jpeg bytes'), extension: 'jpg', provider: 'free' })
    mockUpsert.mockResolvedValue({ categorySlug: 'identity-alignment', imagePath: '/api/coaching/image/identity-alignment.jpg' })
    const response = await POST(request({ prompt: 'a gold compass' }), params('identity-alignment'))
    expect(response.status).toBe(200)
    expect(mockWriteFileSync).toHaveBeenCalledWith(expect.stringContaining('identity-alignment.jpg'), expect.any(Buffer))
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: { imagePath: '/api/coaching/image/identity-alignment.jpg' } })
    )
  })
})
