import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { BookEditForm } from '@/components/dashboard/BookEditForm'
import { requireCrmPage } from '@/services/crm/access'
import { BOOK_MAX_PRICE_KES } from '@/lib/data/books'

export const metadata: Metadata = {
  title: 'Edit Book',
}

export default async function EditBookPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  await requireCrmPage('content:write')

  const book = await db.book.findUnique({ where: { id: params.id } })
  if (!book) notFound()

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-500">Books</p>
      <h1 className="mt-2 font-heading text-3xl font-bold text-navy">Edit Book</h1>
      <p className="mt-2 max-w-2xl text-sm text-navy-500">
        Update the title, description, price, or pages, and replace the PDF or cover if needed. Nothing is
        deleted or recreated; buyers who already purchased keep their access.
      </p>
      <div className="mt-8">
        <BookEditForm
          id={book.id}
          title={book.title}
          subtitle={book.subtitle}
          description={book.description}
          priceKes={book.priceKes}
          priceUsd={book.priceUsd}
          pageCount={book.pageCount}
          coverPath={book.coverPath}
          maxPriceKes={BOOK_MAX_PRICE_KES}
        />
      </div>
    </div>
  )
}
