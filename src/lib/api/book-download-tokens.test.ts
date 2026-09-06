import {
  generateDownloadToken,
  hashDownloadToken,
  tokenExpiryDate,
  checkDownloadGrant,
  DOWNLOAD_TOKEN_TTL_DAYS,
} from './book-download-tokens'

describe('generateDownloadToken', () => {
  it('produces a raw token whose hash matches the returned hash', () => {
    const { rawToken, tokenHash } = generateDownloadToken()
    expect(hashDownloadToken(rawToken)).toBe(tokenHash)
  })

  it('never returns the same raw token twice', () => {
    const a = generateDownloadToken()
    const b = generateDownloadToken()
    expect(a.rawToken).not.toBe(b.rawToken)
    expect(a.tokenHash).not.toBe(b.tokenHash)
  })

  it('raw token is url-safe (no characters needing escaping in a URL path)', () => {
    const { rawToken } = generateDownloadToken()
    expect(rawToken).toMatch(/^[A-Za-z0-9_-]+$/)
  })
})

describe('hashDownloadToken', () => {
  it('is deterministic', () => {
    expect(hashDownloadToken('same-input')).toBe(hashDownloadToken('same-input'))
  })

  it('different inputs hash differently', () => {
    expect(hashDownloadToken('a')).not.toBe(hashDownloadToken('b'))
  })
})

describe('tokenExpiryDate', () => {
  it('adds the configured TTL in days', () => {
    const from = new Date('2026-01-01T00:00:00.000Z')
    const expiry = tokenExpiryDate(from)
    const diffDays = (expiry.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)
    expect(diffDays).toBe(DOWNLOAD_TOKEN_TTL_DAYS)
  })
})

describe('checkDownloadGrant', () => {
  const now = new Date('2026-06-01T00:00:00.000Z')

  it('is ok when not expired and under the download limit', () => {
    const status = checkDownloadGrant(
      { expiresAt: new Date('2026-07-01T00:00:00.000Z'), downloadCount: 1, maxDownloads: 5 },
      now
    )
    expect(status).toBe('ok')
  })

  it('is expired when past tokenExpiresAt, even with downloads remaining', () => {
    const status = checkDownloadGrant(
      { expiresAt: new Date('2026-05-01T00:00:00.000Z'), downloadCount: 0, maxDownloads: 5 },
      now
    )
    expect(status).toBe('expired')
  })

  it('is exhausted when downloadCount reaches maxDownloads, even if not expired', () => {
    const status = checkDownloadGrant(
      { expiresAt: new Date('2026-07-01T00:00:00.000Z'), downloadCount: 5, maxDownloads: 5 },
      now
    )
    expect(status).toBe('exhausted')
  })

  it('checks expiry before exhaustion when both conditions are true', () => {
    const status = checkDownloadGrant(
      { expiresAt: new Date('2026-05-01T00:00:00.000Z'), downloadCount: 5, maxDownloads: 5 },
      now
    )
    expect(status).toBe('expired')
  })
})
