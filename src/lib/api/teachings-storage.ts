import { existsSync, statSync } from 'fs'
import { join, resolve } from 'path'

/**
 * Directory holding the actual teaching video files. Never served
 * statically. Every read goes through the purchase-gated, Range-aware
 * streaming route. Mirrors BOOKS_STORAGE_DIR (see books-storage.ts):
 * defaults to a sibling `Teachings/` directory for local dev; production
 * sets TEACHINGS_STORAGE_DIR to a path outside the git checkout entirely.
 */
export function teachingsStorageDir(): string {
  return resolve(process.env.TEACHINGS_STORAGE_DIR ?? join(process.cwd(), 'Teachings'))
}

export function teachingFilePath(fileName: string): string {
  return join(teachingsStorageDir(), fileName)
}

export function teachingFileExists(fileName: string): boolean {
  return existsSync(teachingFilePath(fileName))
}

export function teachingFileSize(fileName: string): number {
  return statSync(teachingFilePath(fileName)).size
}
