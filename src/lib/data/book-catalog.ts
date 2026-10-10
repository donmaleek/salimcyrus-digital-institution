import { db } from '@/lib/db'
import { books, whatsappOrderUrl, type BookEntry } from '@/lib/data/books'
import type { Book as DbBook } from '@prisma/client'

/**
 * Merges the 14 hand-curated static books (src/lib/data/books.ts, kept
 * untouched to avoid touching real purchase history tied to their exact
 * slugs) with books Salim uploads directly through the admin dashboard
 * (the Book table). Both kinds share the same BookEntry shape and the
 * same BOOKS_STORAGE_DIR file storage, so a purchase, download, or review
 * works identically regardless of which catalog a book came from.
 */
function dbBookToEntry(book: DbBook): BookEntry {
  return {
    slug: book.slug,
    title: book.title,
    subtitle: book.subtitle ?? undefined,
    description: book.description,
    category: book.category === 'Parenting Resource' ? 'Parenting Resource' : 'Book',
    priceKes: book.priceKes,
    priceUsd: book.priceUsd,
    pageCount: book.pageCount ?? 0,
    status: book.status === 'available' ? 'available' : 'upcoming',
    purchaseUrl: whatsappOrderUrl(book.title, book.priceKes),
    cover: book.coverPath,
    fileName: book.fileName,
  }
}

/**
 * Looks up a book by slug regardless of status. Deliberately unconditional:
 * callers that decide whether a book is buyable or publicly viewable (the
 * detail page, checkout routes) check `.status === 'available'` themselves,
 * while callers resolving an existing purchase (recordBookPurchase, the
 * download route, my-books) must never lose access just because the book
 * was drafted after the sale, so they call this with no gate at all.
 */
export async function getBookBySlug(slug: string): Promise<BookEntry | null> {
  const staticBook = books.find((b) => b.slug === slug)
  if (staticBook) return staticBook

  const dbBook = await db.book.findUnique({ where: { slug } })
  return dbBook ? dbBookToEntry(dbBook) : null
}

/**
 * All available books across both catalogs, for the public /books listing
 * and homepage. Newest admin uploads come first, ahead of the static 14:
 * both the homepage teaser and the my-books "recommended" strip only ever
 * show a slice of this list, so a book Salim just published needs to be
 * near the front to actually be seen, not permanently buried behind an
 * unchanging static catalog. Defaults to "Book" so the existing public
 * catalogue keeps showing only Salim's own titles; pass "Parenting
 * Resource" for the Parental Guidance resources catalogue instead. Every
 * static entry is implicitly "Book" (see dbBookToEntry's same default for
 * the DB side), so this never needs to touch the 14 hand-curated titles.
 */
export async function getAvailableBooks(
  category: 'Book' | 'Parenting Resource' = 'Book'
): Promise<BookEntry[]> {
  const dbBooks = await db.book.findMany({
    where: { status: 'available', category },
    orderBy: { createdAt: 'desc' },
  })
  const staticEntries = category === 'Book' ? books.filter((b) => b.status === 'available') : []
  return [...dbBooks.map(dbBookToEntry), ...staticEntries]
}
