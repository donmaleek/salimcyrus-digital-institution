import { randomBytes, createHash } from 'crypto'

const TOKEN_BYTES = 32
export const DOWNLOAD_TOKEN_TTL_DAYS = 30
export const MAX_DOWNLOADS_PER_PURCHASE = 5

/**
 * Generates a new download grant: a random raw token to hand to the buyer
 * (in the redirect URL / email — never stored) and its SHA-256 hash (the
 * only thing persisted, so a DB leak can't be replayed as a working token).
 */
export function generateDownloadToken(): { rawToken: string; tokenHash: string } {
  const rawToken = randomBytes(TOKEN_BYTES).toString('base64url')
  return { rawToken, tokenHash: hashDownloadToken(rawToken) }
}

export function hashDownloadToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex')
}

export function tokenExpiryDate(from: Date = new Date()): Date {
  return new Date(from.getTime() + DOWNLOAD_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000)
}

export interface DownloadGrantCheck {
  expiresAt: Date
  downloadCount: number
  maxDownloads: number
}

export type DownloadGrantStatus = 'ok' | 'expired' | 'exhausted'

export function checkDownloadGrant(
  grant: DownloadGrantCheck,
  now: Date = new Date()
): DownloadGrantStatus {
  if (grant.expiresAt.getTime() < now.getTime()) return 'expired'
  if (grant.downloadCount >= grant.maxDownloads) return 'exhausted'
  return 'ok'
}
