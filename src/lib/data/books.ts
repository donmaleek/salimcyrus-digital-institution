import { WHATSAPP_NUMBER } from '@/lib/utils/constants'

export const BOOK_PRICE_KES = 1499

export interface BookEntry {
  slug: string
  title: string
  subtitle?: string
  description: string
  priceKes: number
  status: 'available' | 'upcoming'
  purchaseUrl: string
  cover: string
}

function whatsappOrderUrl(title: string) {
  const message = `Hello, I would like to order "${title}" by Salim Cyrus for KES ${BOOK_PRICE_KES.toLocaleString('en-KE')}.`
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

function book(
  slug: string,
  title: string,
  description: string,
  subtitle?: string
): BookEntry {
  return {
    slug,
    title,
    subtitle,
    description,
    priceKes: BOOK_PRICE_KES,
    status: 'available',
    purchaseUrl: whatsappOrderUrl(title),
    cover: `/images/books/${slug}.webp`,
  }
}

export const books: BookEntry[] = [
  book(
    'understanding-the-marketplace',
    'Understanding the Marketplace',
    'A Kingdom-minded guide for entrepreneurs, leaders, and professionals navigating business, stewardship, innovation, and economic change.',
    'Navigating the Storms of Business'
  ),
  book(
    'the-unhealed-traumas-of-our-parents',
    'The Unhealed Traumas of Our Parents',
    'A journey of healing that confronts generational patterns, emotional wounds, and inherited beliefs so families can build a healthier legacy.',
    'Escaping the Chains of Generational Brokenness'
  ),
  book(
    'the-greatest-tragedy',
    'The Greatest Tragedy Is Not Death',
    'An exploration of identity, calling, and Kingdom purpose for anyone determined to build a meaningful life in a world full of distraction.',
    'It Is a Life Without Purpose'
  ),
  book(
    'the-great-deception-of-pornography',
    'The Great Deception of Pornography',
    'A direct account of how pornography manipulates the mind, steals purpose, and damages spiritual life, with a path toward truth and freedom.',
    'How It Manipulates Your Mind, Steals Your Purpose, and Kills Your Spiritual Life'
  ),
  book(
    'emotional-blackmail',
    'Emotional Blackmail',
    'A practical guide to recognizing manipulation, confronting guilt and fear, setting boundaries, and breaking patterns of toxic control.',
    'Breaking Free from Manipulation, Guilt or Fear, and Toxic Control'
  ),
  book(
    'time-money-pornography-and-the-glory-of-god',
    'Time, Money, Pornography and the Glory of God',
    'A faith-centered examination of how time, money, and digital desire compete for attention, discipline, and devotion.'
  ),
  book(
    'the-great-deception',
    'The Great Deception',
    'A brutal accounting of how the stories you tell yourself keep stealing your focus, and how to reclaim the narrative with accountability and clarity.'
  ),
  book(
    'the-cost-of-infidelity',
    'The Cost of Infidelity',
    'An honest examination of betrayal, broken trust, and the emotional and relational cost of infidelity.'
  ),
  book(
    'ritual-scorecard',
    'Ritual Scorecard',
    'A structured practice for measuring daily alignment and weekly truth across discipline, identity, purpose, and accountability.',
    'The Discipline of Daily Alignment and Weekly Truth'
  ),
  book(
    'pornography-and-the-death-of-purpose',
    'Pornography and the Death of Purpose',
    'A focused examination of identity theft in the digital age and the way destructive media habits erode direction, discipline, and purpose.',
    'Identity Theft in the Digital Age'
  ),
  book(
    'god-do-you-need-my-money',
    'God, Do You Need My Money?',
    'A challenge to religious manipulation that reclaims biblical truth, generosity, stewardship, and integrity.',
    'Exposing the Manipulation, Reclaiming the Truth, and Returning to Biblical Generosity'
  ),
  book(
    'digital-economic-systems-decoded',
    'Digital Economic Systems Decoded',
    'An accessible look at how platforms, governments, and algorithms influence identity, data, opportunity, and economic power.'
  ),
  book(
    'unless-they-kill-god',
    'Unless They Kill God',
    'A forceful reflection on why no system, religion, or power can stop the purposes of God in a person’s life.',
    'Why No System, Religion, or Power Can Stop the Purposes of God in a Man’s Life'
  ),
  book(
    'concealed-redemption',
    'Concealed Redemption',
    'A hopeful exploration of how God works behind broken places to reveal purpose, renewal, and restoration.',
    'How God Works Behind the Broken Places to Reveal His Greatest Purpose'
  ),
]
