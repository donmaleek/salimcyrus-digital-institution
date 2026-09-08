import { WHATSAPP_NUMBER } from '@/lib/utils/constants'

export const BOOK_MIN_PRICE_KES = 500
export const BOOK_MAX_PRICE_KES = 1000

export interface BookEntry {
  slug: string
  title: string
  subtitle?: string
  description: string
  priceKes: number
  /** PayPal can't charge in KES (unsupported currency), see PayPal's
   * currency-codes reference. Statically priced in USD at the same rate
   * used for programs (~129.4 KES/USD), matching that existing convention
   * rather than a live FX lookup. */
  priceUsd: number
  pageCount: number
  status: 'available' | 'upcoming'
  purchaseUrl: string
  cover: string
  /**
   * Filename of the source PDF under BOOKS_STORAGE_DIR (see README). Only set
   * for titles where the file has been confirmed to match the listing;
   * instant download is deliberately unavailable for any slug without one
   * (falls back to the WhatsApp order flow) rather than risk shipping the
   * wrong book to a paying customer. See docs/book-file-mapping-todo.md.
   */
  fileName?: string
}

function whatsappOrderUrl(title: string, priceKes: number) {
  const message = `Hello, I would like to order "${title}" by Salim Cyrus for KES ${priceKes.toLocaleString('en-KE')}.`
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

function book(
  slug: string,
  title: string,
  priceKes: number,
  priceUsd: number,
  pageCount: number,
  description: string,
  subtitle?: string,
  fileName?: string
): BookEntry {
  return {
    slug,
    title,
    subtitle,
    description,
    priceKes,
    priceUsd,
    pageCount,
    status: 'available',
    purchaseUrl: whatsappOrderUrl(title, priceKes),
    cover: `/images/books/${slug}.webp`,
    fileName,
  }
}

// Priced by length (real page counts from each PDF) rather than one flat
// rate: 14 distinct prices, evenly spread across KES 500-1,000, shortest
// book cheapest, longest priciest. Every title has a unique price.
export const books: BookEntry[] = [
  book(
    'understanding-the-marketplace',
    'Understanding the Marketplace',
    850,
    7,
    133,
    'A Kingdom-minded guide for entrepreneurs, leaders, and professionals navigating business, stewardship, innovation, and economic change.',
    'Navigating the Storms of Business',
    'The Market Place - By Salim Cyrus.pdf'
  ),
  book(
    'the-greatest-tragedy',
    'The Greatest Tragedy Is Not Death',
    690,
    5,
    83,
    'An exploration of identity, calling, and Kingdom purpose for anyone determined to build a meaningful life in a world full of distraction.',
    'It Is a Life Without Purpose',
    'The_Greatest_Tragedy_Is_Not_Death_But_A_Life_Without_Purpose- By SALIM CYRUS.pdf'
  ),
  book(
    'emotional-blackmail',
    'Emotional Blackmail',
    580,
    4,
    64,
    'A practical guide to recognizing manipulation, confronting guilt and fear, setting boundaries, and breaking patterns of toxic control.',
    'Breaking Free from Manipulation, Guilt or Fear, and Toxic Control',
    'The Emotional Blackmail - By SALIM CYRUS.pdf'
  ),
  book(
    'time-money-pornography-and-the-glory-of-god',
    'Time, Money, Pornography and the Glory of God',
    500,
    4,
    49,
    'A faith-centered examination of how time, money, and digital desire compete for attention, discipline, and devotion.',
    undefined,
    'TIME, MONEY, PORNOGRAPHY & THE GLORY OF GOD- By SALIM CYRUS.pdf'
  ),
  book(
    'the-great-deception',
    'The Great Deception',
    650,
    5,
    70,
    'A brutal accounting of how the stories you tell yourself keep stealing your focus, and how to reclaim the narrative with accountability and clarity.',
    undefined,
    'THE GREAT DECEPTION- By SALIM CYRUS.pdf'
  ),
  book(
    'the-cost-of-infidelity',
    'The Cost of Infidelity',
    620,
    5,
    66,
    'An honest examination of betrayal, broken trust, and the emotional and relational cost of infidelity.',
    undefined,
    'THE COST OF INFIDELITY.pdf'
  ),
  book(
    'ritual-scorecard',
    'Ritual Scorecard',
    810,
    6,
    102,
    'A structured practice for measuring daily alignment and weekly truth across discipline, identity, purpose, and accountability.',
    'The Discipline of Daily Alignment and Weekly Truth',
    'RITUAL SCORECARD- By SALIM CYRUS.pdf'
  ),
  book(
    'pornography-and-the-death-of-purpose',
    'Pornography and the Death of Purpose',
    1000,
    8,
    185,
    'A focused examination of identity theft in the digital age and the way destructive media habits erode direction, discipline, and purpose.',
    'Identity Theft in the Digital Age',
    'PORNOGRAPHY AND THE DEATH OF PURPOSE IDENTITY THEFT IN THE DIGITAL AGE.pdf'
  ),
  book(
    'god-do-you-need-my-money',
    'God, Do You Need My Money?',
    880,
    7,
    134,
    'A challenge to religious manipulation that reclaims biblical truth, generosity, stewardship, and integrity.',
    'Exposing the Manipulation, Reclaiming the Truth, and Returning to Biblical Generosity',
    'God_Do_You_Need_My_Money_Salim_Cyrus.pdf'
  ),
  book(
    'digital-economic-systems-decoded',
    'Digital Economic Systems Decoded',
    920,
    7,
    148,
    'An accessible look at how platforms, governments, and algorithms influence identity, data, opportunity, and economic power.',
    undefined,
    'Digital_Economic_Systems_Decoded_Masterclass (1).pdf'
  ),
  book(
    'unless-they-kill-god',
    'Unless They Kill God',
    730,
    6,
    87,
    'A forceful reflection on why no system, religion, or power can stop the purposes of God in a person’s life.',
    'Why No System, Religion, or Power Can Stop the Purposes of God in a Man’s Life',
    'UNLESS THEY KILL GOD - By SALIM CYRUS.pdf'
  ),
  book(
    'concealed-redemption',
    'Concealed Redemption',
    770,
    6,
    100,
    'A hopeful exploration of how God works behind broken places to reveal purpose, renewal, and restoration.',
    'How God Works Behind the Broken Places to Reveal His Greatest Purpose',
    'CONCEALED REDEMPTION - By SALIM CYRUS.pdf'
  ),
  book(
    'the-deception',
    'The Deception',
    960,
    7,
    157,
    'A brutal accounting of the lies you live by across ten territories of self-deception, from personal narrative to spiritual performance, and the truth that sets you free.',
    undefined,
    'THE DECEPTION - By SALIM CYRUS.pdf'
  ),
  book(
    'marriage-and-knowing-the-right-partner',
    'Marriage and Knowing the Right Partner',
    540,
    4,
    64,
    'A framework for discerning character and compatibility before marriage, covering self-knowledge, observation, hard conversations, evaluation, and decision, so commitment follows real covenant readiness rather than chemistry alone.',
    'Discerning Love, Character, Compatibility, Covenant and Purpose',
    'MARRIAGE & KNOWING THE RIGHT PARTNER- By SALIM CYRUS.pdf'
  ),
]
