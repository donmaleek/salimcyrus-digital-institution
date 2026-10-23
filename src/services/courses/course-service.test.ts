jest.mock('../../lib/db', () => ({
  db: {
    course: { findFirst: jest.fn().mockResolvedValue(null), create: jest.fn(), update: jest.fn() },
    courseEnrollment: { count: jest.fn().mockResolvedValue(0) },
    courseLesson: { findMany: jest.fn().mockResolvedValue([]) },
    courseSection: { deleteMany: jest.fn() },
    $transaction: jest.fn(),
  },
}))

import { db } from '@/lib/db'
import { createCourse, updateCourse } from './course-service'
import type { CourseInput } from './contracts'

const mockCourseCreate = db.course.create as jest.Mock
const mockCourseUpdate = db.course.update as jest.Mock
const mockLessonFindMany = db.courseLesson.findMany as jest.Mock
const mockEnrollmentCount = db.courseEnrollment.count as jest.Mock
const mockTransaction = db.$transaction as jest.Mock

function baseInput(overrides: Partial<CourseInput> = {}): CourseInput {
  return {
    title: 'Test Course',
    subtitle: '',
    description: 'A description long enough to pass validation.',
    kind: 'course',
    category: 'Personal Growth',
    level: 'all-levels',
    priceKes: 1000,
    priceUsd: 8,
    thumbnailUrl: '',
    trailerUrl: '',
    outcomes: ['Outcome one'],
    status: 'draft',
    featured: false,
    accessWindowDays: null,
    sections: [
      {
        title: 'Section 1',
        description: '',
        lessons: [{ title: 'Lesson 1', description: '', content: '', videoUrl: '', durationMinutes: 10, isPreview: false }],
      },
    ],
    ...overrides,
  }
}

describe('createCourse', () => {
  beforeEach(() => jest.clearAllMocks())

  it('passes accessWindowDays through to the created row', async () => {
    mockCourseCreate.mockResolvedValue({ id: 'course-1' })
    await createCourse(baseInput({ accessWindowDays: 180 }))
    expect(mockCourseCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ accessWindowDays: 180 }) })
    )
  })

  it('a brand-new lesson (no id) never has a video or resource carried over, since there is nothing to carry', async () => {
    mockCourseCreate.mockResolvedValue({ id: 'course-1' })
    await createCourse(baseInput())
    const data = mockCourseCreate.mock.calls[0][0].data
    expect(data.sections.create[0].lessons.create[0]).toEqual(
      expect.objectContaining({ resourceFileName: null, videoFileName: null, videoProcessingStatus: 'ready' })
    )
  })
})

