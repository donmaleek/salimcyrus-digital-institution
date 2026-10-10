/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('fs', () => ({
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}))
jest.mock('../../../../../../../services/crm/access', () => ({
  requireCrmApi: jest.fn(),
}))
jest.mock('../../../../../../../lib/db', () => ({
  db: { coachingCategoryImage: { upsert: jest.fn(), deleteMany: jest.fn() } },
}))

import { POST, DELETE } from './route'
import { requireCrmApi } from '@/services/crm/access'
import { db } from '@/lib/db'
import { mkdirSync, writeFileSync } from 'fs'

const mockRequireCrmApi = requireCrmApi as jest.Mock
const mockUpsert = db.coachingCategoryImage.upsert as jest.Mock
const mockDeleteMany = db.coachingCategoryImage.deleteMany as jest.Mock
const mockWriteFileSync = writeFileSync as jest.Mock
const mockMkdirSync = mkdirSync as jest.Mock

function params(slug: string) {
  return { params: Promise.resolve({ slug }) }
}

function buildForm(image?: File) {
  const form = new FormData()
  if (image) form.set('image', image)
  return form
}

function request(form: FormData) {
  return new NextRequest('https://salimcyrus.com/api/admin/coaching/categories/identity-alignment/image', {
    method: 'POST',
    body: form,
  })
}

describe('POST /api/admin/coaching/categories/[slug]/image', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireCrmApi.mockResolvedValue(true)
    mockUpsert.mockResolvedValue({ categorySlug: 'identity-alignment', imagePath: '/api/coaching/image/identity-alignment.webp' })
  })

  it('returns 403 without the content:write permission', async () => {
    mockRequireCrmApi.mockResolvedValue(false)
    const image = new File([Buffer.from('fake image')], 'cover.webp', { type: 'image/webp' })
    const response = await POST(request(buildForm(image)), params('identity-alignment'))
    expect(response.status).toBe(403)
    expect(mockUpsert).not.toHaveBeenCalled()
  })

  it('returns 404 for an unknown category slug', async () => {
    const image = new File([Buffer.from('fake image')], 'cover.webp', { type: 'image/webp' })
    const response = await POST(request(buildForm(image)), params('not-a-real-category'))
    expect(response.status).toBe(404)
    expect(mockUpsert).not.toHaveBeenCalled()
  })

  it('returns 400 when no image is attached', async () => {
    const response = await POST(request(buildForm()), params('identity-alignment'))
    expect(response.status).toBe(400)
  })

  it('rejects a disallowed MIME type', async () => {
    const badFile = new File([Buffer.from('not an image')], 'cover.gif', { type: 'image/gif' })
    const response = await POST(request(buildForm(badFile)), params('identity-alignment'))
    expect(response.status).toBe(400)
    expect(mockWriteFileSync).not.toHaveBeenCalled()
  })

  it('saves the image to disk under the category slug and upserts the DB row', async () => {
    const image = new File([Buffer.from('fake image bytes')], 'cover.webp', { type: 'image/webp' })
    const response = await POST(request(buildForm(image)), params('identity-alignment'))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(mockMkdirSync).toHaveBeenCalled()
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      expect.stringContaining('identity-alignment.webp'),
      expect.any(Buffer)
    )
    expect(mockUpsert).toHaveBeenCalledWith({
      where: { categorySlug: 'identity-alignment' },
      create: { categorySlug: 'identity-alignment', imagePath: '/api/coaching/image/identity-alignment.webp' },
      update: { imagePath: '/api/coaching/image/identity-alignment.webp' },
    })
    expect(payload.image.imagePath).toBe('/api/coaching/image/identity-alignment.webp')
  })
})

describe('DELETE /api/admin/coaching/categories/[slug]/image', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireCrmApi.mockResolvedValue(true)
  })

  it('returns 403 without the content:write permission', async () => {
    mockRequireCrmApi.mockResolvedValue(false)
    const response = await DELETE(new NextRequest('https://salimcyrus.com/x'), params('identity-alignment'))
    expect(response.status).toBe(403)
    expect(mockDeleteMany).not.toHaveBeenCalled()
  })

  it('removes the image row, reverting the category to its built-in fallback', async () => {
    const response = await DELETE(new NextRequest('https://salimcyrus.com/x'), params('identity-alignment'))
    expect(response.status).toBe(200)
    expect(mockDeleteMany).toHaveBeenCalledWith({ where: { categorySlug: 'identity-alignment' } })
  })
})
