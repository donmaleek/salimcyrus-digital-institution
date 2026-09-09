jest.mock('../db', () => ({
  db: { book: { findUnique: jest.fn(), findMany: jest.fn() } },
}))

import { getBookBySlug, getAvailableBooks } from './book-catalog'
import { books } from './books'
import { db } from '@/lib/db'

const mockFindUnique = db.book.findUnique as jest.Mock
const mockFindMany = db.book.findMany as jest.Mock

describe('getBookBySlug', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns a static book without touching the database', async () => {
    const staticBook = books[0]
    const result = await getBookBySlug(staticBook.slug)
    expect(result).toEqual(staticBook)
    expect(mockFindUnique).not.toHaveBeenCalled()
  })

  it('falls back to the database for a slug not in the static catalog', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'db-1',
      slug: 'a-new-book',
      title: 'A New Book',
      subtitle: null,
      description: 'Description',
      priceKes: 1200,
      priceUsd: 9,
      pageCount: 80,
      fileName: 'a-new-book.pdf',
      coverPath: '/images/books/a-new-book.webp',
      status: 'available',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await getBookBySlug('a-new-book')

    expect(result).toEqual(
      expect.objectContaining({
        slug: 'a-new-book',
        title: 'A New Book',
        status: 'available',
        fileName: 'a-new-book.pdf',
        cover: '/images/books/a-new-book.webp',
      })
    )
  })

  it('returns a draft admin book unconditionally (past-purchase access must not be revoked by unpublishing)', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'db-2',
      slug: 'draft-book',
      title: 'Draft Book',
      subtitle: null,
      description: 'Description',
      priceKes: 800,
      priceUsd: 6,
      pageCount: null,
      fileName: 'draft-book.pdf',
      coverPath: '/images/books/draft-book.webp',
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await getBookBySlug('draft-book')
    expect(result?.status).toBe('upcoming')
  })

  it('returns null for a slug in neither catalog', async () => {
    mockFindUnique.mockResolvedValue(null)
    const result = await getBookBySlug('does-not-exist')
    expect(result).toBeNull()
  })
})

describe('getAvailableBooks', () => {
  beforeEach(() => jest.clearAllMocks())

  it('merges static books with available admin-uploaded books', async () => {
    mockFindMany.mockResolvedValue([
      {
        id: 'db-1',
        slug: 'a-new-book',
        title: 'A New Book',
        subtitle: null,
        description: 'Description',
        priceKes: 1200,
        priceUsd: 9,
        pageCount: 80,
        fileName: 'a-new-book.pdf',
        coverPath: '/images/books/a-new-book.webp',
        status: 'available',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    const result = await getAvailableBooks()

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: 'available' } })
    )
    expect(result).toHaveLength(books.length + 1)
    expect(result.map((b) => b.slug)).toContain('a-new-book')
  })

  it('never returns a draft admin book in the available list', async () => {
    mockFindMany.mockResolvedValue([])
    const result = await getAvailableBooks()
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: 'available' } })
    )
    expect(result).toHaveLength(books.length)
  })
})
