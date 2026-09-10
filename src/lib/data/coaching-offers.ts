export type CoachingCategorySlug = 'standard' | 'individual' | 'couples' | 'group' | 'vip-summit'

export interface CoachingOffer {
  name: string
  category: CoachingCategorySlug
  duration: string
  tagline: string
  points: string[]
  outcome: string
  priceKes: number
  /** Computed at the same fixed rate used for books and programs
   * (~129.4 KES/USD), matching that existing convention rather than a
   * live exchange rate lookup. */
  priceUsd: number
  /** Only the original 3 Standard sessions have a real link, kept for
   * reference though unused in the UI (Paystack was removed from every
   * checkout surface in favor of PayPal + Paybill). New offers never get
   * one, since there is nothing to point it at. */
  paystackUrl?: string
}

export const coachingOffers: CoachingOffer[] = [
  {
    name: 'Starter Session',
    category: 'standard',
    duration: '30 min',
    tagline: 'Quick clarity on one decision.',
    points: ['Name the blocker.', 'Pick the next move.'],
    outcome: 'Leave with one clear next step.',
    priceKes: 3500,
    priceUsd: 27,
    paystackUrl:
      'https://paystack.com/buy/30-mins-personal-clarity-and-direction-session-qsrjip',
  },
  {
    name: 'Clarity Session',
    category: 'standard',
    duration: '60 min',
    tagline: 'Solve one key decision fast.',
    points: ['Map what is blocking you.', 'Set one committed action.'],
    outcome: 'Clear plan for this week.',
    priceKes: 5000,
    priceUsd: 39,
    paystackUrl:
      'https://paystack.com/buy/1-hour-personal-coaching-session-mfkrkq',
  },
  {
    name: 'Deep Reset Session',
    category: 'standard',
    duration: '120 min',
    tagline: 'Reset patterns that keep repeating.',
    points: ['Find the root loop.', 'Build a focused reset routine.'],
    outcome: 'A reset plan you can keep.',
    priceKes: 7500,
    priceUsd: 58,
    paystackUrl: 'https://paystack.com/buy/2-hours-mindset-reset-qufnqu',
  },
  {
    name: "Individual Coaching, At Salim's Location",
    category: 'individual',
    duration: "At Salim's location",
    tagline: 'One-on-one coaching, hosted at Salim\'s own location.',
    points: ['Full one-on-one attention.', 'Structured, distraction-free setting.'],
    outcome: 'A private session built around your exact situation.',
    priceKes: 10000,
    priceUsd: 77,
  },
  {
    name: 'Individual Coaching, Your Location (Mombasa)',
    category: 'individual',
    duration: 'Your location, within Mombasa',
    tagline: 'One-on-one coaching at your location, within Mombasa.',
    points: ['Salim comes to you.', 'Same depth, your own space.'],
    outcome: 'A private session built around your exact situation.',
    priceKes: 15000,
    priceUsd: 116,
  },
  {
    name: 'Individual Coaching, Your Location (Kenya, Outside Mombasa)',
    category: 'individual',
    duration: 'Your location, outside Mombasa',
    tagline: 'One-on-one coaching at your location, elsewhere in Kenya.',
    points: ['Salim travels to you.', 'Same depth, wherever you are.'],
    outcome: 'A private session built around your exact situation.',
    priceKes: 35000,
    priceUsd: 270,
  },
  {
    name: "Couples Coaching, At Salim's Location",
    category: 'couples',
    duration: "At Salim's location",
    tagline: 'One-on-one couples coaching, hosted at Salim\'s own location.',
    points: ['Both partners present.', 'A structured, neutral setting.'],
    outcome: 'A shared next step you both leave agreeing on.',
    priceKes: 20000,
    priceUsd: 155,
  },
  {
    name: 'Couples Coaching, Your Location (Mombasa)',
    category: 'couples',
    duration: 'Your location, within Mombasa',
    tagline: 'One-on-one couples coaching at your location, within Mombasa.',
    points: ['Salim comes to you.', 'Same depth, your own space.'],
    outcome: 'A shared next step you both leave agreeing on.',
    priceKes: 25000,
    priceUsd: 193,
  },
  {
    name: 'Couples Coaching, Your Location (Kenya, Outside Mombasa)',
    category: 'couples',
    duration: 'Your location, outside Mombasa',
    tagline: 'One-on-one couples coaching at your location, elsewhere in Kenya.',
    points: ['Salim travels to you.', 'Same depth, wherever you are.'],
    outcome: 'A shared next step you both leave agreeing on.',
    priceKes: 35000,
    priceUsd: 270,
  },
  {
    name: 'Group Coaching, 50 to 200 People',
    category: 'group',
    duration: '50 to 200 people',
    tagline: 'A structured coaching session for a group or team.',
    points: ['Built around one shared theme.', 'Practical, not just inspirational.'],
    outcome: 'A group that leaves with the same language and next step.',
    priceKes: 150000,
    priceUsd: 1159,
  },
]

