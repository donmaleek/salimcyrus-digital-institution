import { existsSync } from 'fs'
import { join, resolve } from 'path'

/**
 * Directory holding admin-uploaded coaching category card images. Never
 * written into /public: Next.js's production server only recognizes
 * /public files present at process start, so anything written there after
 * boot 404s until a restart. Served instead through a disk-read-per-request
 * route (see /api/coaching/image/[fileName]), same fix already used for
 * teaching thumbnails and book covers. Defaults to a sibling
 * `CoachingImages/` directory for local dev; production sets
 * COACHING_IMAGES_STORAGE_DIR to a path outside the git checkout.
 */
export function coachingImagesStorageDir(): string {
  return resolve(process.env.COACHING_IMAGES_STORAGE_DIR ?? join(process.cwd(), 'CoachingImages'))
}

export function coachingImageFilePath(fileName: string): string {
  return join(coachingImagesStorageDir(), fileName)
}

export function coachingImageFileExists(fileName: string): boolean {
  return existsSync(coachingImageFilePath(fileName))
}
