import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { BookManager } from '@/components/dashboard/BookManager'
import { requireCrmPage } from '@/services/crm/access'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Manage Books',
}

export default async function AdminBooksPage() {
  await requireCrmPage('content:write')

  const books = await db.book.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  })

  return (
    <div>
      <div className="rounded-3xl bg-navy px-6 py-8 text-white sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Content studio</p>
        <h1 className="mt-3 font-heading text-3xl font-bold">Books</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
          Upload a book, set its price and cover, and control what buyers can see. Published books appear
          alongside the existing catalog on the public Books page and the homepage.
        </p>
      </div>
      <div className="mt-8">
        <BookManager
          initialBooks={books.map((book) => ({
            id: book.id,
            slug: book.slug,
            title: book.title,
            status: book.status,
            priceKes: book.priceKes,
            coverPath: book.coverPath,
            updatedAt: book.updatedAt.toISOString(),
          }))}
        />
      </div>
    </div>
  )
}
