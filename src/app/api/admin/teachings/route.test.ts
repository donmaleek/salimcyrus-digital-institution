/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

jest.mock('../../../../lib/db', () => ({
  db: {
    teaching: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
  },
}))
jest.mock('../../../../services/crm/access', () => ({
  requireCrmApi: jest.fn(),
}))
jest.mock('../../../../services/teachings/video-compression', () => ({
  compressTeachingVideoInBackground: jest.fn().mockResolvedValue(undefined),
}))

let storageDir: string

// TEACHINGS_STORAGE_DIR must be set before teachings-storage.ts (transitively
// imported by the route) resolves it, so this runs before any import below.
beforeAll(() => {
  storageDir = mkdtempSync(join(tmpdir(), 'teachings-route-test-'))
  process.env.TEACHINGS_STORAGE_DIR = storageDir
})

afterAll(() => {
  rmSync(storageDir, { recursive: true, force: true })
  delete process.env.TEACHINGS_STORAGE_DIR
})

import { GET, POST } from './route'
import { db } from '@/lib/db'
import { requireCrmApi } from '@/services/crm/access'
import { compressTeachingVideoInBackground } from '@/services/teachings/video-compression'

const mockRequireCrmApi = requireCrmApi as jest.Mock
const mockFindMany = db.teaching.findMany as jest.Mock
const mockFindUnique = db.teaching.findUnique as jest.Mock
const mockCreate = db.teaching.create as jest.Mock
const mockCompress = compressTeachingVideoInBackground as jest.Mock

function validMeta() {
  return {
    title: 'Leading a Family',
    description: 'A teaching on leading your household well.',
    category: 'Manhood',
    priceKes: '800',
    priceUsd: '8',
  }
}

function buildForm(
  overrides: Record<string, unknown> = {},
  opts: { video?: File | null; thumbnail?: File; preview?: File } = {}
) {
  const form = new FormData()
  const meta = { ...validMeta(), ...overrides }
  for (const [key, value] of Object.entries(meta)) {
    if (value !== undefined) form.set(key, String(value))
  }
  const video = opts.video === null ? undefined : opts.video ?? new File([Buffer.from('fake video bytes')], 'video.mp4', { type: 'video/mp4' })
  if (video) form.set('video', video)
  if (opts.thumbnail) form.set('thumbnail', opts.thumbnail)
  if (opts.preview) form.set('preview', opts.preview)
  return form
}

function request(form: FormData) {
  return new NextRequest('https://salimcyrus.com/api/admin/teachings', { method: 'POST', body: form })
}

function filesOnDisk() {
  return existsSync(storageDir) ? require('fs').readdirSync(storageDir) as string[] : []
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

  afterEach(() => {
    for (const name of filesOnDisk()) rmSync(join(storageDir, name), { force: true })
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

  it('rejects a video with a disallowed MIME type, never writing it to disk', async () => {
    const badVideo = new File([Buffer.from('not a real video')], 'clip.avi', { type: 'video/x-msvideo' })
    const response = await POST(request(buildForm({}, { video: badVideo })))
    expect(response.status).toBe(400)
    expect(mockCreate).not.toHaveBeenCalled()
    expect(filesOnDisk()).toHaveLength(0)
  })

  it('streams the video straight to the teaching slug filename, marked processing, and kicks off background compression without waiting for it', async () => {
    const videoBytes = Buffer.from('fake video bytes for the streaming path')
    const response = await POST(request(buildForm({}, { video: new File([videoBytes], 'video.mp4', { type: 'video/mp4' }) })))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.teaching).toEqual({ id: 't1', slug: 'leading-a-family' })

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        slug: 'leading-a-family',
        title: 'Leading a Family',
        category: 'Manhood',
        priceKes: 800,
        priceUsd: 8,
        videoFileName: 'leading-a-family.upload.mp4',
        thumbnailPath: null,
        processingStatus: 'processing',
        status: 'draft',
      }),
    })

    const savedPath = join(storageDir, 'leading-a-family.upload.mp4')
    expect(existsSync(savedPath)).toBe(true)
    expect(readFileSync(savedPath).equals(videoBytes)).toBe(true)

    expect(mockCompress).toHaveBeenCalledWith({
      teachingId: 't1',
      rawPath: savedPath,
      rawFileName: 'leading-a-family.upload.mp4',
      slug: 'leading-a-family',
    })
  })

  it('responds without waiting for compression to finish, even if it is slow', async () => {
    let releaseCompression: () => void = () => undefined
    mockCompress.mockReturnValue(new Promise<void>((resolve) => { releaseCompression = resolve }))

    const response = await POST(request(buildForm()))
    expect(response.status).toBe(200)
    releaseCompression()
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
      data: expect.objectContaining({ slug: 'leading-a-family-2', videoFileName: 'leading-a-family-2.upload.mp4' }),
    })
  })

  it('writes an accompanying thumbnail when one is attached', async () => {
    const thumbnailBytes = Buffer.from('fake image bytes')
    await POST(request(buildForm({}, { thumbnail: new File([thumbnailBytes], 'cover.webp', { type: 'image/webp' }) })))

    const savedPath = join(storageDir, 'leading-a-family-thumb.webp')
    expect(existsSync(savedPath)).toBe(true)
    expect(readFileSync(savedPath).equals(thumbnailBytes)).toBe(true)
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ thumbnailPath: '/api/teachings/thumbnail/leading-a-family-thumb.webp' }),
    })
  })

  it('rejects a thumbnail with a disallowed MIME type', async () => {
    const badThumbnail = new File([Buffer.from('not an image')], 'cover.gif', { type: 'image/gif' })
    const response = await POST(request(buildForm({}, { thumbnail: badThumbnail })))
    expect(response.status).toBe(400)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('writes an accompanying preview clip when one is attached, as a separate file from the main video', async () => {
    const previewBytes = Buffer.from('fake preview bytes')
    await POST(request(buildForm({}, { preview: new File([previewBytes], 'teaser.mp4', { type: 'video/mp4' }) })))

    const savedPath = join(storageDir, 'leading-a-family-preview.mp4')
    expect(existsSync(savedPath)).toBe(true)
    expect(readFileSync(savedPath).equals(previewBytes)).toBe(true)
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        videoFileName: 'leading-a-family.upload.mp4',
        previewFileName: 'leading-a-family-preview.mp4',
      }),
    })
  })

  it('rejects a preview clip with a disallowed MIME type', async () => {
    const badPreview = new File([Buffer.from('not a real video')], 'teaser.avi', { type: 'video/x-msvideo' })
    const response = await POST(request(buildForm({}, { preview: badPreview })))
    expect(response.status).toBe(400)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('creates a teaching with no preview clip when none is attached', async () => {
    await POST(request(buildForm()))
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ previewFileName: null }),
    })
  })

  it('rejects a file that exceeds its size cap mid-stream and leaves no partial file behind (proves the cleanup path, using the 100MB preview cap since a real 2GB video would be too slow for a unit test)', async () => {
    const chunk = Buffer.alloc(2 * 1024 * 1024, 1) // 2MB
    const oversizedPreview = new File([Buffer.concat(Array(51).fill(chunk))], 'teaser.mp4', { type: 'video/mp4' }) // ~102MB > 100MB preview cap
    const response = await POST(request(buildForm({}, { preview: oversizedPreview })))
    expect(response.status).toBe(413)
    expect(mockCreate).not.toHaveBeenCalled()
    expect(filesOnDisk()).toHaveLength(0)
  })
})
