import { summarizeRatings, roundToHalfStar } from './book-reviews'

describe('summarizeRatings', () => {
  it('returns zero average and count for no ratings', () => {
    expect(summarizeRatings([])).toEqual({
      average: 0,
      count: 0,
      breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    })
  })

  it('computes the average and per-star breakdown', () => {
    const result = summarizeRatings([5, 5, 4, 3, 1])
    expect(result.count).toBe(5)
    expect(result.average).toBeCloseTo(3.6)
    expect(result.breakdown).toEqual({ 1: 1, 2: 0, 3: 1, 4: 1, 5: 2 })
  })

  it('ignores out-of-range values defensively', () => {
    const result = summarizeRatings([5, 0, 6])
    expect(result.count).toBe(3)
    expect(result.breakdown[5]).toBe(1)
    expect(result.breakdown[1] + result.breakdown[2] + result.breakdown[3] + result.breakdown[4]).toBe(0)
  })
})

describe('roundToHalfStar', () => {
  it('rounds to the nearest half star', () => {
    expect(roundToHalfStar(3.6)).toBe(3.5)
    expect(roundToHalfStar(3.76)).toBe(4)
    expect(roundToHalfStar(3.24)).toBe(3)
    expect(roundToHalfStar(3.25)).toBe(3.5)
  })
})
