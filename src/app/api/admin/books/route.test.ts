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
    book: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
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
const mockFindMany = db.book.findMany as jest.Mock
const mockFindUnique = db.book.findUnique as jest.Mock
const mockCreate = db.book.create as jest.Mock
const mockWriteFileSync = writeFileSync as jest.Mock
const mockMkdirSync = mkdirSync as jest.Mock

function validMeta() {
  return {
    title: 'Leading a Family',
    description: 'A book on leading your household well.',
    priceKes: '800',
    priceUsd: '6',
  }
}

function buildForm(overrides: Record<string, unknown> = {}, opts: { pdf?: File | null; cover?: File | null } = {}) {
  const form = new FormData()
  const meta = { ...validMeta(), ...overrides }
  for (const [key, value] of Object.entries(meta)) {
    if (value !== undefined) form.set(key, String(value))
  }
  const pdf = opts.pdf === null ? undefined : opts.pdf ?? new File([Buffer.from('fake pdf bytes')], 'book.pdf', { type: 'application/pdf' })
  if (pdf) form.set('pdf', pdf)
  const cover =
    opts.cover === null ? undefined : opts.cover ?? new File([Buffer.from('fake image bytes')], 'cover.webp', { type: 'image/webp' })
  if (cover) form.set('cover', cover)
  return form
}

function request(form: FormData) {
  return new NextRequest('https://salimcyrus.com/api/admin/books', { method: 'POST', body: form })
}

describe('GET /api/admin/books', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 403 without the content:write permission', async () => {
    mockRequireCrmApi.mockResolvedValue(false)
    const response = await GET()
    expect(response.status).toBe(403)
  })

  it('lists admin-uploaded books ordered by newest first', async () => {
    mockRequireCrmApi.mockResolvedValue(true)
    mockFindMany.mockResolvedValue([{ id: 'b1' }])
    const response = await GET()
    const payload = await response.json()
    expect(response.status).toBe(200)
    expect(payload.books).toEqual([{ id: 'b1' }])
    expect(mockFindMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' } })
  })
})

describe('POST /api/admin/books', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireCrmApi.mockResolvedValue(true)
    mockFindUnique.mockResolvedValue(null)
    mockCreate.mockResolvedValue({ id: 'b1', slug: 'leading-a-family' })
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

  it('returns 400 when no PDF is attached', async () => {
    const response = await POST(request(buildForm({}, { pdf: null })))
    expect(response.status).toBe(400)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('rejects a non-PDF file for the book', async () => {
    const badPdf = new File([Buffer.from('not a pdf')], 'book.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
    const response = await POST(request(buildForm({}, { pdf: badPdf })))
    expect(response.status).toBe(400)
    expect(mockWriteFileSync).not.toHaveBeenCalled()
  })

  it('returns 400 when no cover image is attached', async () => {
    const response = await POST(request(buildForm({}, { cover: null })))
    expect(response.status).toBe(400)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('rejects a cover with a disallowed MIME type', async () => {
    const badCover = new File([Buffer.from('not an image')], 'cover.gif', { type: 'image/gif' })
    const response = await POST(request(buildForm({}, { cover: badCover })))
    expect(response.status).toBe(400)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('creates a draft book by default, writing the PDF and cover to disk', async () => {
    const response = await POST(request(buildForm()))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.book).toEqual({ id: 'b1', slug: 'leading-a-family' })
    expect(mockMkdirSync).toHaveBeenCalled()
    expect(mockWriteFileSync).toHaveBeenCalledWith(expect.stringContaining('leading-a-family.pdf'), expect.any(Buffer))
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      expect.stringContaining('leading-a-family-cover.webp'),
      expect.any(Buffer)
    )
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        slug: 'leading-a-family',
        title: 'Leading a Family',
        priceKes: 800,
        priceUsd: 6,
        fileName: 'leading-a-family.pdf',
        coverPath: '/api/books/cover/leading-a-family-cover.webp',
        status: 'draft',
      }),
    })
  })

  it('publishes immediately when publish=true is sent', async () => {
    await POST(request(buildForm({ publish: 'true' })))
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ status: 'available' }),
    })
  })

  it('rejects a slug that collides with one of the existing static books, not just the database', async () => {
    // "The Deception" is a real static title; slugify collision-checking
    // must consult both catalogs, not just the Book table.
    await POST(request(buildForm({ title: 'The Deception' })))

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ slug: 'the-deception-2' }),
    })
  })

  it('appends a numeric suffix on a database slug collision', async () => {
    mockFindUnique.mockResolvedValueOnce({ id: 'existing' }).mockResolvedValueOnce(null)

    await POST(request(buildForm()))

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ slug: 'leading-a-family-2' }),
    })
  })

  it('includes an optional page count when provided', async () => {
    await POST(request(buildForm({ pageCount: '120' })))
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ pageCount: 120 }),
    })
  })
})
