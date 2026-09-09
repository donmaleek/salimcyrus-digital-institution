import { mkdirSync, writeFileSync } from 'fs'
import { teachingsStorageDir, teachingFilePath } from '@/lib/api/teachings-storage'

const ALLOWED_THUMBNAIL_TYPES: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
}
const ALLOWED_VIDEO_TYPES: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
}
const MAX_PREVIEW_BYTES = 100 * 1024 * 1024 // 100MB, a short teaser clip has no business being bigger

export type AssetSaveResult<T> = { ok: true; value: T } | { ok: false; error: string; status: number }

/**
 * Shared by the create-teaching route and the edit-existing-teaching
 * assets route, so a teaching's thumbnail/preview can be uploaded either
 * at creation time or added later without duplicating the same file
 * validation and TEACHINGS_STORAGE_DIR write logic in two places.
 */
export async function saveTeachingThumbnail(slug: string, file: File): Promise<AssetSaveResult<string>> {
  const ext = ALLOWED_THUMBNAIL_TYPES[file.type]
  if (!ext) return { ok: false, error: 'Thumbnail must be WebP, JPEG, or PNG.', status: 400 }

  const fileName = `${slug}-thumb.${ext}`
  mkdirSync(teachingsStorageDir(), { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  writeFileSync(teachingFilePath(fileName), buffer)
  return { ok: true, value: `/api/teachings/thumbnail/${fileName}` }
}

/**
 * A separate, ungated teaser file, never the paid video itself: hovering
 * over a catalog card streams this one (see /api/teachings/preview), so
 * the actual purchase-gated video can never leak to a non-buyer.
 */
export async function saveTeachingPreview(slug: string, file: File): Promise<AssetSaveResult<string>> {
  const ext = ALLOWED_VIDEO_TYPES[file.type]
  if (!ext) return { ok: false, error: 'Preview clip must be MP4, WebM, or MOV.', status: 400 }
  if (file.size > MAX_PREVIEW_BYTES) {
    return { ok: false, error: 'Preview clip is too large. Keep it short.', status: 413 }
  }

  const fileName = `${slug}-preview.${ext}`
  mkdirSync(teachingsStorageDir(), { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  writeFileSync(teachingFilePath(fileName), buffer)
  return { ok: true, value: fileName }
}
