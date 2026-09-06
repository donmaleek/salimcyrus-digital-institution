import { StarRating } from '@/components/books/StarRating'
import { BookReviewForm } from '@/components/books/BookReviewForm'
import type { RatingSummary } from '@/lib/api/book-reviews'

export interface DisplayReview {
  id: string
  reviewerName: string
  rating: number
  title: string | null
  body: string
  createdAt: string
}

export function BookReviewsSection({
  slug,
  summary,
  reviews,
}: {
  slug: string
  summary: RatingSummary
  reviews: DisplayReview[]
}) {
  return (
    <div id="reviews" className="mt-20 scroll-mt-24 border-t border-navy-100 pt-12">
      <h2 className="font-heading text-2xl font-bold text-navy">Customer Reviews</h2>

      {summary.count > 0 ? (
        <div className="mt-4 grid gap-8 lg:grid-cols-[280px_1fr]">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-4xl font-bold text-navy">
                {summary.average.toFixed(1)}
              </span>
              <span className="text-navy-500">out of 5</span>
            </div>
            <StarRating average={summary.average} count={summary.count} size="md" />
            <dl className="mt-4 space-y-1.5">
              {([5, 4, 3, 2, 1] as const).map((star) => {
                const pct = summary.count > 0 ? Math.round((summary.breakdown[star] / summary.count) * 100) : 0
                return (
                  <div key={star} className="flex items-center gap-2 text-xs text-navy-500">
                    <dt className="w-10 shrink-0">{star} star</dt>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-navy-100">
                      <div className="h-full rounded-full bg-gold-400" style={{ width: `${pct}%` }} />
                    </div>
                    <dd className="w-8 shrink-0 text-right">{pct}%</dd>
                  </div>
                )
              })}
            </dl>
          </div>

          <div className="space-y-6">
            {reviews.map((review) => (
              <article key={review.id} className="border-b border-navy-100 pb-6 last:border-0">
                <StarRating average={review.rating} count={1} />
                {review.title && (
                  <p className="mt-2 font-heading text-base font-bold text-navy">{review.title}</p>
                )}
                <p className="mt-2 leading-relaxed text-navy-600">{review.body}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-navy-400">
                  {review.reviewerName} &middot;{' '}
                  {new Date(review.createdAt).toLocaleDateString('en-KE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-4 text-navy-500">No reviews yet. Be the first to review this book.</p>
      )}

      <div className="mt-8 max-w-xl">
        <h3 className="font-heading text-lg font-bold text-navy">Write a review</h3>
        <div className="mt-3">
          <BookReviewForm slug={slug} />
        </div>
      </div>
    </div>
  )
}
