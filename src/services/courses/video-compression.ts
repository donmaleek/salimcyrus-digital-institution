import { spawn } from 'child_process'
import { statSync, unlink } from 'fs'
import { promisify } from 'util'
import { db } from '@/lib/db'
import { courseVideoFilePath } from '@/lib/api/course-videos-storage'

const unlinkAsync = promisify(unlink)

/**
 * H.264/AAC MP4, capped at 1080p (never upscaled, via the min(1920,iw)
 * filter), CRF 23 (a standard "visually lossless enough, much smaller"
 * default), faststart for immediate playback start over HTTP range
 * requests. Identical settings to compressTeachingVideoInBackground: one
 * predictable bitrate/size ceiling across every self-hosted video on the
 * site, not a second encoding policy to keep in sync.
 */
function ffmpegArgs(inputPath: string, outputPath: string): string[] {
  return [
    '-y',
    '-i', inputPath,
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '23',
    '-vf', "scale='min(1920,iw)':'-2'",
    '-c:a', 'aac',
    '-b:a', '128k',
    '-movflags', '+faststart',
    outputPath,
  ]
}

function runFfmpeg(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn('ffmpeg', ffmpegArgs(inputPath, outputPath), { stdio: ['ignore', 'ignore', 'pipe'] })
    let stderr = ''
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
      if (stderr.length > 8000) stderr = stderr.slice(-8000) // bound memory on a very chatty/long-running encode
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`ffmpeg exited with code ${code}: ${stderr.slice(-2000)}`))
      }
    })
  })
}

function probeDurationSeconds(filePath: string): Promise<number | null> {
  return new Promise((resolve) => {
    const child = spawn('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      filePath,
    ])
    let stdout = ''
    child.stdout.on('data', (chunk) => { stdout += chunk.toString() })
    child.on('error', () => resolve(null))
    child.on('close', (code) => {
      if (code !== 0) { resolve(null); return }
      const seconds = Number.parseFloat(stdout.trim())
      resolve(Number.isFinite(seconds) ? Math.round(seconds) : null)
    })
  })
}

/**
 * Compresses a freshly uploaded lesson video in the background: the HTTP
 * request that accepted the upload has already responded by the time this
 * runs, so a multi-minute encode of a large file never holds a client
 * connection open or risks a proxy timeout. The compressed filename is
 * keyed by lessonId (not a slug, lessons don't have one), guaranteed
 * unique across every course sharing COURSE_VIDEOS_STORAGE_DIR.
 *
 * Never deletes the only copy of a lesson's video before a replacement
 * exists: on success the raw upload is removed only after the compressed
 * file is confirmed non-empty and the DB row is updated to point at it; on
 * any failure the raw upload is left exactly as uploaded, videoFileName
 * keeps pointing at it, and videoProcessingStatus is set to 'failed' so
 * it's visible in the admin UI rather than silently stuck.
 */
export async function compressCourseVideoInBackground({
  lessonId,
  rawPath,
  rawFileName,
}: {
  lessonId: string
  rawPath: string
  rawFileName: string
}): Promise<void> {
  const compressedFileName = `${lessonId}.mp4`
  const compressedPath = courseVideoFilePath(compressedFileName)

  try {
    await runFfmpeg(rawPath, compressedPath)

    const { size } = statSync(compressedPath)
    if (size === 0) {
      throw new Error('Compressed output was empty.')
    }

    const durationSeconds = await probeDurationSeconds(compressedPath)

    await db.courseLesson.update({
      where: { id: lessonId },
      data: { videoFileName: compressedFileName, durationSeconds, videoProcessingStatus: 'ready' },
    })

    if (compressedFileName !== rawFileName) {
      await unlinkAsync(rawPath).catch(() => undefined)
    }
  } catch (error) {
    console.error('Course lesson video compression failed, keeping the original upload', {
      lessonId,
      error: error instanceof Error ? error.message : error,
    })
    await unlinkAsync(compressedPath).catch(() => undefined) // remove any partial/corrupt output
    await db.courseLesson.update({
      where: { id: lessonId },
      data: { videoProcessingStatus: 'failed' },
    }).catch(() => undefined)
  }
}
