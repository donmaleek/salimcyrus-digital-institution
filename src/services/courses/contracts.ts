import { z } from 'zod'

export const courseKinds = ['course', 'masterclass'] as const
export const courseStatuses = ['draft', 'published', 'archived'] as const

const lessonSchema = z.object({
  // Only used to look up which existing lesson this is, so a resave can
  // carry over its uploaded video/resource (see nestedSections in
  // course-service.ts); never trusted for anything else, and ignored
  // entirely for a brand-new lesson.
  id: z.string().trim().optional(),
  title: z.string().trim().min(1).max(180),
  description: z.string().trim().max(1000).optional().default(''),
  content: z.string().trim().max(50_000).optional().default(''),
  videoUrl: z.union([z.string().trim().url(), z.literal('')]).optional().default(''),
  durationMinutes: z.coerce.number().int().min(0).max(1440).optional().default(0),
  isPreview: z.coerce.boolean().optional().default(false),
})

const sectionSchema = z.object({
  title: z.string().trim().min(1).max(180),
  description: z.string().trim().max(1000).optional().default(''),
  lessons: z.array(lessonSchema).min(1).max(100),
})

export const courseInputSchema = z.object({
  title: z.string().trim().min(3).max(200),
  subtitle: z.string().trim().max(240).optional().default(''),
  description: z.string().trim().min(20).max(10_000),
  kind: z.enum(courseKinds),
  category: z.string().trim().min(2).max(80),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'all-levels']).default('all-levels'),
  priceKes: z.coerce.number().int().min(0).max(1_000_000),
  priceUsd: z.coerce.number().int().min(0).max(10_000),
  thumbnailUrl: z.union([z.string().trim().url(), z.literal('')]).optional().default(''),
  trailerUrl: z.union([z.string().trim().url(), z.literal('')]).optional().default(''),
  outcomes: z.array(z.string().trim().min(1).max(240)).min(1).max(12),
  sections: z.array(sectionSchema).min(1).max(50),
  status: z.enum(courseStatuses).default('draft'),
  featured: z.coerce.boolean().optional().default(false),
  // Days of video access from enrollment; null/omitted means lifetime.
  // See Course.accessWindowDays in schema.prisma for the full rationale.
  accessWindowDays: z.union([z.coerce.number().int().min(1).max(3650), z.null()]).optional(),
})

export type CourseInput = z.infer<typeof courseInputSchema>

const FRIENDLY_FIELD_LABELS: Record<string, string> = {
  priceKes: 'Price (KES)',
  priceUsd: 'Price (USD)',
  accessWindowDays: 'Replay access window (days)',
}

/**
 * The course form's number inputs (price, access window, lesson duration)
 * only snap to whole numbers on blur/change in the client; typing a decimal
 * (or scrolling/arrow-keying one in on some browsers, since the editor's
 * custom save button bypasses native HTML5 step validation) still reaches
 * here as a float and fails courseInputSchema's `.int()` check. Zod's raw
 * message for that ("expected int, received number") means nothing to
 * an admin, so translate the common whole-number cases into plain language
 * before falling back to the raw Zod message for anything else.
 */
export function courseInputErrorMessage(error: z.ZodError): string {
  const issue = error.issues[0]
  if (!issue) return 'Invalid course.'
  // accessWindowDays is a union (whole number | null), so zod 4 nests the
  // real "expected int" issue one level down under invalid_union.
  const candidates = issue.code === 'invalid_union' ? (issue as { errors?: Array<Array<unknown>> }).errors?.flat() ?? [] : [issue]
  const isFloatIssue = candidates.some(
    (candidate) => (candidate as { code?: string }).code === 'invalid_type' && (candidate as { expected?: string }).expected === 'int'
  )
  if (isFloatIssue && issue.path[issue.path.length - 1] === 'durationMinutes') {
    return 'Lesson duration (minutes) must be a whole number, not a decimal.'
  }
  const label = typeof issue.path[0] === 'string' ? FRIENDLY_FIELD_LABELS[issue.path[0]] : undefined
  if (isFloatIssue && label) {
    return `${label} must be a whole number, not a decimal.`
  }
  return issue.message
}

export const progressInputSchema = z.object({
  completed: z.boolean(),
  lastPositionSeconds: z.coerce.number().int().min(0).max(604_800).optional().default(0),
})
