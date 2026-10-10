import { existsSync } from 'fs'
import { join, resolve } from 'path'

/**
 * Directory holding downloadable lesson resources (worksheets, planners,
 * checklists) attached via CourseLesson.resourceFileName. Never served
 * statically. Mirrors TEACHINGS_STORAGE_DIR / BOOKS_STORAGE_DIR: defaults
 * to a sibling `CourseResources/` directory for local dev; production sets
 * COURSE_RESOURCES_STORAGE_DIR to a path outside the git checkout.
 */
export function courseResourcesStorageDir(): string {
  return resolve(process.env.COURSE_RESOURCES_STORAGE_DIR ?? join(process.cwd(), 'CourseResources'))
}

export function courseResourceFilePath(fileName: string): string {
  return join(courseResourcesStorageDir(), fileName)
}

export function courseResourceFileExists(fileName: string): boolean {
  return existsSync(courseResourceFilePath(fileName))
}
