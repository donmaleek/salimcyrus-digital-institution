/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('fs', () => ({
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}))
jest.mock('../../../../lib/db', () => ({
  db: {
    teaching: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
  },
}))
jest.mock('../../../../services/crm/access', () => ({
  requireCrmApi: jest.fn(),
}))

import { GET, POST } from './route'
import { db } from '@/lib/db'
import { requireCrmApi } from '@/services/crm/access'
import { mkdirSync, writeFileSync } from 'fs'

const mockRequireCrmApi = requireCrmApi as jest.Mock
const mockFindMany = db.teaching.findMany as jest.Mock
const mockFindUnique = db.teaching.findUnique as jest.Mock
const mockCreate = db.teaching.create as jest.Mock
const mockWriteFileSync = writeFileSync as jest.Mock
const mockMkdirSync = mkdirSync as jest.Mock

function validMeta() {
  return {
    title: 'Leading a Family',
    description: 'A teaching on leading your household well.',
    category: 'Manhood',
    priceKes: '800',
    priceUsd: '8',
  }
}

function buildForm(overrides: Record<string, unknown> = {}, opts: { video?: File | null; thumbnail?: File } = {}) {
  const form = new FormData()
  const meta = { ...validMeta(), ...overrides }
  for (const [key, value] of Object.entries(meta)) {
    if (value !== undefined) form.set(key, String(value))
  }
  const video = opts.video === null ? undefined : opts.video ?? new File([Buffer.from('fake video bytes')], 'video.mp4', { type: 'video/mp4' })
  if (video) form.set('video', video)
  if (opts.thumbnail) form.set('thumbnail', opts.thumbnail)
  return form
}

function request(form: FormData) {
  return new NextRequest('https://salimcyrus.com/api/admin/teachings', { method: 'POST', body: form })
}

describe('GET /api/admin/teachings', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 403 without the content:write permission', async () => {
    mockRequireCrmApi.mockResolvedValue(false)
    const response = await GET()
    expect(response.status).toBe(403)
  })

  it('lists teachings ordered by newest first', async () => {
    mockRequireCrmApi.mockResolvedValue(true)
    mockFindMany.mockResolvedValue([{ id: 't1' }])
    const response = await GET()
    const payload = await response.json()
    expect(response.status).toBe(200)
    expect(payload.teachings).toEqual([{ id: 't1' }])
    expect(mockFindMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' } })
  })
})

describe('POST /api/admin/teachings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireCrmApi.mockResolvedValue(true)
    mockFindUnique.mockResolvedValue(null)
    mockCreate.mockResolvedValue({ id: 't1', slug: 'leading-a-family' })
  })

  it('returns 403 without the content:write permission', async () => {
    mockRequireCrmApi.mockResolvedValue(false)
    const response = await POST(request(buildForm()))
    expect(response.status).toBe(403)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('returns 400 when required metadata is missing', async () => {
    const response = await POST(request(buildForm({ title: '' })))
    expect(response.status).toBe(400)
  })

  it('returns 400 for an unrecognized category', async () => {
    const response = await POST(request(buildForm({ category: 'NotACategory' })))
    expect(response.status).toBe(400)
  })

  it('returns 400 when no video file is attached', async () => {
    const response = await POST(request(buildForm({}, { video: null })))
    expect(response.status).toBe(400)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('rejects a video with a disallowed MIME type', async () => {
    const badVideo = new File([Buffer.from('not a real video')], 'clip.avi', { type: 'video/x-msvideo' })
    const response = await POST(request(buildForm({}, { video: badVideo })))
    expect(response.status).toBe(400)
    expect(mockWriteFileSync).not.toHaveBeenCalled()
  })

  it('creates a draft teaching by default, writing the video to disk', async () => {
    const response = await POST(request(buildForm()))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.teaching).toEqual({ id: 't1', slug: 'leading-a-family' })
    expect(mockMkdirSync).toHaveBeenCalled()
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      expect.stringContaining('leading-a-family.mp4'),
      expect.any(Buffer)
    )
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        slug: 'leading-a-family',
        title: 'Leading a Family',
        category: 'Manhood',
        priceKes: 800,
        priceUsd: 8,
        videoFileName: 'leading-a-family.mp4',
        thumbnailPath: null,
        status: 'draft',
      }),
    })
  })

  it('publishes immediately when publish=true is sent', async () => {
    await POST(request(buildForm({ publish: 'true' })))
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ status: 'published' }),
    })
  })

  it('appends a numeric suffix on a slug collision', async () => {
    mockFindUnique.mockResolvedValueOnce({ id: 'existing' }).mockResolvedValueOnce(null)

    await POST(request(buildForm()))

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ slug: 'leading-a-family-2' }),
    })
  })

  it('writes an accompanying thumbnail when one is attached', async () => {
    const thumbnail = new File([Buffer.from('fake image bytes')], 'cover.webp', { type: 'image/webp' })
    await POST(request(buildForm({}, { thumbnail })))

    expect(mockWriteFileSync).toHaveBeenCalledWith(
      expect.stringContaining('leading-a-family.webp'),
      expect.any(Buffer)
    )
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ thumbnailPath: '/images/teachings/leading-a-family.webp' }),
    })
  })

  it('rejects a thumbnail with a disallowed MIME type', async () => {
    const badThumbnail = new File([Buffer.from('not an image')], 'cover.gif', { type: 'image/gif' })
    const response = await POST(request(buildForm({}, { thumbnail: badThumbnail })))
    expect(response.status).toBe(400)
    expect(mockCreate).not.toHaveBeenCalled()
  })
})
