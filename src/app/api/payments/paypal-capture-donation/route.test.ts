/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('../../../../lib/api/paypal', () => ({
  getPayPalAccessToken: jest.fn(),
  capturePayPalOrder: jest.fn(),
}))
jest.mock('../../../../services/payments/donations', () => ({
  recordDonation: jest.fn(),
}))

import { GET } from './route'
import { getPayPalAccessToken, capturePayPalOrder } from '@/lib/api/paypal'
import { recordDonation } from '@/services/payments/donations'

const mockGetToken = getPayPalAccessToken as jest.Mock
const mockCapture = capturePayPalOrder as jest.Mock
const mockRecordDonation = recordDonation as jest.Mock

function request(query: string) {
  return new NextRequest(`https://salimcyrus.com/api/payments/paypal-capture-donation?${query}`)
}

describe('GET /api/payments/paypal-capture-donation', () => {
  const originalId = process.env.PAYPAL_CLIENT_ID
  const originalSecret = process.env.PAYPAL_CLIENT_SECRET

  beforeEach(() => {
    process.env.PAYPAL_CLIENT_ID = 'client-id'
    process.env.PAYPAL_CLIENT_SECRET = 'client-secret'
    mockGetToken.mockResolvedValue('tok_123')
  })

  afterEach(() => {
    process.env.PAYPAL_CLIENT_ID = originalId
    process.env.PAYPAL_CLIENT_SECRET = originalSecret
    jest.clearAllMocks()
  })

  it('returns 400 when the order token is missing', async () => {
    const response = await GET(request(''))
    expect(response.status).toBe(400)
  })

  it('returns 402 when the capture is not COMPLETED', async () => {
    mockCapture.mockResolvedValue({ status: 'PENDING' })
    const response = await GET(request('token=order-1'))
    expect(response.status).toBe(402)
    expect(mockRecordDonation).not.toHaveBeenCalled()
  })

  it('returns 403 when the reference does not match a donation (tamper/reuse guard)', async () => {
    mockCapture.mockResolvedValue({ status: 'COMPLETED', referenceId: 'book:some-book:user-1' })
    const response = await GET(request('token=order-1'))
    expect(response.status).toBe(403)
    expect(mockRecordDonation).not.toHaveBeenCalled()
  })

  it('returns 502 when PayPal reports no payer email', async () => {
    mockCapture.mockResolvedValue({
      status: 'COMPLETED',
      referenceId: 'donation:support-the-mission',
      payerEmail: '',
    })
    const response = await GET(request('token=order-1'))
    expect(response.status).toBe(502)
  })

  it('records the donation using PayPal-reported payer identity (no site account required)', async () => {
    mockCapture.mockResolvedValue({
      status: 'COMPLETED',
      captureId: 'cap-1',
      amountValue: '25.00',
      referenceId: 'donation:support-the-mission',
      payerEmail: 'donor@example.com',
      payerName: 'Generous Donor',
    })
    mockRecordDonation.mockResolvedValue({ isNew: true })

    const response = await GET(request('token=order-1'))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.status).toBe('confirmed')
    expect(mockRecordDonation).toHaveBeenCalledWith({
      reference: 'cap-1',
      provider: 'paypal',
      amountMinor: 2500,
      currency: 'USD',
      email: 'donor@example.com',
      name: 'Generous Donor',
    })
  })
})
