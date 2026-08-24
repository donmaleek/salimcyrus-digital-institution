import { randomBytes, createHash } from 'crypto'

/** Generates a cryptographically random raw token to email/log to the user. */
export function generateResetToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Hashes a raw reset token for storage/lookup. Only the hash is ever
 * persisted, so a database read alone can't be used to forge a valid link.
 */
export function hashResetToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex')
}
