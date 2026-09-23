import { EventEmitter } from 'events'

jest.mock('../../lib/db', () => ({
  db: { teaching: { update: jest.fn().mockResolvedValue(undefined) } },
}))
jest.mock('../../lib/api/teachings-storage', () => ({
  teachingFilePath: jest.fn((fileName: string) => `/teachings-dir/${fileName}`),
}))

const mockStatSync = jest.fn()
const mockUnlink = jest.fn((_path: string, callback: (error: Error | null) => void) => callback(null))
jest.mock('fs', () => ({
  statSync: (path: string) => mockStatSync(path),
  unlink: (path: string, callback: (error: Error | null) => void) => mockUnlink(path, callback),
}))

class FakeChildProcess extends EventEmitter {
  stdout = new EventEmitter()
  stderr = new EventEmitter()
}

// A fresh FakeChildProcess per spawn() call, tracked in call order, rather
// than pre-queuing return values: an assertion that throws mid-test (or a
// test that only ever triggers one of the two spawns) can never leave a
// stale queued value to contaminate the next test, which is what made an
// earlier version of this suite flaky.
let spawnedChildren: FakeChildProcess[]
const mockSpawn = jest.fn((_command: string, _args: string[], _options?: unknown) => {
  const child = new FakeChildProcess()
  spawnedChildren.push(child)
  return child
})
jest.mock('child_process', () => ({
  spawn: (command: string, args: string[], options?: unknown) => mockSpawn(command, args, options),
}))

import { compressTeachingVideoInBackground } from './video-compression'
import { db } from '@/lib/db'

const mockUpdate = db.teaching.update as jest.Mock

async function waitUntil(condition: () => boolean, timeoutMs = 2000) {
  const start = Date.now()
  while (!condition()) {
    if (Date.now() - start > timeoutMs) throw new Error('waitUntil timed out')
    await new Promise((resolve) => setImmediate(resolve))
  }
}

const INPUT = { teachingId: 't1', rawPath: '/teachings-dir/my-teaching.upload.mp4', rawFileName: 'my-teaching.upload.mp4', slug: 'my-teaching' }

describe('compressTeachingVideoInBackground', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    spawnedChildren = []
    mockUnlink.mockImplementation((_path: string, callback: (error: Error | null) => void) => callback(null))
    mockStatSync.mockReturnValue({ size: 12345 })
  })

  it('spawns ffmpeg with the raw file as input and the slug.mp4 path as output, never the same path as the input, then probes duration and marks the teaching ready', async () => {
    const runPromise = compressTeachingVideoInBackground(INPUT)

    await waitUntil(() => spawnedChildren.length === 1)
    expect(mockSpawn).toHaveBeenNthCalledWith(
      1,
      'ffmpeg',
      expect.arrayContaining(['-i', '/teachings-dir/my-teaching.upload.mp4', '/teachings-dir/my-teaching.mp4']),
      expect.anything()
    )
    spawnedChildren[0].emit('close', 0)

    await waitUntil(() => spawnedChildren.length === 2)
    expect(mockSpawn).toHaveBeenNthCalledWith(2, 'ffprobe', expect.arrayContaining(['/teachings-dir/my-teaching.mp4']), undefined)
    spawnedChildren[1].stdout.emit('data', Buffer.from('125.4\n'))
    spawnedChildren[1].emit('close', 0)

    await runPromise

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 't1' },
      data: { videoFileName: 'my-teaching.mp4', durationSeconds: 125, processingStatus: 'ready' },
    })
  })

  it('deletes the raw upload only after compression succeeds and the DB row points at the compressed file, even if the duration probe itself fails', async () => {
    const runPromise = compressTeachingVideoInBackground(INPUT)

    await waitUntil(() => spawnedChildren.length === 1)
    spawnedChildren[0].emit('close', 0)

    await waitUntil(() => spawnedChildren.length === 2)
    spawnedChildren[1].emit('close', 1) // ffprobe failing is non-fatal, duration just ends up null

    await runPromise

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 't1' },
      data: { videoFileName: 'my-teaching.mp4', durationSeconds: null, processingStatus: 'ready' },
    })
    expect(mockUnlink).toHaveBeenCalledWith('/teachings-dir/my-teaching.upload.mp4', expect.any(Function))
  })

  it('keeps the raw upload and marks processingStatus failed when ffmpeg exits non-zero, never touching videoFileName', async () => {
    const runPromise = compressTeachingVideoInBackground(INPUT)

    await waitUntil(() => spawnedChildren.length === 1)
    spawnedChildren[0].stderr.emit('data', Buffer.from('some encoding error'))
    spawnedChildren[0].emit('close', 1)

    await runPromise

    expect(mockUpdate).toHaveBeenCalledWith({ where: { id: 't1' }, data: { processingStatus: 'failed' } })
    expect(mockUpdate).not.toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ videoFileName: expect.anything() }) }))
    expect(mockUnlink).not.toHaveBeenCalledWith('/teachings-dir/my-teaching.upload.mp4', expect.any(Function))
  })

  it('treats an empty compressed output as a failure and marks processingStatus failed', async () => {
    mockStatSync.mockReturnValue({ size: 0 })
    const runPromise = compressTeachingVideoInBackground(INPUT)

    await waitUntil(() => spawnedChildren.length === 1)
    spawnedChildren[0].emit('close', 0)

    await runPromise

    expect(mockUpdate).toHaveBeenCalledWith({ where: { id: 't1' }, data: { processingStatus: 'failed' } })
  })

  it('marks processingStatus failed, without throwing, when the ffmpeg binary itself cannot be spawned', async () => {
    const runPromise = compressTeachingVideoInBackground(INPUT)

    await waitUntil(() => spawnedChildren.length === 1)
    spawnedChildren[0].emit('error', new Error('ENOENT: ffmpeg not found'))

    await expect(runPromise).resolves.toBeUndefined()
    expect(mockUpdate).toHaveBeenCalledWith({ where: { id: 't1' }, data: { processingStatus: 'failed' } })
  })
})
