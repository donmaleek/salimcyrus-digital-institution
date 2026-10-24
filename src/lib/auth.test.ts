jest.mock('./db', () => ({
  db: {
    user: { findUnique: jest.fn() },
  },
}))

import { authOptions } from './auth'
import { db } from './db'

const mockFindUnique = db.user.findUnique as jest.Mock

type JwtToken = {
  id?: string
  isAdmin?: boolean
  crmRole?: string
  roleCheckedAt?: number
}

const jwt = authOptions.callbacks!.jwt! as (args: {
  token: JwtToken
  user?: { id: string; isAdmin?: boolean; crmRole?: string }
}) => Promise<JwtToken>

describe('authOptions.callbacks.jwt (CSO finding e9242976532b390881e899cf86e7d1fa)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('bakes isAdmin/crmRole into the token at sign-in', async () => {
    const token = await jwt({
      token: {},
      user: { id: 'user-1', isAdmin: true, crmRole: 'owner' },
    })

    expect(token.id).toBe('user-1')
    expect(token.isAdmin).toBe(true)
    expect(token.crmRole).toBe('owner')
    expect(typeof token.roleCheckedAt).toBe('number')
    expect(mockFindUnique).not.toHaveBeenCalled()
  })

  it('does not hit the database again within the revalidation window', async () => {
    const token = await jwt({
      token: { id: 'user-1', isAdmin: true, crmRole: 'owner', roleCheckedAt: Date.now() - 1000 },
    })

    expect(token.isAdmin).toBe(true)
    expect(token.crmRole).toBe('owner')
    expect(mockFindUnique).not.toHaveBeenCalled()
  })

  it('revokes a demoted admin/CRM role once the revalidation window elapses, instead of trusting the stale JWT for the rest of its ~30-day life', async () => {
    mockFindUnique.mockResolvedValue({ isAdmin: false, crmRole: 'customer' })

    const staleToken: JwtToken = {
      id: 'user-1',
      isAdmin: true,
      crmRole: 'owner',
      roleCheckedAt: Date.now() - 6 * 60 * 1000, // past the 5-minute window
    }

    const token = await jwt({ token: staleToken })

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: { isAdmin: true, crmRole: true },
    })
    expect(token.isAdmin).toBe(false)
    expect(token.crmRole).toBe('customer')
  })

  it('fails closed (strips admin/CRM access) when the database lookup errors', async () => {
    mockFindUnique.mockRejectedValue(new Error('connection reset'))

    const staleToken: JwtToken = {
      id: 'user-1',
      isAdmin: true,
      crmRole: 'owner',
      roleCheckedAt: Date.now() - 6 * 60 * 1000,
    }

    const token = await jwt({ token: staleToken })

    expect(token.isAdmin).toBe(false)
    expect(token.crmRole).toBe('customer')
  })

  it('fails closed when the user has been deleted from the database', async () => {
    mockFindUnique.mockResolvedValue(null)

    const staleToken: JwtToken = {
      id: 'user-1',
      isAdmin: true,
      crmRole: 'owner',
      roleCheckedAt: Date.now() - 6 * 60 * 1000,
    }

    const token = await jwt({ token: staleToken })

    expect(token.isAdmin).toBe(false)
    expect(token.crmRole).toBe('customer')
  })
})
