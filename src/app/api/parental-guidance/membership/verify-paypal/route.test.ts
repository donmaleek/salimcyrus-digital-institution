/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('../../../../../lib/auth', () => ({ authOptions: {} }))
jest.mock('../../../../../lib/api/paypal', () => ({
  getPayPalAccessToken: jest.fn(),
  capturePayPalOrder: jest.fn(),
}))
jest.mock('../../../../../services/payments/parent-membership', () => ({
  recordParentMembership: jest.fn(),
  PARENT_MEMBERSHIP_PRICE_USD: 12,
}))

import { GET } from './route'
import { getServerSession } from 'next-auth'
import { getPayPalAccessToken, capturePayPalOrder } from '@/lib/api/paypal'
import { recordParentMembership } from '@/services/payments/parent-membership'

const mockGetServerSession = getServerSession as jest.Mock
const mockGetToken = getPayPalAccessToken as jest.Mock
const mockCapture = capturePayPalOrder as jest.Mock
const mockRecordMembership = recordParentMembership as jest.Mock

function request(query: string) {
  return new NextRequest(`https://salimcyrus.com/api/parental-guidance/membership/verify-paypal?${query}`)
}

describe('GET /api/parental-guidance/membership/verify-paypal', () => {
  const originalId = process.env.PAYPAL_CLIENT_ID
  const originalSecret = process.env.PAYPAL_CLIENT_SECRET

  beforeEach(() => {
    process.env.PAYPAL_CLIENT_ID = 'client-id'
    process.env.PAYPAL_CLIENT_SECRET = 'client-secret'
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1', email: 'parent@example.com', name: 'Parent' } })
    mockGetToken.mockResolvedValue('tok_123')
  })

  afterEach(() => {
    process.env.PAYPAL_CLIENT_ID = originalId
    process.env.PAYPAL_CLIENT_SECRET = originalSecret
    jest.clearAllMocks()
  })

  it('returns 401 when signed out', async () => {
    mockGetServerSession.mockResolvedValue(null)
    const response = await GET(request('token=order-1'))
    expect(response.status).toBe(401)
  })

  it('returns 400 when the token is missing', async () => {
    const response = await GET(request(''))
    expect(response.status).toBe(400)
  })

  it('returns 402 when the capture is not COMPLETED', async () => {
    mockCapture.mockResolvedValue({ status: 'PENDING' })
    const response = await GET(request('token=order-1'))
    expect(response.status).toBe(402)
    expect(mockRecordMembership).not.toHaveBeenCalled()
  })

  it('returns 403 when the reference does not match this session (tamper guard)', async () => {
    mockCapture.mockResolvedValue({
      status: 'COMPLETED',
      captureId: 'cap-1',
      amountValue: '12.00',
      currencyCode: 'USD',
      referenceId: 'parent-membership:someone-else',
    })
    const response = await GET(request('token=order-1'))
    expect(response.status).toBe(403)
    expect(mockRecordMembership).not.toHaveBeenCalled()
  })

  it('returns 403 when the captured amount does not match the membership price', async () => {
    mockCapture.mockResolvedValue({
      status: 'COMPLETED',
      captureId: 'cap-1',
      amountValue: '1.00',
      currencyCode: 'USD',
      referenceId: 'parent-membership:user-1',
    })
    const response = await GET(request('token=order-1'))
    expect(response.status).toBe(403)
    expect(mockRecordMembership).not.toHaveBeenCalled()
  })

  it('records the membership in USD using the session identity, not PayPal payer info', async () => {
    mockCapture.mockResolvedValue({
      status: 'COMPLETED',
      captureId: 'cap-1',
      amountValue: '12.00',
      currencyCode: 'USD',
      payerEmail: 'different-paypal-account@example.com',
      referenceId: 'parent-membership:user-1',
    })
    mockRecordMembership.mockResolvedValue({ membershipId: 'mem-1', expiresAt: new Date('2026-11-09'), isNew: true })

    const response = await GET(request('token=order-1'))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.status).toBe('confirmed')
    expect(mockRecordMembership).toHaveBeenCalledWith({
      userId: 'user-1',
      reference: 'cap-1',
      provider: 'paypal',
      amountMinor: 1200,
      currency: 'USD',
    })
  })
})
