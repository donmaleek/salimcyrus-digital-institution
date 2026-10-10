/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('fs', () => ({
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  unlink: jest.fn((_path: string, callback: (error: Error | null) => void) => callback(null)),
}))
jest.mock('../../../../../lib/db', () => ({
  db: { book: { findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() } },
}))
jest.mock('../../../../../services/crm/access', () => ({
  requireCrmApi: jest.fn(),
}))

import { PATCH, PUT, DELETE } from './route'
import { db } from '@/lib/db'
import { requireCrmApi } from '@/services/crm/access'
import { writeFileSync, unlink } from 'fs'

const mockRequireCrmApi = requireCrmApi as jest.Mock
const mockFindUnique = db.book.findUnique as jest.Mock
const mockUpdate = db.book.update as jest.Mock
const mockDelete = db.book.delete as jest.Mock
const mockWriteFileSync = writeFileSync as jest.Mock
const mockUnlink = unlink as unknown as jest.Mock

function patchRequest(body: unknown) {
  return new NextRequest('https://salimcyrus.com/api/admin/books/b1', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

const existingBook = {
  id: 'b1',
  slug: 'leading-a-family',
  title: 'Leading a Family',
  subtitle: null,
  description: 'Old description',
  priceKes: 550,
  priceUsd: 4,
  pageCount: 100,
  fileName: 'leading-a-family.pdf',
  coverPath: '/api/books/cover/leading-a-family-cover.webp',
  status: 'draft',
}

function editForm(overrides: Record<string, unknown> = {}, opts: { pdf?: File; cover?: File } = {}) {
  const form = new FormData()
  const meta = {
    title: 'Leading a Family, Revised',
    description: 'Updated description',
    priceKes: '600',
    priceUsd: '5',
    ...overrides,
  }
  for (const [key, value] of Object.entries(meta)) {
    if (value !== undefined) form.set(key, String(value))
  }
  if (opts.pdf) form.set('pdf', opts.pdf)
  if (opts.cover) form.set('cover', opts.cover)
  return form
}

function putRequest(form: FormData) {
  return new NextRequest('https://salimcyrus.com/api/admin/books/b1', { method: 'PUT', body: form })
}

describe('PUT /api/admin/books/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireCrmApi.mockResolvedValue(true)
    mockFindUnique.mockResolvedValue(existingBook)
    mockUpdate.mockResolvedValue({ ...existingBook, title: 'Leading a Family, Revised' })
  })

  it('returns 403 without the content:write permission', async () => {
    mockRequireCrmApi.mockResolvedValue(false)
    const response = await PUT(putRequest(editForm()), { params: Promise.resolve({ id: 'b1' }) })
    expect(response.status).toBe(403)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('returns 404 for an unknown book', async () => {
    mockFindUnique.mockResolvedValue(null)
    const response = await PUT(putRequest(editForm()), { params: Promise.resolve({ id: 'missing' }) })
    expect(response.status).toBe(404)
  })

  it('returns 400 for a price above the KES cap', async () => {
    const response = await PUT(putRequest(editForm({ priceKes: '601' })), { params: Promise.resolve({ id: 'b1' }) })
    expect(response.status).toBe(400)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('updates metadata without touching the file or cover when neither is attached', async () => {
    const response = await PUT(putRequest(editForm()), { params: Promise.resolve({ id: 'b1' }) })
    expect(response.status).toBe(200)
    expect(mockWriteFileSync).not.toHaveBeenCalled()
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'b1' },
      data: expect.objectContaining({
        title: 'Leading a Family, Revised',
        description: 'Updated description',
        priceKes: 600,
        priceUsd: 5,
        fileName: 'leading-a-family.pdf',
        coverPath: '/api/books/cover/leading-a-family-cover.webp',
      }),
    })
  })

  it('replaces the PDF in place at the same filename when a new one is attached', async () => {
    const newPdf = new File([Buffer.from('new pdf bytes')], 'book.pdf', { type: 'application/pdf' })
    await PUT(putRequest(editForm({}, { pdf: newPdf })), { params: Promise.resolve({ id: 'b1' }) })
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      expect.stringContaining('leading-a-family.pdf'),
      expect.any(Buffer)
    )
  })

  it('rejects a non-PDF replacement file', async () => {
    const badPdf = new File([Buffer.from('not a pdf')], 'book.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
    const response = await PUT(putRequest(editForm({}, { pdf: badPdf })), { params: Promise.resolve({ id: 'b1' }) })
    expect(response.status).toBe(400)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('replaces the cover and removes the old file when the extension changes', async () => {
    const newCover = new File([Buffer.from('new cover bytes')], 'cover.png', { type: 'image/png' })
    const response = await PUT(putRequest(editForm({}, { cover: newCover })), { params: Promise.resolve({ id: 'b1' }) })
    const payload = await response.json()

    expect(mockWriteFileSync).toHaveBeenCalledWith(
      expect.stringContaining('leading-a-family-cover.png'),
      expect.any(Buffer)
    )
    expect(mockUnlink).toHaveBeenCalledWith(expect.stringContaining('leading-a-family-cover.webp'), expect.any(Function))
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ coverPath: '/api/books/cover/leading-a-family-cover.png' }) })
    )
    expect(payload.book).toBeDefined()
  })

  it('does not delete the old cover file when the replacement keeps the same extension', async () => {
    const newCover = new File([Buffer.from('new cover bytes')], 'cover.webp', { type: 'image/webp' })
    await PUT(putRequest(editForm({}, { cover: newCover })), { params: Promise.resolve({ id: 'b1' }) })
    expect(mockUnlink).not.toHaveBeenCalled()
  })
})

