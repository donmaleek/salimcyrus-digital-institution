import { existsSync } from 'fs'
import { join, resolve } from 'path'

/**
 * Directory holding the actual book PDFs. Never served statically — every
 * read goes through the token-gated download route. Defaults to a sibling
 * `Books/` directory (matching local dev and the repo layout); production
 * sets BOOKS_STORAGE_DIR to a path outside the git checkout entirely.
 */
export function booksStorageDir(): string {
  return resolve(process.env.BOOKS_STORAGE_DIR ?? join(process.cwd(), 'Books'))
}

export function bookFilePath(fileName: string): string {
  return join(booksStorageDir(), fileName)
}

export function bookFileExists(fileName: string): boolean {
  return existsSync(bookFilePath(fileName))
}
