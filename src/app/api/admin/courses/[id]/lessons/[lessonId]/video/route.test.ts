/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { mkdtempSync, rmSync, existsSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

jest.mock('../../../../../../../../services/crm/access', () => ({
  requireCrmApi: jest.fn(),
}))
jest.mock('../../../../../../../../lib/db', () => ({
  db: { courseLesson: { findUnique: jest.fn(), update: jest.fn() } },
}))
jest.mock('../../../../../../../../services/courses/video-compression', () => ({
  compressCourseVideoInBackground: jest.fn().mockResolvedValue(undefined),
}))

let storageDir: string

// COURSE_VIDEOS_STORAGE_DIR must be set before course-videos-storage.ts
// (transitively imported by the route) resolves it, so this runs before
// any import below.
beforeAll(() => {
  storageDir = mkdtempSync(join(tmpdir(), 'course-videos-route-test-'))
  process.env.COURSE_VIDEOS_STORAGE_DIR = storageDir
})

afterAll(() => {
  rmSync(storageDir, { recursive: true, force: true })
  delete process.env.COURSE_VIDEOS_STORAGE_DIR
})

import { POST } from './route'
import { requireCrmApi } from '@/services/crm/access'
import { db } from '@/lib/db'
import { compressCourseVideoInBackground } from '@/services/courses/video-compression'

const mockRequireCrmApi = requireCrmApi as jest.Mock
const mockFindLesson = db.courseLesson.findUnique as jest.Mock
const mockUpdate = db.courseLesson.update as jest.Mock
const mockCompress = compressCourseVideoInBackground as jest.Mock

function fakeVideo(type = 'video/mp4', size = 1000) {
  return new File([new Uint8Array(size)], 'lesson.mp4', { type })
}

function request(form: FormData) {
  return new NextRequest('https://salimcyrus.com/api/admin/courses/c1/lessons/lesson-1/video', { method: 'POST', body: form })
}

describe('POST /api/admin/courses/[id]/lessons/[lessonId]/video', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireCrmApi.mockResolvedValue(true)
    mockFindLesson.mockResolvedValue({ id: 'lesson-1', section: { courseId: 'c1' } })
    mockUpdate.mockResolvedValue({ id: 'lesson-1', videoFileName: 'lesson-1.upload.mp4', videoProcessingStatus: 'processing' })
  })

  it('returns 403 without the content:write permission', async () => {
    mockRequireCrmApi.mockResolvedValue(false)
    const form = new FormData()
    form.set('video', fakeVideo())
    const response = await POST(request(form), { params: Promise.resolve({ id: 'c1', lessonId: 'lesson-1' }) })
    expect(response.status).toBe(403)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('returns 404 when the lesson does not belong to this course', async () => {
    mockFindLesson.mockResolvedValue({ id: 'lesson-1', section: { courseId: 'different-course' } })
    const form = new FormData()
    form.set('video', fakeVideo())
    const response = await POST(request(form), { params: Promise.resolve({ id: 'c1', lessonId: 'lesson-1' }) })
    expect(response.status).toBe(404)
  })

  it('returns 400 when no file is attached', async () => {
    const form = new FormData()
    const response = await POST(request(form), { params: Promise.resolve({ id: 'c1', lessonId: 'lesson-1' }) })
    expect(response.status).toBe(400)
  })

  it('rejects a non-video file', async () => {
    const form = new FormData()
    form.set('video', new File([new Uint8Array(10)], 'x.png', { type: 'image/png' }))
    const response = await POST(request(form), { params: Promise.resolve({ id: 'c1', lessonId: 'lesson-1' }) })
    expect(response.status).toBe(400)
  })

  it('saves the raw upload to disk, flips videoProcessingStatus to processing, and kicks off background compression without blocking the response', async () => {
    const form = new FormData()
    form.set('video', fakeVideo())
    const response = await POST(request(form), { params: Promise.resolve({ id: 'c1', lessonId: 'lesson-1' }) })

    expect(response.status).toBe(200)
    expect(existsSync(join(storageDir, 'lesson-1.upload.mp4'))).toBe(true)
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'lesson-1' },
      data: { videoFileName: 'lesson-1.upload.mp4', videoProcessingStatus: 'processing' },
    })
    expect(mockCompress).toHaveBeenCalledWith({
      lessonId: 'lesson-1',
      rawPath: join(storageDir, 'lesson-1.upload.mp4'),
      rawFileName: 'lesson-1.upload.mp4',
    })
  })
})
