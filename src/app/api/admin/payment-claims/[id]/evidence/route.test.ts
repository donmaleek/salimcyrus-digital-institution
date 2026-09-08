/**
 * @jest-environment node
 */
jest.mock('fs', () => ({
  readFileSync: jest.fn(() => Buffer.from('fake image bytes')),
}))
jest.mock('../../../../../../services/crm/access', () => ({
  requireCrmApi: jest.fn(),
}))
jest.mock('../../../../../../lib/db', () => ({
  db: { paymentClaim: { findUnique: jest.fn() } },
}))
jest.mock('../../../../../../lib/api/payment-evidence-storage', () => ({
  evidenceFilePath: jest.fn((name: string) => `/evidence/${name}`),
  evidenceFileExists: jest.fn(),
}))

import { GET } from './route'
import { requireCrmApi } from '@/services/crm/access'
import { db } from '@/lib/db'
import { evidenceFileExists } from '@/lib/api/payment-evidence-storage'

const mockRequireCrmApi = requireCrmApi as jest.Mock
const mockFindUnique = db.paymentClaim.findUnique as jest.Mock
const mockFileExists = evidenceFileExists as jest.Mock

describe('GET /api/admin/payment-claims/[id]/evidence', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireCrmApi.mockResolvedValue({ id: 'admin-1', email: 'admin@example.com', role: 'finance' })
  })

  it('returns 403 without the finance:read permission', async () => {
    mockRequireCrmApi.mockResolvedValue(null)
    const response = await GET(new Request('https://salimcyrus.com/x'), { params: { id: 'c1' } })
    expect(response.status).toBe(403)
  })

  it('returns 404 when the claim has no attached evidence', async () => {
    mockFindUnique.mockResolvedValue({ id: 'c1', evidenceFileName: null })
    const response = await GET(new Request('https://salimcyrus.com/x'), { params: { id: 'c1' } })
    expect(response.status).toBe(404)
  })

  it('returns 503 when the file is missing on disk', async () => {
    mockFindUnique.mockResolvedValue({ id: 'c1', evidenceFileName: 'CODE1-123.jpg' })
    mockFileExists.mockReturnValue(false)
    const response = await GET(new Request('https://salimcyrus.com/x'), { params: { id: 'c1' } })
    expect(response.status).toBe(503)
  })

  it('streams the evidence image with the correct content type', async () => {
    mockFindUnique.mockResolvedValue({ id: 'c1', evidenceFileName: 'CODE1-123.jpg' })
    mockFileExists.mockReturnValue(true)
    const response = await GET(new Request('https://salimcyrus.com/x'), { params: { id: 'c1' } })
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('image/jpeg')
    expect(response.headers.get('Cache-Control')).toBe('private, no-store')
  })
})
