const { NextRequest } = require('next/server')

const mockGetServerSession = jest.fn()
const mockDb = { $transaction: jest.fn() }

jest.mock('next-auth', () => ({
  getServerSession: (...args) => mockGetServerSession(...args),
}))
jest.mock('../../src/lib/db', () => ({ db: mockDb }))
jest.mock('../../src/lib/auth', () => ({ authOptions: {} }))

const { POST } = require('../../src/app/api/booking/confirm/route')

const validBody = {
  name: 'Paid Client',
  email: 'paid@example.com',
  offerName: 'Starter Session',
  paymentReference: 'paystack_ref_123',
}

function request(body = validBody) {
  return new NextRequest('http://localhost/api/booking/confirm', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function transactionClient(overrides = {}) {
  const paidBooking = {
    id: 'booking-1',
    email: 'paid@example.com',
    offerName: 'Payment received (unmatched offer)',
    source: 'paystack_webhook',
    status: 'paid',
    paystackReference: 'paystack_ref_123',
    userId: null,
    slotId: null,
    confirmedAt: null,
  }
  return {
    booking: {
      findUnique: jest.fn().mockResolvedValue(paidBooking),
      update: jest.fn().mockResolvedValue({ ...paidBooking, status: 'confirmed' }),
    },
    crmTransaction: {
      findUnique: jest.fn().mockResolvedValue({
        provider: 'paystack',
        status: 'successful',
      }),
    },
    user: { findUnique: jest.fn().mockResolvedValue(null) },
    availabilitySlot: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
    crmContact: {
      findFirst: jest.fn().mockResolvedValue({ id: 'contact-1' }),
      create: jest.fn(),
      update: jest.fn(),
    },
    crmActivity: { create: jest.fn() },
    crmTask: { create: jest.fn() },
    ...overrides,
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  mockGetServerSession.mockResolvedValue(null)
})

test('rejects a booking confirmation without a matching successful payment', async () => {
  const tx = transactionClient()
  tx.booking.findUnique.mockResolvedValue(null)
  mockDb.$transaction.mockImplementation((callback) => callback(tx))

  const response = await POST(request())

  expect(response.status).toBe(422)
  expect(await response.json()).toEqual(
    expect.objectContaining({ error: expect.stringContaining('verify') })
  )
  expect(tx.booking.update).not.toHaveBeenCalled()
  expect(tx.crmTask.create).not.toHaveBeenCalled()
})

test('claims only a future unbooked slot and rolls back when it is unavailable', async () => {
  const tx = transactionClient()
  tx.availabilitySlot.updateMany.mockResolvedValue({ count: 0 })
  mockDb.$transaction.mockImplementation((callback) => callback(tx))

  const response = await POST(request({ ...validBody, slotId: 'past-or-booked-slot' }))

  expect(response.status).toBe(409)
  expect(tx.availabilitySlot.updateMany).toHaveBeenCalledWith({
    where: {
      id: 'past-or-booked-slot',
      isBooked: false,
      startTime: { gt: expect.any(Date) },
    },
    data: { isBooked: true },
  })
  expect(tx.booking.update).not.toHaveBeenCalled()
})

test('updates the paid booking instead of creating a duplicate booking', async () => {
  const tx = transactionClient()
  mockDb.$transaction.mockImplementation((callback) => callback(tx))

  const response = await POST(request())

  expect(response.status).toBe(201)
  expect(tx.booking.update).toHaveBeenCalledWith(
    expect.objectContaining({
      where: { id: 'booking-1' },
      data: expect.objectContaining({
        status: 'confirmed',
        offerName: 'Starter Session',
        confirmedAt: expect.any(Date),
      }),
    })
  )
  expect(tx.crmActivity.create).toHaveBeenCalledTimes(1)
  expect(tx.crmTask.create).toHaveBeenCalledTimes(1)
})

test('accepts a booking paid via PayPal, not just Paystack', async () => {
  const tx = transactionClient({
    booking: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'booking-2',
        email: 'paid@example.com',
        offerName: 'Starter Session',
        source: 'paypal_checkout',
        status: 'paid',
        paystackReference: 'paypal_ref_123',
        userId: null,
        slotId: null,
        confirmedAt: null,
      }),
      update: jest.fn().mockResolvedValue({ id: 'booking-2', status: 'confirmed' }),
    },
    crmTransaction: {
      findUnique: jest.fn().mockResolvedValue({ provider: 'paypal', status: 'successful' }),
    },
  })
  mockDb.$transaction.mockImplementation((callback) => callback(tx))

  const response = await POST(request({ ...validBody, paymentReference: 'paypal_ref_123' }))

  expect(response.status).toBe(201)
  expect(tx.booking.update).toHaveBeenCalled()
})

test('accepts a booking paid via an approved Paybill claim', async () => {
  const tx = transactionClient({
    booking: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'booking-3',
        email: 'paid@example.com',
        offerName: 'Starter Session',
        source: 'paybill_checkout',
        status: 'paid',
        paystackReference: 'MPESA_CODE_1',
        userId: null,
        slotId: null,
        confirmedAt: null,
      }),
      update: jest.fn().mockResolvedValue({ id: 'booking-3', status: 'confirmed' }),
    },
    crmTransaction: {
      findUnique: jest.fn().mockResolvedValue({ provider: 'paybill', status: 'successful' }),
    },
  })
  mockDb.$transaction.mockImplementation((callback) => callback(tx))

  const response = await POST(request({ ...validBody, paymentReference: 'MPESA_CODE_1' }))

  expect(response.status).toBe(201)
  expect(tx.booking.update).toHaveBeenCalled()
})

test('rejects a booking row that was never actually paid through a verified provider', async () => {
  const tx = transactionClient({
    booking: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'booking-4',
        email: 'paid@example.com',
        offerName: 'Starter Session',
        source: 'manual',
        status: 'pending',
        paystackReference: 'fabricated_ref',
        userId: null,
        slotId: null,
        confirmedAt: null,
      }),
      update: jest.fn(),
    },
    crmTransaction: {
      findUnique: jest.fn().mockResolvedValue({ provider: 'paystack', status: 'successful' }),
    },
  })
  mockDb.$transaction.mockImplementation((callback) => callback(tx))

  const response = await POST(request({ ...validBody, paymentReference: 'fabricated_ref' }))

  expect(response.status).toBe(422)
  expect(tx.booking.update).not.toHaveBeenCalled()
})

test('rejects malformed JSON and arbitrary offer names before database access', async () => {
  const invalidJson = new NextRequest('http://localhost/api/booking/confirm', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{',
  })
  const malformedResponse = await POST(invalidJson)
  const unknownOfferResponse = await POST(
    request({ ...validBody, offerName: 'Injected offer' })
  )

  expect(malformedResponse.status).toBe(400)
  expect(unknownOfferResponse.status).toBe(400)
  expect(mockDb.$transaction).not.toHaveBeenCalled()
})
