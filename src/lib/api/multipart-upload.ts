import { createWriteStream } from 'fs'
import { unlink } from 'fs/promises'
import { Readable } from 'stream'
import Busboy from 'busboy'
import type { NextRequest } from 'next/server'

/**
 * Parses a multipart request without ever holding a whole file in memory.
 * `request.formData()` (the Web-standard alternative) materializes every
 * part, including large files, as an in-memory Blob before your code sees
 * it — fine for form fields and small images, but a 750MB-2GB video means
 * buffering the entire file (twice, once more if you then call
 * `.arrayBuffer()` on it) before a single byte reaches disk. This streams
 * each file field straight from the request socket to its destination
 * path as bytes arrive, so peak memory use per upload stays at a few
 * chunk-sized buffers regardless of file size.
 */

export interface MultipartFileDestination {
  /** Absolute path to stream this file's bytes to. */
  path: string
  /** Reject the upload once this field's bytes exceed this count. */
  maxBytes: number
}

export interface StreamedFile {
  fieldName: string
  fileName: string
  mimeType: string
  path: string
  size: number
}

export interface StreamMultipartResult {
  fields: Record<string, string>
  files: StreamedFile[]
}

export class MultipartFileTooLargeError extends Error {
  constructor(public readonly fieldName: string) {
    super(`Field "${fieldName}" exceeded its maximum allowed size.`)
    this.name = 'MultipartFileTooLargeError'
  }
}

/**
 * `destinationFor` is called synchronously as each file part starts (before
 * any bytes are read), so the caller can validate the declared MIME type
 * and decide where the bytes should land, or return null to drain and
 * discard a field the caller doesn't want (an unrecognized field name,
 * say) without ever writing it to disk.
 *
 * On any failure (oversized file, malformed multipart body, disk error),
 * every partial file this call has written so far is deleted before the
 * error is thrown, so a rejected upload never leaves orphaned temp files.
 */
export async function streamMultipartUpload(
  request: NextRequest,
  destinationFor: (fieldName: string, fileName: string, mimeType: string) => MultipartFileDestination | null
): Promise<StreamMultipartResult> {
  const contentType = request.headers.get('content-type') ?? ''
  if (!request.body) {
    throw new Error('Request has no body to parse.')
  }

  const nodeStream = Readable.fromWeb(request.body as Parameters<typeof Readable.fromWeb>[0])
  const partialPaths: string[] = []

  try {
    return await new Promise<StreamMultipartResult>((resolve, reject) => {
      const fields: Record<string, string> = {}
      const files: StreamedFile[] = []
      const writesInFlight: Promise<void>[] = []
      let settled = false

      const fail = (error: Error) => {
        if (settled) return
        settled = true
        reject(error)
      }

      let busboy: Busboy.Busboy
      try {
        busboy = Busboy({ headers: { 'content-type': contentType } })
      } catch (error) {
        fail(error instanceof Error ? error : new Error('Could not start parsing the upload.'))
        return
      }

      busboy.on('field', (name, value) => {
        fields[name] = value
      })

      busboy.on('file', (fieldName, fileStream, info) => {
        const destination = destinationFor(fieldName, info.filename, info.mimeType)
        if (!destination) {
          fileStream.resume()
          return
        }

        partialPaths.push(destination.path)
        const writeStream = createWriteStream(destination.path)
        let bytesWritten = 0

        const writeDone = new Promise<void>((resolveWrite, rejectWrite) => {
          fileStream.on('data', (chunk: Buffer) => {
            bytesWritten += chunk.length
            if (bytesWritten > destination.maxBytes) {
              fileStream.unpipe(writeStream)
              writeStream.destroy()
              fileStream.resume()
              rejectWrite(new MultipartFileTooLargeError(fieldName))
            }
          })
          writeStream.on('error', rejectWrite)
          fileStream.on('error', rejectWrite)
          writeStream.on('finish', () => {
            files.push({ fieldName, fileName: info.filename, mimeType: info.mimeType, path: destination.path, size: bytesWritten })
            resolveWrite()
          })
        })

        fileStream.pipe(writeStream)
        // Attach a handler synchronously so Node never sees this as an
        // unhandled rejection during the gap between it settling (as soon
        // as the size limit trips) and busboy's 'finish' event actually
        // consuming writesInFlight via Promise.all below.
        writeDone.catch(() => undefined)
        writesInFlight.push(writeDone)
      })

      busboy.on('error', (error) => fail(error instanceof Error ? error : new Error('Upload parsing failed.')))

      busboy.on('finish', () => {
        Promise.all(writesInFlight)
          .then(() => {
            if (settled) return
            settled = true
            resolve({ fields, files })
          })
          .catch((error) => fail(error instanceof Error ? error : new Error('Upload parsing failed.')))
      })

      nodeStream.on('error', (error) => fail(error))
      nodeStream.pipe(busboy)
    })
  } catch (error) {
    await Promise.all(partialPaths.map((path) => unlink(path).catch(() => undefined)))
    throw error
  }
}
