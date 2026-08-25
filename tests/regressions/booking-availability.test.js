const { NextRequest } = require('next/server')
const {
  isBookableStart,
  slotsOverlap,
} = require('../../src/services/bookings/availability')

const mockDb = {
  availabilitySlot: { findUnique: jest.fn() },
  $transaction: jest.fn(),
}

jest.mock('../../src/lib/db', () => ({ db: mockDb }))
jest.mock('../../src/services/crm/access', () => ({
  requireCrmApi: jest.fn().mockResolvedValue(true),
}))

const { POST, DELETE } = require('../../src/app/api/admin/availability/route')

function postRequest(body) {
  return new NextRequest('http://localhost/api/admin/availability', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

test('adjacent slots are allowed but intersecting slots overlap', () => {
  const first = { startTime: new Date('2026-09-01T10:00:00Z'), durationMinutes: 60 }
  const adjacent = { startTime: new Date('2026-09-01T11:00:00Z'), durationMinutes: 30 }
  const intersecting = { startTime: new Date('2026-09-01T10:59:00Z'), durationMinutes: 30 }

  expect(slotsOverlap(first, adjacent)).toBe(false)
  expect(slotsOverlap(first, intersecting)).toBe(true)
  expect(slotsOverlap(intersecting, first)).toBe(true)
})

test('a slot must start at least five minutes in the future', () => {
  const now = new Date('2026-09-01T10:00:00Z')

  expect(isBookableStart(new Date('2026-09-01T10:04:59Z'), now)).toBe(false)
  expect(isBookableStart(new Date('2026-09-01T10:05:00Z'), now)).toBe(true)
})

test('the availability API rejects past slots before opening a transaction', async () => {
  const response = await POST(
    postRequest({ startTime: '2020-01-01T10:00:00.000Z', durationMinutes: 60 })
  )

  expect(response.status).toBe(400)
  expect(mockDb.$transaction).not.toHaveBeenCalled()
})

test('the availability API rejects overlaps and does not create the slot', async () => {
  const tx = {
    availabilitySlot: {
      findMany: jest.fn().mockResolvedValue([
        { startTime: new Date('2099-01-01T10:00:00Z'), durationMinutes: 60 },
      ]),
      create: jest.fn(),
    },
    crmAuditEvent: { create: jest.fn() },
  }
  mockDb.$transaction.mockImplementation((callback) => callback(tx))

  const response = await POST(
    postRequest({ startTime: '2099-01-01T10:30:00.000Z', durationMinutes: 60 })
  )

  expect(response.status).toBe(409)
  expect(tx.availabilitySlot.create).not.toHaveBeenCalled()
  expect(tx.crmAuditEvent.create).not.toHaveBeenCalled()
})

test('a delete that loses a booking race fails without writing false audit evidence', async () => {
  mockDb.availabilitySlot.findUnique.mockResolvedValue({
    id: 'slot-1',
    isBooked: false,
    startTime: new Date('2099-01-01T10:00:00Z'),
    durationMinutes: 60,
  })
  const tx = {
    availabilitySlot: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    crmAuditEvent: { create: jest.fn() },
  }
  mockDb.$transaction.mockImplementation((callback) => callback(tx))
  const request = new NextRequest(
    'http://localhost/api/admin/availability?id=slot-1',
    { method: 'DELETE' }
  )

  const response = await DELETE(request)

  expect(response.status).toBe(409)
  expect(tx.crmAuditEvent.create).not.toHaveBeenCalled()
})
