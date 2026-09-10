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
  return new NextRequest('https://salimcyrus.com/api/coaching/request-quote', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

const validBody = {
  name: 'Jordan Kim',
  email: 'jordan@example.com',
  category: 'vip-summit',
  tierLabel: 'Speaking Engagement',
  message: 'We would like Salim to keynote our men\'s conference in November, expecting 800 attendees.',
}

describe('POST /api/coaching/request-quote', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockTransaction.mockImplementation((callback: (tx: unknown) => unknown) => callback(fakeTx()))
  })

  it('returns 400 for a message under the minimum length (prevents empty/low-effort spam)', async () => {
    const response = await POST(request({ ...validBody, message: 'Too short' }))
    expect(response.status).toBe(400)
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  it('returns 400 for an invalid category', async () => {
    const response = await POST(request({ ...validBody, category: 'standard' }))
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
          source: 'coaching-quote-request',
          primaryEmail: 'jordan@example.com',
        }),
      })
    )
    expect(tx.crmActivity.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          contactId: 'contact-1',
          type: 'enquiry',
          subject: expect.stringContaining('Speaking Engagement'),
          metadata: { category: 'vip-summit', tierLabel: 'Speaking Engagement' },
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

  it('names the category and tier in the task subject so a follow-up does not require opening the CRM record first', async () => {
    const tx = fakeTx()
    mockTransaction.mockImplementation((callback: (tx: unknown) => unknown) => callback(tx))

    await POST(
      request({
        ...validBody,
        category: 'group',
        tierLabel: '200 to 1,000 People',
        message: 'We are planning a leadership retreat for around 400 staff in March next year.',
      })
    )

    expect(tx.crmActivity.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ subject: expect.stringContaining('200 to 1,000 People') }),
      })
    )
  })
})
