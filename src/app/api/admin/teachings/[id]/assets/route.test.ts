/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('../../../../../../services/crm/access', () => ({
  requireCrmApi: jest.fn(),
}))
jest.mock('../../../../../../lib/db', () => ({
  db: { teaching: { findUnique: jest.fn(), update: jest.fn() } },
}))
jest.mock('../../../../../../services/teachings/teaching-assets', () => ({
  saveTeachingThumbnail: jest.fn(),
  saveTeachingPreview: jest.fn(),
}))

import { POST } from './route'
import { requireCrmApi } from '@/services/crm/access'
import { db } from '@/lib/db'
import { saveTeachingThumbnail, saveTeachingPreview } from '@/services/teachings/teaching-assets'

const mockRequireCrmApi = requireCrmApi as jest.Mock
const mockFindUnique = db.teaching.findUnique as jest.Mock
const mockUpdate = db.teaching.update as jest.Mock
const mockSaveThumbnail = saveTeachingThumbnail as jest.Mock
const mockSavePreview = saveTeachingPreview as jest.Mock

function fakeFile(name: string, type: string) {
  return new File([new Uint8Array(100)], name, { type })
}

function request(form: FormData) {
  return new NextRequest('https://salimcyrus.com/api/admin/teachings/t1/assets', { method: 'POST', body: form })
}

describe('POST /api/admin/teachings/[id]/assets', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireCrmApi.mockResolvedValue(true)
    mockFindUnique.mockResolvedValue({ id: 't1', slug: 'my-teaching', title: 'My Teaching' })
    mockUpdate.mockResolvedValue({ id: 't1' })
  })

  it('returns 403 without the content:write permission', async () => {
    mockRequireCrmApi.mockResolvedValue(false)
    const form = new FormData()
    form.set('thumbnail', fakeFile('x.webp', 'image/webp'))
    const response = await POST(request(form), { params: { id: 't1' } })
    expect(response.status).toBe(403)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('returns 404 for an unknown teaching, so an existing teaching cannot be found this way if it was already deleted', async () => {
    mockFindUnique.mockResolvedValue(null)
    const form = new FormData()
    form.set('thumbnail', fakeFile('x.webp', 'image/webp'))
    const response = await POST(request(form), { params: { id: 'missing' } })
    expect(response.status).toBe(404)
  })

  it('returns 400 when neither a thumbnail nor a preview clip is attached', async () => {
    const response = await POST(request(new FormData()), { params: { id: 't1' } })
    expect(response.status).toBe(400)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('updates only the thumbnail when only a thumbnail is attached, this teaching may already be published', async () => {
    mockSaveThumbnail.mockResolvedValue({ ok: true, value: '/api/teachings/thumbnail/my-teaching-thumb.webp' })
    const form = new FormData()
    form.set('thumbnail', fakeFile('x.webp', 'image/webp'))

    const response = await POST(request(form), { params: { id: 't1' } })

    expect(response.status).toBe(200)
    expect(mockSaveThumbnail).toHaveBeenCalledWith('my-teaching', expect.any(File))
    expect(mockSavePreview).not.toHaveBeenCalled()
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 't1' },
      data: { thumbnailPath: '/api/teachings/thumbnail/my-teaching-thumb.webp' },
    })
  })

  it('updates only the preview clip when only a preview is attached, the exact gap the user hit: an existing teaching with no way to add one', async () => {
    mockSavePreview.mockResolvedValue({ ok: true, value: 'my-teaching-preview.mp4' })
    const form = new FormData()
    form.set('preview', fakeFile('x.mp4', 'video/mp4'))

    const response = await POST(request(form), { params: { id: 't1' } })

    expect(response.status).toBe(200)
    expect(mockSaveThumbnail).not.toHaveBeenCalled()
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 't1' },
      data: { previewFileName: 'my-teaching-preview.mp4' },
    })
  })

  it('updates both when both are attached', async () => {
    mockSaveThumbnail.mockResolvedValue({ ok: true, value: '/api/teachings/thumbnail/x.webp' })
    mockSavePreview.mockResolvedValue({ ok: true, value: 'x-preview.mp4' })
    const form = new FormData()
    form.set('thumbnail', fakeFile('a.webp', 'image/webp'))
    form.set('preview', fakeFile('b.mp4', 'video/mp4'))

    await POST(request(form), { params: { id: 't1' } })

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 't1' },
      data: { thumbnailPath: '/api/teachings/thumbnail/x.webp', previewFileName: 'x-preview.mp4' },
    })
  })

  it('surfaces the validation error and status from the save helper (e.g. a disallowed MIME type)', async () => {
    mockSaveThumbnail.mockResolvedValue({ ok: false, error: 'Thumbnail must be WebP, JPEG, or PNG.', status: 400 })
    const form = new FormData()
    form.set('thumbnail', fakeFile('x.gif', 'image/gif'))

    const response = await POST(request(form), { params: { id: 't1' } })
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error).toBe('Thumbnail must be WebP, JPEG, or PNG.')
    expect(mockUpdate).not.toHaveBeenCalled()
  })
})
