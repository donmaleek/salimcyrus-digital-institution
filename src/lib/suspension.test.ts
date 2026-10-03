import { isAppSuspended, hasValidBypass, suspendedPageHtml } from './suspension'

describe('isAppSuspended', () => {
  it('is suspended only when APP_SUSPENDED is exactly "true"', () => {
    expect(isAppSuspended({ APP_SUSPENDED: 'true' })).toBe(true)
  })

  it('defaults to live (not suspended) when the env var is unset, since a missing var must never accidentally take a paying client offline', () => {
    expect(isAppSuspended({})).toBe(false)
  })

  it('treats any value other than the exact string "true" as live, including common typos/truthy-looking values', () => {
    expect(isAppSuspended({ APP_SUSPENDED: 'TRUE' })).toBe(false)
    expect(isAppSuspended({ APP_SUSPENDED: '1' })).toBe(false)
    expect(isAppSuspended({ APP_SUSPENDED: 'yes' })).toBe(false)
    expect(isAppSuspended({ APP_SUSPENDED: 'false' })).toBe(false)
  })
})

describe('hasValidBypass', () => {
  it('accepts a token that matches the expected secret exactly', () => {
    expect(hasValidBypass('secret-123', 'secret-123')).toBe(true)
  })

  it('rejects a token that does not match', () => {
    expect(hasValidBypass('wrong', 'secret-123')).toBe(false)
  })

  it('rejects when no token was provided', () => {
    expect(hasValidBypass(null, 'secret-123')).toBe(false)
    expect(hasValidBypass(undefined, 'secret-123')).toBe(false)
  })

  it('rejects any provided token when no server secret is configured, never bypassing on an empty/undefined expected value', () => {
    expect(hasValidBypass('anything', undefined)).toBe(false)
    expect(hasValidBypass('', '')).toBe(false)
  })
})

describe('suspendedPageHtml', () => {
  it('renders generic maintenance copy with no mention of payment, billing, or the client by name', () => {
    const html = suspendedPageHtml()
    expect(html.toLowerCase()).not.toMatch(/pay|bill|invoice|overdue|salim/i)
    expect(html).toContain('Temporarily Unavailable')
  })

  it('is noindex, so a suspended site is never indexed by search engines', () => {
    expect(suspendedPageHtml()).toContain('noindex')
  })
})
