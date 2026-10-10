/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('../../../../../../../../services/crm/access', () => ({
  requireCrmApi: jest.fn(),
}))
jest.mock('../../../../../../../../lib/db', () => ({
  db: { courseLesson: { findUnique: jest.fn(), update: jest.fn() } },
}))
jest.mock('../../../../../../../../lib/api/course-resources-storage', () => ({
  courseResourcesStorageDir: jest.fn(() => '/tmp/fake-course-resources'),
  courseResourceFilePath: jest.fn((name: string) => `/tmp/fake-course-resources/${name}`),
}))
jest.mock('fs', () => ({ mkdirSync: jest.fn(), writeFileSync: jest.fn() }))

import { POST } from './route'
import { requireCrmApi } from '@/services/crm/access'
import { db } from '@/lib/db'
import { writeFileSync } from 'fs'

const mockRequireCrmApi = requireCrmApi as jest.Mock
const mockFindLesson = db.courseLesson.findUnique as jest.Mock
const mockUpdate = db.courseLesson.update as jest.Mock
const mockWriteFile = writeFileSync as jest.Mock

function fakePdf(size = 100) {
  return new File([new Uint8Array(size)], 'worksheet.pdf', { type: 'application/pdf' })
}

function request(form: FormData) {
  return new NextRequest('https://salimcyrus.com/api/admin/courses/c1/lessons/lesson-1/resource', { method: 'POST', body: form })
}

describe('POST /api/admin/courses/[id]/lessons/[lessonId]/resource', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireCrmApi.mockResolvedValue(true)
    mockFindLesson.mockResolvedValue({ id: 'lesson-1', section: { courseId: 'c1' } })
    mockUpdate.mockResolvedValue({ id: 'lesson-1' })
  })

  it('returns 403 without the content:write permission', async () => {
    mockRequireCrmApi.mockResolvedValue(false)
    const form = new FormData()
    form.set('label', 'Family rules planner')
    form.set('resource', fakePdf())
    const response = await POST(request(form), { params: Promise.resolve({ id: 'c1', lessonId: 'lesson-1' }) })
    expect(response.status).toBe(403)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('returns 404 when the lesson does not belong to this course', async () => {
    mockFindLesson.mockResolvedValue({ id: 'lesson-1', section: { courseId: 'different-course' } })
    const form = new FormData()
    form.set('label', 'Family rules planner')
    form.set('resource', fakePdf())
    const response = await POST(request(form), { params: Promise.resolve({ id: 'c1', lessonId: 'lesson-1' }) })
    expect(response.status).toBe(404)
  })

  it('returns 400 when the label is missing', async () => {
    const form = new FormData()
    form.set('resource', fakePdf())
    const response = await POST(request(form), { params: Promise.resolve({ id: 'c1', lessonId: 'lesson-1' }) })
    expect(response.status).toBe(400)
  })

  it('returns 400 when no file is attached', async () => {
    const form = new FormData()
    form.set('label', 'Family rules planner')
    const response = await POST(request(form), { params: Promise.resolve({ id: 'c1', lessonId: 'lesson-1' }) })
    expect(response.status).toBe(400)
  })

  it('rejects a non-PDF file', async () => {
    const form = new FormData()
    form.set('label', 'Family rules planner')
    form.set('resource', new File([new Uint8Array(10)], 'x.png', { type: 'image/png' }))
    const response = await POST(request(form), { params: Promise.resolve({ id: 'c1', lessonId: 'lesson-1' }) })
    expect(response.status).toBe(400)
  })

  it('rejects a file over 10MB', async () => {
    const form = new FormData()
    form.set('label', 'Family rules planner')
    form.set('resource', fakePdf(11 * 1024 * 1024))
    const response = await POST(request(form), { params: Promise.resolve({ id: 'c1', lessonId: 'lesson-1' }) })
    expect(response.status).toBe(400)
  })

  it('writes the file deterministically by lessonId and updates the lesson', async () => {
    const form = new FormData()
    form.set('label', 'Family rules planner')
    form.set('resource', fakePdf())
    const response = await POST(request(form), { params: Promise.resolve({ id: 'c1', lessonId: 'lesson-1' }) })
    expect(response.status).toBe(200)
    expect(mockWriteFile).toHaveBeenCalledWith('/tmp/fake-course-resources/lesson-1.pdf', expect.any(Buffer))
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'lesson-1' },
      data: { resourceLabel: 'Family rules planner', resourceFileName: 'lesson-1.pdf' },
    })
  })
})
