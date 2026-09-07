import { isSafeRedirectPath, safeRedirectPath } from './safe-redirect'

describe('isSafeRedirectPath', () => {
  it('accepts a root-relative path', () => {
    expect(isSafeRedirectPath('/books/the-cost-of-infidelity')).toBe(true)
    expect(isSafeRedirectPath('/dashboard')).toBe(true)
  })

  it('rejects an absolute external URL', () => {
    expect(isSafeRedirectPath('https://evil.example.com')).toBe(false)
    expect(isSafeRedirectPath('http://evil.example.com/phish')).toBe(false)
  })

  it('rejects a protocol-relative URL (still resolves to an external origin)', () => {
    expect(isSafeRedirectPath('//evil.example.com')).toBe(false)
  })

  it('rejects a backslash-prefixed path (some browsers treat \\ like /)', () => {
    expect(isSafeRedirectPath('/\\evil.example.com')).toBe(false)
  })

  it('rejects null, undefined, and empty string', () => {
    expect(isSafeRedirectPath(null)).toBe(false)
    expect(isSafeRedirectPath(undefined)).toBe(false)
    expect(isSafeRedirectPath('')).toBe(false)
  })

  it('rejects a path with no leading slash', () => {
    expect(isSafeRedirectPath('books/x')).toBe(false)
  })
})

describe('safeRedirectPath', () => {
  it('returns the path when safe', () => {
    expect(safeRedirectPath('/books/x', '/dashboard')).toBe('/books/x')
  })

  it('returns the fallback when unsafe', () => {
    expect(safeRedirectPath('https://evil.example.com', '/dashboard')).toBe('/dashboard')
    expect(safeRedirectPath(null, '/dashboard')).toBe('/dashboard')
  })
})
