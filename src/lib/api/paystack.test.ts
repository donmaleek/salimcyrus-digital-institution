import { createHmac } from 'crypto'
import { verifyPaystackSignature, matchOfferByAmount } from './paystack'
import { programs } from '@/lib/data/programs'
import { books } from '@/lib/data/books'

describe('verifyPaystackSignature', () => {
  const originalSecret = process.env.PAYSTACK_SECRET_KEY

  afterEach(() => {
    process.env.PAYSTACK_SECRET_KEY = originalSecret
  })

  it('accepts a signature computed with the correct secret', () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_abc123'
    const body = JSON.stringify({ event: 'charge.success', data: { reference: 'ref_1' } })
    const signature = createHmac('sha512', 'sk_test_abc123').update(body).digest('hex')

    expect(verifyPaystackSignature(body, signature)).toBe(true)
  })

  it('rejects a signature computed with the wrong secret', () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_abc123'
    const body = JSON.stringify({ event: 'charge.success', data: { reference: 'ref_1' } })
    const signature = createHmac('sha512', 'sk_test_wrong').update(body).digest('hex')

    expect(verifyPaystackSignature(body, signature)).toBe(false)
  })

  it('rejects a tampered body even with a signature that was valid for the original body', () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_abc123'
    const originalBody = JSON.stringify({ event: 'charge.success', data: { reference: 'ref_1' } })
    const signature = createHmac('sha512', 'sk_test_abc123').update(originalBody).digest('hex')
    const tamperedBody = JSON.stringify({ event: 'charge.success', data: { reference: 'ref_2' } })

    expect(verifyPaystackSignature(tamperedBody, signature)).toBe(false)
  })

  it('rejects when there is no signature header', () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_abc123'
    expect(verifyPaystackSignature('{}', null)).toBe(false)
  })

  it('rejects when PAYSTACK_SECRET_KEY is not configured', () => {
    delete process.env.PAYSTACK_SECRET_KEY
    expect(verifyPaystackSignature('{}', 'anything')).toBe(false)
  })
})

describe('matchOfferByAmount', () => {
  it('matches a program by its KES price in the smallest currency unit', () => {
    const program = programs[0]
    expect(matchOfferByAmount(program.priceKes * 100)).toBe(program.name)
  })

  it('matches a program by its USD price in the smallest currency unit', () => {
    const program = programs[0]
    expect(matchOfferByAmount(program.priceUsd * 100)).toBe(program.name)
  })

  it('matches an available book by its KES price', () => {
    const book = books.find((b) => b.status === 'available' && b.priceKes)!
    expect(matchOfferByAmount(book.priceKes! * 100)).toBe(book.title)
  })

  it('returns null for an amount that matches nothing', () => {
    expect(matchOfferByAmount(1)).toBeNull()
  })
})
