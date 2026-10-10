/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('../../../../../../services/crm/access', () => ({
  requireCrmApi: jest.fn(),
}))
jest.mock('../../../../../../lib/db', () => ({
  db: { coachingOfferOverride: { upsert: jest.fn(), deleteMany: jest.fn() } },
}))

import { PUT, DELETE } from './route'
import { requireCrmApi } from '@/services/crm/access'
import { db } from '@/lib/db'
import { coachingOffers } from '@/lib/data/coaching-offers'

const mockRequireCrmApi = requireCrmApi as jest.Mock
const mockUpsert = db.coachingOfferOverride.upsert as jest.Mock
const mockDeleteMany = db.coachingOfferOverride.deleteMany as jest.Mock

const targetOffer = coachingOffers[0]

function putRequest(body: unknown) {
  return new NextRequest(`https://salimcyrus.com/api/admin/coaching/offers/x`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

function params(name: string) {
  return { params: Promise.resolve({ name: encodeURIComponent(name) }) }
}

describe('PUT /api/admin/coaching/offers/[name]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireCrmApi.mockResolvedValue(true)
    mockUpsert.mockResolvedValue({ offerName: targetOffer.name })
  })

  it('returns 403 without the content:write permission', async () => {
    mockRequireCrmApi.mockResolvedValue(false)
    const response = await PUT(putRequest({ priceKes: 1000, priceUsd: null, duration: null, tagline: null, location: null }), params(targetOffer.name))
    expect(response.status).toBe(403)
    expect(mockUpsert).not.toHaveBeenCalled()
  })

  it('returns 404 for a name that matches no static offer, never silently creating an override for a typo', async () => {
    const response = await PUT(putRequest({ priceKes: 1000, priceUsd: null, duration: null, tagline: null, location: null }), params('Not A Real Offer'))
    expect(response.status).toBe(404)
    expect(mockUpsert).not.toHaveBeenCalled()
  })

  it('returns 400 for an invalid body', async () => {
    const response = await PUT(putRequest({ priceKes: 'not-a-number', priceUsd: null, duration: null, tagline: null, location: null }), params(targetOffer.name))
    expect(response.status).toBe(400)
  })

  it('upserts the override keyed by the decoded offer name, with every field independently settable', async () => {
    await PUT(
      putRequest({ priceKes: 12000, priceUsd: 92, duration: '3 Hours', tagline: null, location: null }),
      params(targetOffer.name)
    )
    expect(mockUpsert).toHaveBeenCalledWith({
      where: { offerName: targetOffer.name },
      create: { offerName: targetOffer.name, priceKes: 12000, priceUsd: 92, duration: '3 Hours', tagline: null, location: null },
      update: { priceKes: 12000, priceUsd: 92, duration: '3 Hours', tagline: null, location: null },
    })
  })

  it('accepts a name containing spaces and ampersands once decoded from the URL', async () => {
    const named = 'Identity & Life Alignment Session'
    const response = await PUT(
      putRequest({ priceKes: 1000, priceUsd: null, duration: null, tagline: null, location: null }),
      params(named)
    )
    expect(response.status).toBe(200)
    expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({ where: { offerName: named } }))
  })
})

describe('DELETE /api/admin/coaching/offers/[name]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireCrmApi.mockResolvedValue(true)
  })

  it('returns 403 without the content:write permission', async () => {
    mockRequireCrmApi.mockResolvedValue(false)
    const response = await DELETE(new NextRequest('https://salimcyrus.com/x'), params(targetOffer.name))
    expect(response.status).toBe(403)
    expect(mockDeleteMany).not.toHaveBeenCalled()
  })

  it('clears any override for the offer, reverting it to its static defaults', async () => {
    const response = await DELETE(new NextRequest('https://salimcyrus.com/x'), params(targetOffer.name))
    expect(response.status).toBe(200)
    expect(mockDeleteMany).toHaveBeenCalledWith({ where: { offerName: targetOffer.name } })
  })
})
