/**
 * @jest-environment node
 */
jest.mock('../../../../../services/crm/access', () => ({
  requireCrmApi: jest.fn(),
}))
jest.mock('../../../../../lib/data/coaching-catalog', () => ({
  getCoachingOffers: jest.fn(),
}))

import { GET } from './route'
import { requireCrmApi } from '@/services/crm/access'
import { getCoachingOffers } from '@/lib/data/coaching-catalog'

const mockRequireCrmApi = requireCrmApi as jest.Mock
const mockGetCoachingOffers = getCoachingOffers as jest.Mock

describe('GET /api/admin/coaching/offers', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 403 without the content:write permission', async () => {
    mockRequireCrmApi.mockResolvedValue(false)
    const response = await GET()
    expect(response.status).toBe(403)
    expect(mockGetCoachingOffers).not.toHaveBeenCalled()
  })

  it('returns the merged (override-applied) offers, the same data a checkout route would charge', async () => {
    mockRequireCrmApi.mockResolvedValue(true)
    mockGetCoachingOffers.mockResolvedValue([{ name: 'Starter Session', priceKes: 3500 }])
    const response = await GET()
    const payload = await response.json()
    expect(response.status).toBe(200)
    expect(payload.offers).toEqual([{ name: 'Starter Session', priceKes: 3500 }])
  })
})
