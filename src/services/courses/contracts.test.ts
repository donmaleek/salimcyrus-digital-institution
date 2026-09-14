import { courseInputSchema, progressInputSchema } from './contracts'
import { completionPercent } from './course-service'

const validCourse = { title: 'Purpose and Practice', subtitle: '', description: 'A structured path from insight to consistent daily practice.', kind: 'course', category: 'Purpose', level: 'all-levels', priceKes: 0, priceUsd: 0, thumbnailUrl: '', trailerUrl: '', outcomes: ['Build one repeatable practice'], status: 'published', featured: false, sections: [{ title: 'Start Here', description: '', lessons: [{ title: 'Orientation', description: '', content: 'Begin with a clear intention.', videoUrl: '', durationMinutes: 8, isPreview: true }] }] }

describe('course contract', () => {
  it('accepts an ordered publishable curriculum', () => { expect(courseInputSchema.safeParse(validCourse).success).toBe(true) })
  it('rejects a course with no outcome', () => { expect(courseInputSchema.safeParse({ ...validCourse, outcomes: [] }).success).toBe(false) })
  it('rejects an empty section so members never meet a dead end', () => { expect(courseInputSchema.safeParse({ ...validCourse, sections: [{ title: 'Empty', lessons: [] }] }).success).toBe(false) })
  it('rejects malformed lesson video URLs', () => { expect(courseInputSchema.safeParse({ ...validCourse, sections: [{ title: 'Start', lessons: [{ ...validCourse.sections[0].lessons[0], videoUrl: 'not-a-url' }] }] }).success).toBe(false) })
})

describe('course progress', () => {
  it('reports zero for a course without published lessons', () => expect(completionPercent(0, 0)).toBe(0))
  it('rounds visible member progress to a whole percentage', () => expect(completionPercent(2, 3)).toBe(67))
  it('rejects negative playback positions', () => expect(progressInputSchema.safeParse({ completed: false, lastPositionSeconds: -1 }).success).toBe(false))
})
