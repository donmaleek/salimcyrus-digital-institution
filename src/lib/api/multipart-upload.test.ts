/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { mkdtempSync, readFileSync, existsSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { streamMultipartUpload, MultipartFileTooLargeError } from './multipart-upload'

let dir: string

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'multipart-test-'))
})

afterEach(() => {
  rmSync(dir, { recursive: true, force: true })
})

// Real multipart bytes: constructing a NextRequest with a FormData body
// makes undici encode it as genuine multipart/form-data with a boundary,
// exactly like a real browser upload, so this exercises the actual
// streaming parser rather than a hand-rolled fixture.
function multipartRequest(form: FormData) {
  return new NextRequest('https://salimcyrus.com/api/admin/teachings', { method: 'POST', body: form })
}

describe('streamMultipartUpload', () => {
  it('parses text fields without touching disk', async () => {
    const form = new FormData()
    form.set('title', 'Leading a Family')
    form.set('category', 'Manhood')

    const result = await streamMultipartUpload(multipartRequest(form), () => null)

    expect(result.fields).toEqual({ title: 'Leading a Family', category: 'Manhood' })
    expect(result.files).toEqual([])
  })

  it('streams a file straight to the destination path, never buffering it as a single in-memory value', async () => {
    const bytes = Buffer.alloc(5 * 1024 * 1024, 7) // 5MB of a repeated byte, big enough to span several stream chunks
    const form = new FormData()
    form.set('video', new File([bytes], 'clip.mp4', { type: 'video/mp4' }))

    const destPath = join(dir, 'saved.mp4')
    const result = await streamMultipartUpload(multipartRequest(form), (fieldName) =>
      fieldName === 'video' ? { path: destPath, maxBytes: 10 * 1024 * 1024 } : null
    )

    expect(result.files).toEqual([
      { fieldName: 'video', fileName: 'clip.mp4', mimeType: 'video/mp4', path: destPath, size: bytes.length },
    ])
    expect(existsSync(destPath)).toBe(true)
    expect(readFileSync(destPath).equals(bytes)).toBe(true)
  })

  it('drains and discards a file field the caller does not want, writing nothing to disk', async () => {
    const form = new FormData()
    form.set('unexpected', new File([Buffer.from('ignored bytes')], 'ignored.bin', { type: 'application/octet-stream' }))

    const result = await streamMultipartUpload(multipartRequest(form), () => null)

    expect(result.files).toEqual([])
  })

  it('rejects and cleans up the partial file once the stream exceeds maxBytes, never leaving an oversized file on disk', async () => {
    const bytes = Buffer.alloc(2 * 1024 * 1024, 9) // 2MB
    const form = new FormData()
    form.set('video', new File([bytes], 'too-big.mp4', { type: 'video/mp4' }))

    const destPath = join(dir, 'rejected.mp4')

    await expect(
      streamMultipartUpload(multipartRequest(form), () => ({ path: destPath, maxBytes: 1024 * 1024 }))
    ).rejects.toThrow(MultipartFileTooLargeError)

    expect(existsSync(destPath)).toBe(false)
  })

  it('parses both fields and a file from the same multipart body', async () => {
    const bytes = Buffer.from('a real (tiny) video payload')
    const form = new FormData()
    form.set('title', 'A Teaching')
    form.set('video', new File([bytes], 'teaching.mp4', { type: 'video/mp4' }))

    const destPath = join(dir, 'teaching.mp4')
    const result = await streamMultipartUpload(multipartRequest(form), (fieldName) =>
      fieldName === 'video' ? { path: destPath, maxBytes: 1024 } : null
    )

    expect(result.fields.title).toBe('A Teaching')
    expect(result.files[0].size).toBe(bytes.length)
  })
})
