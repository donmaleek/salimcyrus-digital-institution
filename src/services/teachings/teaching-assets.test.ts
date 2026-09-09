jest.mock('fs', () => ({
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}))
jest.mock('../../lib/api/teachings-storage', () => ({
  teachingsStorageDir: jest.fn(() => '/teachings'),
  teachingFilePath: jest.fn((name: string) => `/teachings/${name}`),
}))

import { saveTeachingThumbnail, saveTeachingPreview } from './teaching-assets'
import { writeFileSync } from 'fs'

const mockWriteFileSync = writeFileSync as jest.Mock

function fakeFile(name: string, type: string, size = 1000) {
  const bytes = new Uint8Array(size)
  return new File([bytes], name, { type })
}

describe('saveTeachingThumbnail', () => {
  beforeEach(() => jest.clearAllMocks())

  it('rejects a disallowed MIME type', async () => {
    const result = await saveTeachingThumbnail('my-slug', fakeFile('x.gif', 'image/gif'))
    expect(result).toEqual({ ok: false, error: 'Thumbnail must be WebP, JPEG, or PNG.', status: 400 })
    expect(mockWriteFileSync).not.toHaveBeenCalled()
  })

  it('writes the file under the slug-thumb naming convention and returns the public route path', async () => {
    const result = await saveTeachingThumbnail('my-slug', fakeFile('x.webp', 'image/webp'))
    expect(result).toEqual({ ok: true, value: '/api/teachings/thumbnail/my-slug-thumb.webp' })
    expect(mockWriteFileSync).toHaveBeenCalledWith('/teachings/my-slug-thumb.webp', expect.any(Buffer))
  })
})

describe('saveTeachingPreview', () => {
  beforeEach(() => jest.clearAllMocks())

  it('rejects a disallowed MIME type', async () => {
    const result = await saveTeachingPreview('my-slug', fakeFile('x.avi', 'video/x-msvideo'))
    expect(result).toEqual({ ok: false, error: 'Preview clip must be MP4, WebM, or MOV.', status: 400 })
    expect(mockWriteFileSync).not.toHaveBeenCalled()
  })

  it('rejects a preview clip over the size cap', async () => {
    const result = await saveTeachingPreview('my-slug', fakeFile('x.mp4', 'video/mp4', 101 * 1024 * 1024))
    expect(result).toEqual({ ok: false, error: 'Preview clip is too large. Keep it short.', status: 413 })
    expect(mockWriteFileSync).not.toHaveBeenCalled()
  })

  it('writes the file under the slug-preview naming convention and returns just the filename', async () => {
    const result = await saveTeachingPreview('my-slug', fakeFile('x.mp4', 'video/mp4'))
    expect(result).toEqual({ ok: true, value: 'my-slug-preview.mp4' })
    expect(mockWriteFileSync).toHaveBeenCalledWith('/teachings/my-slug-preview.mp4', expect.any(Buffer))
  })
})