describe('updateCourse', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockTransaction.mockImplementation((callback: (tx: unknown) => unknown) => callback(db))
    mockEnrollmentCount.mockResolvedValue(0)
    mockLessonFindMany.mockResolvedValue([])
  })

  it('refuses to touch the curriculum once the course has enrollments', async () => {
    mockEnrollmentCount.mockResolvedValue(3)
    await expect(updateCourse('course-1', baseInput())).rejects.toThrow('COURSE_HAS_ENROLLMENTS')
    expect(mockCourseUpdate).not.toHaveBeenCalled()
  })

  it('carries an existing lesson’s uploaded video and resource forward when its id matches, even though the save deletes and recreates every lesson row', async () => {
    mockLessonFindMany.mockResolvedValue([
      {
        id: 'lesson-1',
        resourceLabel: 'Family rules planner',
        resourceFileName: 'lesson-1.pdf',
        videoFileName: 'lesson-1.mp4',
        videoProcessingStatus: 'ready',
        durationSeconds: 1800,
      },
    ])
    mockCourseUpdate.mockResolvedValue({ id: 'course-1' })

    await updateCourse(
      'course-1',
      baseInput({
        priceKes: 2000, // the admin only meant to change the price
        sections: [
          {
            title: 'Section 1',
            description: '',
            lessons: [{ id: 'lesson-1', title: 'Lesson 1', description: '', content: '', videoUrl: '', durationMinutes: 10, isPreview: false }],
          },
        ],
      })
    )

    const data = mockCourseUpdate.mock.calls[0][0].data
    expect(data.sections.create[0].lessons.create[0]).toEqual(
      expect.objectContaining({
        resourceLabel: 'Family rules planner',
        resourceFileName: 'lesson-1.pdf',
        videoFileName: 'lesson-1.mp4',
        videoProcessingStatus: 'ready',
      })
    )
  })

  it('keeps the real, ffprobe-measured duration for a video lesson even when the resave carries a stale, hand-typed duration (the admin typed 10 minutes before uploading; the real video is 42 minutes)', async () => {
    mockLessonFindMany.mockResolvedValue([
      { id: 'lesson-1', resourceLabel: null, resourceFileName: null, videoFileName: 'lesson-1.mp4', videoProcessingStatus: 'ready', durationSeconds: 2520 },
    ])
    mockCourseUpdate.mockResolvedValue({ id: 'course-1' })

    await updateCourse(
      'course-1',
      baseInput({
        sections: [
          {
            title: 'Section 1',
            description: '',
            lessons: [{ id: 'lesson-1', title: 'Lesson 1', description: '', content: '', videoUrl: '', durationMinutes: 10, isPreview: false }],
          },
        ],
      })
    )

    const lesson = mockCourseUpdate.mock.calls[0][0].data.sections.create[0].lessons.create[0]
    expect(lesson.durationSeconds).toBe(2520)
  })

  it('uses the admin-typed duration as before for a lesson with no uploaded video', async () => {
    mockLessonFindMany.mockResolvedValue([
      { id: 'lesson-1', resourceLabel: null, resourceFileName: null, videoFileName: null, videoProcessingStatus: 'ready', durationSeconds: null },
    ])
    mockCourseUpdate.mockResolvedValue({ id: 'course-1' })

    await updateCourse(
      'course-1',
      baseInput({
        sections: [
          {
            title: 'Section 1',
            description: '',
            lessons: [{ id: 'lesson-1', title: 'Lesson 1', description: '', content: '', videoUrl: '', durationMinutes: 15, isPreview: false }],
          },
        ],
      })
    )

    const lesson = mockCourseUpdate.mock.calls[0][0].data.sections.create[0].lessons.create[0]
    expect(lesson.durationSeconds).toBe(900)
  })

  it('never carries a video/resource onto a lesson with no id or an id that does not match any existing lesson', async () => {
    mockLessonFindMany.mockResolvedValue([
      { id: 'lesson-1', resourceLabel: 'Old resource', resourceFileName: 'lesson-1.pdf', videoFileName: 'lesson-1.mp4', videoProcessingStatus: 'ready' },
    ])
    mockCourseUpdate.mockResolvedValue({ id: 'course-1' })

    await updateCourse(
      'course-1',
      baseInput({
        sections: [
          {
            title: 'Section 1',
            description: '',
            lessons: [
              { title: 'Brand new lesson, never saved before', description: '', content: '', videoUrl: '', durationMinutes: 5, isPreview: false },
              { id: 'id-from-a-different-course-somehow', title: 'Mismatched id', description: '', content: '', videoUrl: '', durationMinutes: 5, isPreview: false },
            ],
          },
        ],
      })
    )

    const lessons = mockCourseUpdate.mock.calls[0][0].data.sections.create[0].lessons.create
    for (const lesson of lessons) {
      expect(lesson.resourceFileName).toBeNull()
      expect(lesson.videoFileName).toBeNull()
      expect(lesson.videoProcessingStatus).toBe('ready')
    }
  })

  it('passes accessWindowDays through to the updated row, including clearing it back to lifetime (null)', async () => {
    mockCourseUpdate.mockResolvedValue({ id: 'course-1' })
    await updateCourse('course-1', baseInput({ accessWindowDays: null }))
    expect(mockCourseUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ accessWindowDays: null }) })
    )
  })
})
