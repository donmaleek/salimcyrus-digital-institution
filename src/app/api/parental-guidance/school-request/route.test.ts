/**
 * @jest-environment node
 */
jest.mock('../../../../lib/db', () => ({
  db: { $transaction: jest.fn() },
}))

import { NextRequest } from 'next/server'
import { POST } from './route'
import { db } from '@/lib/db'

const mockTransaction = db.$transaction as jest.Mock

function fakeTx(overrides: Record<string, unknown> = {}) {
  return {
    crmContact: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'contact-1' }),
      update: jest.fn().mockResolvedValue({}),
    },
    crmActivity: { create: jest.fn().mockResolvedValue({}) },
    crmTask: { create: jest.fn().mockResolvedValue({}) },
    ...overrides,
  }
}

function request(body: unknown) {
  return new NextRequest('https://salimcyrus.com/api/parental-guidance/school-request', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

const validBody = {
  organizationName: 'Riverside Academy',
  contactName: 'Jordan Kim',
  email: 'jordan@riverside.example',
  message: 'We would like to bring the Parental Guidance curriculum to our parent community for a term, starting with a workshop.',
}

describe('POST /api/parental-guidance/school-request', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockTransaction.mockImplementation((callback: (tx: unknown) => unknown) => callback(fakeTx()))
  })

  it('returns 400 for a message under the minimum length (prevents empty/low-effort spam)', async () => {
    const response = await POST(request({ ...validBody, message: 'Too short' }))
    expect(response.status).toBe(400)
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  it('returns 400 for a missing organization name', async () => {
    const response = await POST(request({ ...validBody, organizationName: '' }))
    expect(response.status).toBe(400)
  })

  it('returns 400 for a missing/invalid email', async () => {
    const response = await POST(request({ ...validBody, email: 'not-an-email' }))
    expect(response.status).toBe(400)
  })

  it('creates a new CRM lead, activity, and a high-priority task for a first-time contact', async () => {
    const tx = fakeTx()
    mockTransaction.mockImplementation((callback: (tx: unknown) => unknown) => callback(tx))

    const response = await POST(request(validBody))

    expect(response.status).toBe(201)
    expect(tx.crmContact.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          lifecycleStage: 'lead',
          source: 'parental-guidance-school-request',
          primaryEmail: 'jordan@riverside.example',
        }),
      })
    )
    expect(tx.crmActivity.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          contactId: 'contact-1',
          type: 'enquiry',
          subject: expect.stringContaining('Riverside Academy'),
          metadata: { organizationName: 'Riverside Academy' },
        }),
      })
    )
    expect(tx.crmTask.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ priority: 'high', contactId: 'contact-1' }),
      })
    )
  })

  it('reuses an existing CRM contact instead of creating a duplicate', async () => {
    const tx = fakeTx({
      crmContact: {
        findFirst: jest.fn().mockResolvedValue({ id: 'existing-contact' }),
        create: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
    })
    mockTransaction.mockImplementation((callback: (tx: unknown) => unknown) => callback(tx))

    await POST(request(validBody))

    expect(tx.crmContact.create).not.toHaveBeenCalled()
    expect(tx.crmActivity.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ contactId: 'existing-contact' }) })
    )
  })
})
