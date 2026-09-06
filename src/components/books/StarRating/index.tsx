import { roundToHalfStar } from '@/lib/api/book-reviews'

function Star({ fill }: { fill: 'full' | 'half' | 'empty' }) {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
      <path
        d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.8L10 14.9l-5.2 2.73.99-5.8-4.21-4.1 5.82-.85z"
        fill={fill === 'empty' ? 'none' : 'currentColor'}
        fillOpacity={fill === 'half' ? 0.5 : 1}
        stroke="currentColor"
        strokeWidth={fill === 'empty' ? 1.5 : 0}
      />
    </svg>
  )
}

/**
 * Read-only star display for a real average rating. Never renders when
 * count is 0 — an empty "0.0 stars (0 reviews)" row looks worse than no
 * row at all, and Amazon itself hides the star row for unrated listings.
 */
export function StarRating({
  average,
  count,
  size = 'sm',
}: {
  average: number
  count: number
  size?: 'sm' | 'md'
}) {
  if (count === 0) return null

  const rounded = roundToHalfStar(average)
  const stars = Array.from({ length: 5 }, (_, i) => {
    const position = i + 1
    if (rounded >= position) return 'full'
    if (rounded + 0.5 === position) return 'half'
    return 'empty'
  }) as Array<'full' | 'half' | 'empty'>

  return (
    <div className={`flex items-center gap-1.5 text-gold-500 ${size === 'md' ? 'text-base' : 'text-sm'}`}>
      <div className="flex">
        {stars.map((fill, i) => (
          <Star key={i} fill={fill} />
        ))}
      </div>
      <span className="text-navy-500">
        {average.toFixed(1)} ({count} {count === 1 ? 'review' : 'reviews'})
      </span>
    </div>
  )
}
