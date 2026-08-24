import { generateResetToken, hashResetToken } from './reset-token'

describe('generateResetToken', () => {
  it('generates a long, hex-only token', () => {
    const token = generateResetToken()
    expect(token).toMatch(/^[0-9a-f]{64}$/)
  })

  it('never generates the same token twice', () => {
    const tokens = new Set(Array.from({ length: 50 }, () => generateResetToken()))
    expect(tokens.size).toBe(50)
  })
})

describe('hashResetToken', () => {
  it('is deterministic for the same input', () => {
    const token = generateResetToken()
    expect(hashResetToken(token)).toBe(hashResetToken(token))
  })

  it('produces different hashes for different tokens', () => {
    expect(hashResetToken('token-a')).not.toBe(hashResetToken('token-b'))
  })

  it('never returns the raw token itself', () => {
    const token = generateResetToken()
    expect(hashResetToken(token)).not.toBe(token)
  })
})
