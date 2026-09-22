/** @jest-environment node */
import { NextRequest } from 'next/server'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('../../../../lib/auth', () => ({ authOptions: {} }))
jest.mock('../../../../services/payments/paystack', () => ({ initializePaystackJournalCheckout: jest.fn() }))

import { getServerSession } from 'next-auth'
import { initializePaystackJournalCheckout } from '@/services/payments/paystack'
import { POST } from './route'

const mockSession = getServerSession as jest.Mock
const mockInitialize = initializePaystackJournalCheckout as jest.Mock

describe('POST /api/journal/checkout', () => {
  const originalKey = process.env.PAYSTACK_SECRET_KEY

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.PAYSTACK_SECRET_KEY = 'sk_test'
  })
  afterAll(() => {
    process.env.PAYSTACK_SECRET_KEY = originalKey
  })

  it('requires configuration and an authenticated account', async () => {
    delete process.env.PAYSTACK_SECRET_KEY
    expect((await POST(new NextRequest('https://salimcyrus.com/api/journal/checkout', { method: 'POST' }))).status).toBe(503)
    process.env.PAYSTACK_SECRET_KEY = 'sk_test'
    mockSession.mockResolvedValue(null)
    expect((await POST(new NextRequest('https://salimcyrus.com/api/journal/checkout', { method: 'POST' }))).status).toBe(401)
  })

  it('initializes checkout from the signed-in user identity', async () => {
    mockSession.mockResolvedValue({ user: { id: 'user-1', email: 'reader@example.com' } })
    mockInitialize.mockResolvedValue({ authorizationUrl: 'https://checkout.paystack.com/journal', reference: 'ref-1' })

    const response = await POST(new NextRequest('https://salimcyrus.com/api/journal/checkout', { method: 'POST' }))
    expect(response.status).toBe(200)
    expect(mockInitialize).toHaveBeenCalledWith(expect.objectContaining({
      email: 'reader@example.com', userId: 'user-1', secretKey: 'sk_test', callbackUrl: 'https://salimcyrus.com/journal',
    }))
  })
})
