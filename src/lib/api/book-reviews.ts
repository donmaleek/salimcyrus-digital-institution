export interface RatingSummary {
  average: number
  count: number
  breakdown: Record<1 | 2 | 3 | 4 | 5, number>
}

export function summarizeRatings(ratings: number[]): RatingSummary {
  const breakdown: RatingSummary['breakdown'] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  for (const rating of ratings) {
    const bucket = Math.round(rating) as 1 | 2 | 3 | 4 | 5
    if (bucket >= 1 && bucket <= 5) breakdown[bucket] += 1
  }
  const count = ratings.length
  const average = count === 0 ? 0 : ratings.reduce((sum, r) => sum + r, 0) / count
  return { average, count, breakdown }
}

export function roundToHalfStar(average: number): number {
  return Math.round(average * 2) / 2
}
