export interface BookEntry {
  slug: string
  title: string
  subtitle?: string
  description: string
  priceKes?: number
  status: 'available' | 'upcoming'
  paystackUrl?: string
  cover?: string
}

export const books: BookEntry[] = [
  {
    slug: 'concealed-redemption',
    title: 'Concealed Redemption',
    description:
      'A pocket manual for catching the narrative you keep replaying so you can stop reliving the same stress and build a new pattern with small, sustainable rituals.',
    priceKes: 1499,
    status: 'available',
    paystackUrl: 'https://paystack.com/buy/concealed-redemption-wimdwx',
    cover: '/images/books/concealed-redemption.webp',
  },
  {
    slug: 'the-great-deception',
    title: 'The Great Deception',
    description:
      'A brutal accounting of how the stories you tell yourself keep stealing your focus, and how to reclaim the narrative with accountability and clarity.',
    priceKes: 1499,
    status: 'available',
    paystackUrl: 'https://paystack.com/buy/the-great-deception-rnjacy',
    cover: '/images/books/the-great-deception.webp',
  },
  {
    slug: 'the-greatest-tragedy',
    title: 'The Greatest Tragedy Is Not Death...',
    subtitle: 'It Is a Life Without Purpose',
    description: 'An upcoming title on identity, calling, and building a life around purpose rather than performance.',
    status: 'upcoming',
  },
]
