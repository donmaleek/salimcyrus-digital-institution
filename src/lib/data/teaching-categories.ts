export const TEACHING_CATEGORIES = [
  'Relationships',
  'Purpose',
  'Manhood',
  'Kingdom',
  'Leadership',
  'Marketplace',
] as const

export type TeachingCategory = (typeof TEACHING_CATEGORIES)[number]