/** Tiers with no fixed price: too situational (international travel, very
 * large groups, a conference booking) to quote without a conversation.
 * These never enter the payment pipeline; picking one shows a request
 * form instead of a checkout, see CoachingQuoteRequestForm. */
export interface CoachingRequestTier {
  category: CoachingCategorySlug
  label: string
  description: string
}

export const coachingRequestTiers: CoachingRequestTier[] = [
  {
    category: 'individual',
    label: 'Your Location, Outside Kenya',
    description: 'International one-on-one coaching. Submit a request to discuss timing and rates.',
  },
  {
    category: 'couples',
    label: 'Your Location, Outside Kenya',
    description: 'International couples coaching. Submit a request to discuss timing and rates.',
  },
  {
    category: 'group',
    label: '200 to 1,000 People',
    description: 'Larger group engagements. Submit a request to discuss scope and rates.',
  },
  {
    category: 'vip-summit',
    label: 'Speaking Engagement',
    description:
      'Conference keynotes, men\'s conferences, and summit speaking. Submit a request with your event details.',
  },
]

export interface CoachingCategory {
  slug: CoachingCategorySlug
  name: string
  description: string
}

export const coachingCategories: CoachingCategory[] = [
  {
    slug: 'standard',
    name: 'Standard Sessions',
    description: 'Focused, single sessions built around one question or decision.',
  },
  {
    slug: 'individual',
    name: 'Individual Coaching',
    description: 'One-on-one coaching with Salim, priced by location.',
  },
  {
    slug: 'couples',
    name: 'Couples Coaching',
    description: 'One-on-one coaching for two, priced by location.',
  },
  {
    slug: 'group',
    name: 'Group Coaching',
    description: 'Structured sessions for teams, cohorts, and groups.',
  },
  {
    slug: 'vip-summit',
    name: 'VIP Summit & Speaking',
    description: 'Conference keynotes and summit speaking engagements.',
  },
]

export const coachingProcess = [
  'Diagnose',
  'Decide',
  'Build',
  'Execute',
  'Review',
]

export const coachingStats = [
  { value: '92%', label: 'Clients regain measurable clarity by session two' },
  {
    value: '3',
    label: 'Core commitments defended in every coaching conversation',
  },
  { value: '24h', label: 'Max response window for accountability check-ins' },
]

export const coachingFaqs = [
  {
    q: 'How quickly can I expect to see movement?',
    a: 'Most clients leave the first session with one clear, defensible next step. Momentum compounds from there.',
  },
  {
    q: 'What happens between sessions?',
    a: 'Midweek check-in support keeps follow-through visible without needless meetings.',
  },
  {
    q: 'Do you offer support outside the scheduled time?',
    a: 'Accountability check-ins are answered within a 24-hour window.',
  },
  {
    q: 'What if I need to pause the work?',
    a: 'We pause rather than progress when you need more time to choose. The work only moves at your decision.',
  },
  {
    q: 'How do you keep the engagement private?',
    a: 'All coaching is conducted one-on-one and treated as confidential.',
  },
]