describe('PATCH /api/admin/books/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireCrmApi.mockResolvedValue(true)
    mockFindUnique.mockResolvedValue({ id: 'b1', status: 'draft' })
  })

  it('returns 403 without the content:write permission', async () => {
    mockRequireCrmApi.mockResolvedValue(false)
    const response = await PATCH(patchRequest({ status: 'available' }), { params: Promise.resolve({ id: 'b1' }) })
    expect(response.status).toBe(403)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('returns 400 for an invalid status', async () => {
    const response = await PATCH(patchRequest({ status: 'published' }), { params: Promise.resolve({ id: 'b1' }) })
    expect(response.status).toBe(400)
  })

  it('returns 404 for an unknown book', async () => {
    mockFindUnique.mockResolvedValue(null)
    const response = await PATCH(patchRequest({ status: 'available' }), { params: Promise.resolve({ id: 'missing' }) })
    expect(response.status).toBe(404)
  })

  it('publishes a draft book', async () => {
    mockUpdate.mockResolvedValue({ id: 'b1', status: 'available' })
    const response = await PATCH(patchRequest({ status: 'available' }), { params: Promise.resolve({ id: 'b1' }) })
    expect(response.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith({ where: { id: 'b1' }, data: { status: 'available' } })
  })
})

describe('DELETE /api/admin/books/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireCrmApi.mockResolvedValue(true)
    mockFindUnique.mockResolvedValue({ id: 'b1' })
  })

  it('returns 403 without the content:write permission', async () => {
    mockRequireCrmApi.mockResolvedValue(false)
    const response = await DELETE(new NextRequest('https://salimcyrus.com/x'), { params: Promise.resolve({ id: 'b1' }) })
    expect(response.status).toBe(403)
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it('returns 404 for an unknown book', async () => {
    mockFindUnique.mockResolvedValue(null)
    const response = await DELETE(new NextRequest('https://salimcyrus.com/x'), { params: Promise.resolve({ id: 'missing' }) })
    expect(response.status).toBe(404)
  })

  it('deletes an existing book', async () => {
    const response = await DELETE(new NextRequest('https://salimcyrus.com/x'), { params: Promise.resolve({ id: 'b1' }) })
    expect(response.status).toBe(200)
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'b1' } })
  })
})
