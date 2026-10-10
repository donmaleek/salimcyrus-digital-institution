/**
 * @jest-environment node
 */
jest.mock('../../../../lib/db', () => ({
  db: { $transaction: jest.fn() },
}))
jest.mock('../../../../lib/data/coaching-catalog', () => ({
  getCoachingOfferByName: jest.fn(),
}))

import { NextRequest } from 'next/server'
import { POST } from './route'
import { db } from '@/lib/db'
import { getCoachingOfferByName } from '@/lib/data/coaching-catalog'

const mockTransaction = db.$transaction as jest.Mock
const mockGetOffer = getCoachingOfferByName as jest.Mock

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
  return new NextRequest('https://salimcyrus.com/api/coaching/trip-details', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

const individualOfferName = 'Individual Coaching, Your Location (Kenya, Outside Mombasa)'
const couplesOfferName = 'Couples Coaching, Your Location (Kenya, Outside Mombasa)'

const validIndividualBody = {
  offerName: individualOfferName,
  name: 'Jordan Kim',
  phone: '+254700000000',
  email: 'jordan@example.com',
  location: 'Nakuru town',
  preferredDate: '2026-11-20',
  preferredTime: '14:00',
  notes: 'Prefer afternoon.',
}

describe('POST /api/coaching/trip-details', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockTransaction.mockImplementation((callback: (tx: unknown) => unknown) => callback(fakeTx()))
    mockGetOffer.mockImplementation((name: string) =>
      Promise.resolve(
        name === individualOfferName
          ? { name: individualOfferName, category: 'individual', requiresTripDetails: true }
          : name === couplesOfferName
            ? { name: couplesOfferName, category: 'couples', requiresTripDetails: true }
            : null
      )
    )
  })

  it('returns 400 for a missing required field', async () => {
    const response = await POST(request({ ...validIndividualBody, location: '' }))
    expect(response.status).toBe(400)
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  it('returns 404 for an offer that does not require trip details, never silently recording one anyway', async () => {
    mockGetOffer.mockResolvedValue({ name: 'Starter Session', category: 'standard', requiresTripDetails: false })
    const response = await POST(request({ ...validIndividualBody, offerName: 'Starter Session' }))
    expect(response.status).toBe(404)
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  it('returns 404 for an unknown offer name', async () => {
    const response = await POST(request({ ...validIndividualBody, offerName: 'Not A Real Offer' }))
    expect(response.status).toBe(404)
  })

  it('requires a participant count for the couples variant', async () => {
    const response = await POST(request({ ...validIndividualBody, offerName: couplesOfferName }))
    expect(response.status).toBe(400)
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  it('does not require a participant count for the individual variant', async () => {
    const response = await POST(request(validIndividualBody))
    expect(response.status).toBe(201)
  })

  it('creates a CRM lead, activity, and high-priority task naming the offer and the logistics', async () => {
    const tx = fakeTx()
    mockTransaction.mockImplementation((callback: (tx: unknown) => unknown) => callback(tx))

    const response = await POST(request(validIndividualBody))

    expect(response.status).toBe(201)
    expect(tx.crmContact.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          lifecycleStage: 'lead',
          source: 'coaching-trip-details',
          primaryEmail: 'jordan@example.com',
        }),
      })
    )
    expect(tx.crmActivity.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          contactId: 'contact-1',
          subject: expect.stringContaining(individualOfferName),
          body: expect.stringContaining('Nakuru town'),
        }),
      })
    )
    expect(tx.crmTask.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ priority: 'high', contactId: 'contact-1' }),
      })
    )
  })

  it('records the participant count for the couples variant when provided', async () => {
    const tx = fakeTx()
    mockTransaction.mockImplementation((callback: (tx: unknown) => unknown) => callback(tx))

    await POST(request({ ...validIndividualBody, offerName: couplesOfferName, name: 'Jordan and Sam Kim', participants: 2 }))

    expect(tx.crmActivity.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ body: expect.stringContaining('Participants: 2') }) })
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

    await POST(request(validIndividualBody))

    expect(tx.crmContact.create).not.toHaveBeenCalled()
    expect(tx.crmActivity.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ contactId: 'existing-contact' }) })
    )
  })
})
