import { db } from '@/lib/db'
import { books, BOOK_MIN_PRICE_KES, BOOK_MAX_PRICE_KES } from '@/lib/data/books'
import { requireCrmPage } from '@/services/crm/access'
import { BookReviewModerationManager } from '@/components/dashboard/BookReviewModerationManager'
import {
  CrmPageHeader,
  MetricCard,
  StatusBadge,
  money,
} from '@/components/dashboard/crm/CrmUi'
export const dynamic = 'force-dynamic'
export default async function BooksPage() {
  await requireCrmPage()
  const [products, orders, pendingReviews] = await Promise.all([
    db.crmProduct.findMany({
      where: { type: 'book' },
      orderBy: { name: 'asc' },
    }),
    db.crmOrder.findMany({
      include: { contact: true, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    db.bookReview.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
    }),
  ])
  const stock = products.reduce((s, p) => s + (p.stockOnHand || 0), 0)
  const sales = orders
    .filter((o) => ['paid', 'completed'].includes(o.status))
    .reduce((s, o) => s + o.totalMinor, 0)
  return (
    <div className="mx-auto max-w-[1500px]">
      <CrmPageHeader
        eyebrow="Salim Cyrus library"
        title="Books, orders and stock"
        description={`All ${books.length} current titles are priced individually by length, from KES ${BOOK_MIN_PRICE_KES.toLocaleString('en-KE')} to KES ${BOOK_MAX_PRICE_KES.toLocaleString('en-KE')}, and connect each buyer to Relationship 360.`}
      />
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Published titles"
          value={String(books.length)}
          detail="Aligned with the public Books page"
        />
        <MetricCard
          label="Stock on hand"
          value={String(stock)}
          detail="Across initialized book products"
          tone={stock ? 'green' : 'gold'}
        />
        <MetricCard
          label="Recorded book sales"
          value={money(sales)}
          detail={`${orders.length} orders`}
          tone="green"
        />
      </div>
      <div className="mt-7 grid gap-7 xl:grid-cols-[1.1fr_1fr]">
        <section className="rounded-3xl border border-navy-100 bg-white p-5">
          <h2 className="font-heading text-xl font-bold text-navy">
            Catalog control
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {books.map((book) => {
              const product = products.find(
                (p) => p.sku === `BOOK-${book.slug.toUpperCase()}`
              )
              return (
                <article key={book.slug} className="rounded-2xl bg-cream p-4">
                  <p className="font-bold text-navy">{book.title}</p>
                  <p className="mt-2 text-sm font-bold text-gold-600">
                    KES {book.priceKes.toLocaleString('en-KE')}
                  </p>
                  <p className="mt-2 text-xs text-navy-400">
                    {product
                      ? `${product.stockOnHand ?? 'Untracked'} in stock`
                      : 'Awaiting CRM seed'}
                  </p>
                </article>
              )
            })}
          </div>
        </section>
        <section className="rounded-3xl border border-navy-100 bg-white p-5">
          <h2 className="font-heading text-xl font-bold text-navy">
            Order desk
          </h2>
          <div className="mt-4 space-y-3">
            {orders.map((o) => (
              <article
                key={o.id}
                className="rounded-2xl border border-navy-100 p-4"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-bold text-navy">{o.orderNumber}</p>
                    <p className="text-xs text-navy-400">
                      {o.contact?.displayName || 'Buyer not linked'} ·{' '}
                      {o.items.reduce((s, i) => s + i.quantity, 0)} books
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusBadge value={o.fulfillmentStatus} />
                    <p className="mt-2 font-bold text-navy">
                      {money(o.totalMinor, o.currency)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
      <section className="mt-7 rounded-3xl border border-navy-100 bg-white p-5">
        <h2 className="font-heading text-xl font-bold text-navy">
          Reviews awaiting moderation
        </h2>
        <p className="mt-1 text-sm text-navy-500">
          Only verified buyers can submit a review. Approve or reject before it counts
          toward the public rating.
        </p>
        <div className="mt-4">
          <BookReviewModerationManager
            initialReviews={pendingReviews.map((review) => ({
              id: review.id,
              bookSlug: review.bookSlug,
              bookTitle: books.find((b) => b.slug === review.bookSlug)?.title ?? review.bookSlug,
              reviewerName: review.reviewerName,
              rating: review.rating,
              title: review.title,
              body: review.body,
              createdAt: review.createdAt.toISOString(),
            }))}
          />
        </div>
      </section>
    </div>
  )
}
