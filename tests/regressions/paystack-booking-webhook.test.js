const { NextRequest } = require('next/server')

const mockDb = {
  user: { findFirst: jest.fn() },
  $transaction: jest.fn(),
}

jest.mock('../../src/lib/db', () => ({ db: mockDb }))
jest.mock('../../src/lib/api/paystack', () => ({
  verifyPaystackSignature: jest.fn(() => true),
  matchOfferByAmount: jest.fn(() => null),
}))

const { POST } = require('../../src/app/api/payments/webhook/route')

const event = {
  event: 'charge.success',
  data: {
    reference: 'PS_REPLAY_1',
    amount: 250000,
    customer: {
      email: 'Paid.Client@Example.com',
      first_name: 'Paid',
      last_name: 'Client',
    },
    metadata: { offer_name: 'Starter Session' },
  },
}

function request(payload = event) {
  return new NextRequest('http://localhost/api/payments/webhook', {
    method: 'POST',
    headers: { 'x-paystack-signature': 'valid' },
    body: typeof payload === 'string' ? payload : JSON.stringify(payload),
  })
}

function transactionClient({ replay = false } = {}) {
  return {
    booking: {
      findUnique: jest.fn().mockResolvedValue(
        replay ? { id: 'booking-1', source: 'paystack_webhook' } : null
      ),
      upsert: jest.fn().mockResolvedValue({ id: 'booking-1' }),
    },
    crmTransaction: {
      findUnique: jest.fn().mockResolvedValue(
        replay ? { id: 'transaction-1', provider: 'paystack' } : null
      ),
      upsert: jest.fn(),
    },
    crmContact: {
      findFirst: jest.fn().mockResolvedValue({ id: 'contact-1' }),
      create: jest.fn(),
    },
    crmDonation: { findFirst: jest.fn(), create: jest.fn() },
    crmActivity: { create: jest.fn() },
    crmAuditEvent: { create: jest.fn() },
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  mockDb.user.findFirst.mockResolvedValue({ id: 'user-1' })
})

test('a Paystack replay updates money state without duplicating timeline or audit records', async () => {
  const tx = transactionClient({ replay: true })
  mockDb.$transaction.mockImplementation((callback) => callback(tx))

  const response = await POST(request())

  expect(response.status).toBe(200)
  expect(tx.booking.upsert).toHaveBeenCalledTimes(1)
  expect(tx.crmTransaction.upsert).toHaveBeenCalledTimes(1)
  expect(tx.crmActivity.create).not.toHaveBeenCalled()
  expect(tx.crmAuditEvent.create).not.toHaveBeenCalled()
})

test('a new payment creates one paid booking and one set of evidence', async () => {
  const tx = transactionClient()
  mockDb.$transaction.mockImplementation((callback) => callback(tx))

  const response = await POST(request())

  expect(response.status).toBe(200)
  expect(tx.booking.upsert).toHaveBeenCalledWith(
    expect.objectContaining({
      create: expect.objectContaining({ status: 'paid', userId: 'user-1' }),
    })
  )
  expect(tx.crmActivity.create).toHaveBeenCalledTimes(1)
  expect(tx.crmAuditEvent.create).toHaveBeenCalledTimes(1)
  expect(mockDb.user.findFirst).toHaveBeenCalledWith({
    where: {
      email: { equals: 'paid.client@example.com', mode: 'insensitive' },
    },
  })
})

test('a signed but malformed event fails closed before database access', async () => {
  const response = await POST(request('{'))

  expect(response.status).toBe(400)
  expect(mockDb.$transaction).not.toHaveBeenCalled()
})
