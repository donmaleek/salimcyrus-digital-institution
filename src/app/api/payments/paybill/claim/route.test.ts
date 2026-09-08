/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('fs', () => ({
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}))
jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('../../../../../lib/auth', () => ({ authOptions: {} }))
jest.mock('../../../../../lib/db', () => ({
  db: { teaching: { findUnique: jest.fn() } },
}))
jest.mock('../../../../../services/payments/payment-claims', () => ({
  submitPaymentClaim: jest.fn(),
}))

import { POST } from './route'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { submitPaymentClaim } from '@/services/payments/payment-claims'
import { books } from '@/lib/data/books'

const mockGetServerSession = getServerSession as jest.Mock
const mockTeachingFindUnique = db.teaching.findUnique as jest.Mock
const mockSubmit = submitPaymentClaim as jest.Mock

function request(form: FormData) {
  return new NextRequest('https://salimcyrus.com/api/payments/paybill/claim', { method: 'POST', body: form })
}

function bookForm(overrides: Record<string, string> = {}) {
  const book = books.find((b) => b.fileName)!
  const form = new FormData()
  form.set('offerType', 'book')
  form.set('bookSlug', book.slug)
  form.set('mpesaCode', overrides.mpesaCode ?? 'QGH7XXXXX1')
  for (const [k, v] of Object.entries(overrides)) form.set(k, v)
  return { form, book }
}

describe('POST /api/payments/paybill/claim', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1', email: 'buyer@example.com', name: 'Buyer' } })
    mockSubmit.mockResolvedValue({ status: 'created', claimId: 'claim-1' })
  })

  it('returns 400 for an invalid M-Pesa code', async () => {
    const { form } = bookForm({ mpesaCode: 'abc' })
    const response = await POST(request(form))
    expect(response.status).toBe(400)
    expect(mockSubmit).not.toHaveBeenCalled()
  })

  it('returns 401 for a book claim when signed out', async () => {
    mockGetServerSession.mockResolvedValue(null)
    const { form } = bookForm()
    const response = await POST(request(form))
    expect(response.status).toBe(401)
  })

  it('returns 404 for an unknown book', async () => {
    const form = new FormData()
    form.set('offerType', 'book')
    form.set('bookSlug', 'does-not-exist')
    form.set('mpesaCode', 'QGH7XXXXX1')
    const response = await POST(request(form))
    expect(response.status).toBe(404)
  })

  it('computes the amount server-side from the real book price, not a client-submitted amount', async () => {
    const { form, book } = bookForm({ amountKes: '1' })
    const response = await POST(request(form))
    expect(response.status).toBe(200)
    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ offerType: 'book', bookSlug: book.slug, amountKes: book.priceKes, userId: 'user-1' })
    )
  })

  it('uppercases the M-Pesa code for consistent matching', async () => {
    const { form } = bookForm({ mpesaCode: 'qgh7xxxxx1' })
    await POST(request(form))
    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({ mpesaCode: 'QGH7XXXXX1' }))
  })

  it('returns 401 for a teaching claim when signed out', async () => {
    mockGetServerSession.mockResolvedValue(null)
    const form = new FormData()
    form.set('offerType', 'teaching')
    form.set('teachingId', 'teaching-1')
    form.set('mpesaCode', 'QGH7XXXXX1')
    const response = await POST(request(form))
    expect(response.status).toBe(401)
  })

  it('returns 404 for an unpublished teaching', async () => {
    mockTeachingFindUnique.mockResolvedValue({ id: 'teaching-1', status: 'draft', priceKes: 800 })
    const form = new FormData()
    form.set('offerType', 'teaching')
    form.set('teachingId', 'teaching-1')
    form.set('mpesaCode', 'QGH7XXXXX1')
    const response = await POST(request(form))
    expect(response.status).toBe(404)
  })

  it('submits a teaching claim using the published teaching price', async () => {
    mockTeachingFindUnique.mockResolvedValue({ id: 'teaching-1', status: 'published', priceKes: 900 })
    const form = new FormData()
    form.set('offerType', 'teaching')
    form.set('teachingId', 'teaching-1')
    form.set('mpesaCode', 'QGH7XXXXX1')
    const response = await POST(request(form))
    expect(response.status).toBe(200)
    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ offerType: 'teaching', teachingId: 'teaching-1', amountKes: 900, userId: 'user-1' })
    )
  })

  it('does not require a session for a donation claim', async () => {
    mockGetServerSession.mockResolvedValue(null)
    const form = new FormData()
    form.set('offerType', 'donation')
    form.set('amountKes', '1000')
    form.set('email', 'donor@example.com')
    form.set('name', 'Donor')
    form.set('mpesaCode', 'QGH7XXXXX1')
    const response = await POST(request(form))
    expect(response.status).toBe(200)
    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ offerType: 'donation', amountKes: 1000, email: 'donor@example.com', name: 'Donor' })
    )
  })

  it('returns 400 for a donation claim missing amount, email, or name', async () => {
    mockGetServerSession.mockResolvedValue(null)
    const form = new FormData()
    form.set('offerType', 'donation')
    form.set('mpesaCode', 'QGH7XXXXX1')
    const response = await POST(request(form))
    expect(response.status).toBe(400)
  })

  it('returns 409 when the M-Pesa code has already been submitted', async () => {
    mockSubmit.mockResolvedValue({ status: 'duplicate_code' })
    const { form } = bookForm()
    const response = await POST(request(form))
    expect(response.status).toBe(409)
  })

  it('rejects an evidence file with a disallowed MIME type', async () => {
    const { form } = bookForm()
    form.set('evidence', new File([Buffer.from('not an image')], 'proof.pdf', { type: 'application/pdf' }))
    const response = await POST(request(form))
    expect(response.status).toBe(400)
    expect(mockSubmit).not.toHaveBeenCalled()
  })

  it('accepts a valid evidence screenshot and writes it to private storage', async () => {
    const { writeFileSync } = jest.requireMock('fs')
    const { form } = bookForm()
    form.set('evidence', new File([Buffer.from('fake image bytes')], 'proof.jpg', { type: 'image/jpeg' }))
    const response = await POST(request(form))
    expect(response.status).toBe(200)
    expect(writeFileSync).toHaveBeenCalledWith(expect.stringContaining('.jpg'), expect.any(Buffer))
    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ evidenceFileName: expect.stringContaining('.jpg') })
    )
  })
})
