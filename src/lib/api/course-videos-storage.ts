import { existsSync, statSync } from 'fs'
import { join, resolve } from 'path'

/**
 * Directory holding self-hosted course/masterclass lesson video files.
 * Never served statically. Every read goes through the
 * enrollment-or-membership-gated, Range-aware streaming route. Mirrors
 * TEACHINGS_STORAGE_DIR (see teachings-storage.ts): defaults to a sibling
 * `CourseVideos/` directory for local dev; production sets
 * COURSE_VIDEOS_STORAGE_DIR to a path outside the git checkout entirely.
 */
export function courseVideosStorageDir(): string {
  return resolve(process.env.COURSE_VIDEOS_STORAGE_DIR ?? join(process.cwd(), 'CourseVideos'))
}

export function courseVideoFilePath(fileName: string): string {
  return join(courseVideosStorageDir(), fileName)
}

export function courseVideoFileExists(fileName: string): boolean {
  return existsSync(courseVideoFilePath(fileName))
}

export function courseVideoFileSize(fileName: string): number {
  return statSync(courseVideoFilePath(fileName)).size
}
