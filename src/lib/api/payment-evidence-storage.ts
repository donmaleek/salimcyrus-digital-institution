import { existsSync } from 'fs'
import { join, resolve } from 'path'

/**
 * Directory holding uploaded Paybill payment-evidence screenshots. Never
 * served statically: these often show a buyer's phone number and M-Pesa
 * transaction details, so access goes through an admin-only route.
 * Mirrors TEACHINGS_STORAGE_DIR (see teachings-storage.ts): defaults to a
 * sibling `PaymentEvidence/` directory for local dev; production sets
 * PAYMENT_EVIDENCE_STORAGE_DIR to a path outside the git checkout entirely.
 */
export function evidenceStorageDir(): string {
  return resolve(process.env.PAYMENT_EVIDENCE_STORAGE_DIR ?? join(process.cwd(), 'PaymentEvidence'))
}

export function evidenceFilePath(fileName: string): string {
  return join(evidenceStorageDir(), fileName)
}

export function evidenceFileExists(fileName: string): boolean {
  return existsSync(evidenceFilePath(fileName))
}
