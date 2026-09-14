import { z } from 'zod'

export const courseKinds = ['course', 'masterclass'] as const
export const courseStatuses = ['draft', 'published', 'archived'] as const

const lessonSchema = z.object({
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
})

export type CourseInput = z.infer<typeof courseInputSchema>

export const progressInputSchema = z.object({
  completed: z.boolean(),
  lastPositionSeconds: z.coerce.number().int().min(0).max(604_800).optional().default(0),
})
