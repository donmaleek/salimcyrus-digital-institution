/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('../../../../../services/crm/access', () => ({
  requireCrmApi: jest.fn(),
}))
jest.mock('../../../../../services/payments/payment-claims', () => ({
  approvePaymentClaim: jest.fn(),
  rejectPaymentClaim: jest.fn(),
}))

import { PATCH } from './route'
import { requireCrmApi } from '@/services/crm/access'
import { approvePaymentClaim, rejectPaymentClaim } from '@/services/payments/payment-claims'

const mockRequireCrmApi = requireCrmApi as jest.Mock
const mockApprove = approvePaymentClaim as jest.Mock
const mockReject = rejectPaymentClaim as jest.Mock

function patchRequest(body: unknown) {
  return new NextRequest('https://salimcyrus.com/api/admin/payment-claims/c1', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

describe('PATCH /api/admin/payment-claims/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireCrmApi.mockResolvedValue({ id: 'admin-1', email: 'admin@example.com', role: 'finance' })
  })

  it('returns 403 without the finance:write permission', async () => {
    mockRequireCrmApi.mockResolvedValue(null)
    const response = await PATCH(patchRequest({ action: 'approve' }), { params: { id: 'c1' } })
    expect(response.status).toBe(403)
    expect(mockApprove).not.toHaveBeenCalled()
  })

  it('returns 400 for an invalid action', async () => {
    const response = await PATCH(patchRequest({ action: 'delete' }), { params: { id: 'c1' } })
    expect(response.status).toBe(400)
  })

  it('approves a claim, recording the reviewer email from the CRM principal', async () => {
    mockApprove.mockResolvedValue({ status: 'approved' })
    const response = await PATCH(patchRequest({ action: 'approve' }), { params: { id: 'c1' } })
    expect(response.status).toBe(200)
    expect(mockApprove).toHaveBeenCalledWith('c1', 'admin@example.com')
    expect(mockReject).not.toHaveBeenCalled()
  })

  it('rejects a claim with notes', async () => {
    mockReject.mockResolvedValue({ status: 'rejected' })
    const response = await PATCH(patchRequest({ action: 'reject', notes: 'Code did not match' }), {
      params: { id: 'c1' },
    })
    expect(response.status).toBe(200)
    expect(mockReject).toHaveBeenCalledWith('c1', 'admin@example.com', 'Code did not match')
  })

  it('returns 404 when the claim does not exist', async () => {
    mockApprove.mockResolvedValue({ status: 'not_found' })
    const response = await PATCH(patchRequest({ action: 'approve' }), { params: { id: 'missing' } })
    expect(response.status).toBe(404)
  })

  it('returns 409 when the claim was already reviewed', async () => {
    mockApprove.mockResolvedValue({ status: 'already_reviewed' })
    const response = await PATCH(patchRequest({ action: 'approve' }), { params: { id: 'c1' } })
    expect(response.status).toBe(409)
  })

  it('returns 404 when the underlying book or teaching no longer exists', async () => {
    mockApprove.mockResolvedValue({ status: 'offer_missing' })
    const response = await PATCH(patchRequest({ action: 'approve' }), { params: { id: 'c1' } })
    expect(response.status).toBe(404)
  })
})
