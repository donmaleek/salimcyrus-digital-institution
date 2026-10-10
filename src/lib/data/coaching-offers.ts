export type CoachingCategorySlug =
  | 'standard'
  | 'identity-alignment'
  | 'single-motherhood-alignment'
  | 'individual'
  | 'couples'
  | 'group'
  | 'vip-summit'

export interface CoachingOffer {
  name: string
  category: CoachingCategorySlug
  /** Always a real session length (e.g. "2 Hours"), never a location
   * descriptor, see `location` for that. Shown prominently on every
   * booking card before price, per the client's explicit requirement that
   * duration never be buried. */
  duration: string
  /** Where the session happens, when that varies by offer (e.g. "Your
   * location, outside Mombasa"). Undefined for offers where location
   * isn't a variable, like the private alignment sessions. */
  location?: string
  /** A logistics commitment that must be visible before the client
   * confirms booking, e.g. travel/accommodation coverage for an
   * out-of-town session. Shown as its own callout, not buried in the
   * tagline. */
  logisticsNote?: string
  /** True for offers whose booking flow needs more than email/name before
   * payment (county/town, preferred date and time, and for couples the
   * number of participants), currently the two "outside Mombasa" travel
   * offers, see CoachingTripDetailsForm. */
  requiresTripDetails?: boolean
  tagline: string
  points: string[]
  outcome: string
  priceKes: number
  /** Computed at the same fixed rate used for books and programs
   * (~129.4 KES/USD), matching that existing convention rather than a
   * live exchange rate lookup. */
  priceUsd: number
  /** Legacy hosted Paystack links for the original Standard sessions.
   * First-party checkout now initializes every priced coaching offer through
   * /api/coaching/checkout, so new offers do not need individual hosted links. */
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
    duration: '2 Hours',
    location: "At Salim's location",
    tagline: "One-on-one coaching, hosted at Salim's own location.",
    points: [
      'Full one-on-one attention.',
      'Structured, distraction-free setting.',
    ],
    outcome: 'A private session built around your exact situation.',
    priceKes: 10000,
    priceUsd: 77,
  },
  {
    name: 'Individual Coaching, Your Location (Mombasa)',
    category: 'individual',
    duration: '2 Hours 30 Minutes',
    location: 'Your location, within Mombasa',
    tagline: 'One-on-one coaching at your location, within Mombasa.',
    points: ['Salim comes to you.', 'Same depth, your own space.'],
    outcome: 'A private session built around your exact situation.',
    priceKes: 15000,
    priceUsd: 116,
  },
  {
    name: 'Individual Coaching, Your Location (Kenya, Outside Mombasa)',
    category: 'individual',
    duration: '3 Hours 30 Minutes',
    location: 'Your location, outside Mombasa',
    logisticsNote:
      'Transport is catered for outside Mombasa, together with accommodation where required.',
    requiresTripDetails: true,
    tagline: 'One-on-one coaching at your location, elsewhere in Kenya.',
    points: ['Salim travels to you.', 'Same depth, wherever you are.'],
    outcome: 'A private session built around your exact situation.',
    priceKes: 35000,
    priceUsd: 270,
  },
  {
    name: 'Identity & Life Alignment Session',
    category: 'identity-alignment',
    duration: '2 Hours',
    tagline:
      'A confidential conversation for clarity around identity, relationships, values, faith, and personal direction.',
    points: [
      'Explore the question you are carrying without shame or pressure.',
      'Identify a clear, values-aligned next step.',
    ],
    outcome: 'Greater clarity, conviction, and direction for what comes next.',
    priceKes: 25000,
    priceUsd: 193,
  },
  {
    name: 'Single Motherhood & Life Alignment Session',
    category: 'single-motherhood-alignment',
    duration: '1 Hour 30 Minutes',
    tagline:
      'A confidential space for healing, relationships, boundaries, motherhood, purpose, and a thoughtful future.',
    points: [
      'Work through the realities you are carrying without losing sight of yourself.',
      'Choose practical next steps for your wellbeing, relationships, children, and future.',
    ],
    outcome: 'A clearer, healthier direction for the woman and mother you are becoming.',
    priceKes: 10000,
    priceUsd: 77,
  },
  {
    name: "Couples Coaching, At Salim's Location",
    category: 'couples',
    duration: '2 Hours',
    location: "At Salim's location",
    tagline: "One-on-one couples coaching, hosted at Salim's own location.",
    points: ['Both partners present.', 'A structured, neutral setting.'],
    outcome: 'A shared next step you both leave agreeing on.',
    priceKes: 20000,
    priceUsd: 155,
  },
  {
    name: 'Couples Coaching, Your Location (Mombasa)',
    category: 'couples',
    duration: '2 Hours 30 Minutes',
    location: 'Your location, within Mombasa',
    tagline: 'One-on-one couples coaching at your location, within Mombasa.',
    points: ['Salim comes to you.', 'Same depth, your own space.'],
    outcome: 'A shared next step you both leave agreeing on.',
    priceKes: 25000,
    priceUsd: 193,
  },
  {
    name: 'Couples Coaching, Your Location (Kenya, Outside Mombasa)',
    category: 'couples',
    duration: '3 Hours 30 Minutes',
    location: 'Your location, outside Mombasa',
    logisticsNote:
      'Transport is catered for outside Mombasa, together with accommodation where required.',
    requiresTripDetails: true,
    tagline:
      'One-on-one couples coaching at your location, elsewhere in Kenya.',
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
    points: [
      'Built around one shared theme.',
      'Practical, not just inspirational.',
    ],
    outcome: 'A group that leaves with the same language and next step.',
    priceKes: 150000,
    priceUsd: 1159,
  },
]

/** One arrangement that must be agreed before an international engagement
 * is confirmed (accommodation, travel, deposit). Shown as its own callout
 * on the request tier card, same visual weight as a priced offer's
 * logisticsNote. */
export interface CoachingArrangement {
  label: string
  note: string
}

/** Rich detail for a request tier whose terms are fully specified up
 * front (duration policy, rate policy, arrangements, booking steps) even
 * though the price itself is negotiated. Tiers without this (Group,
 * VIP Summit) keep the plain description-only card. */
export interface CoachingRequestTierDetail {
  engagementType: string
  durationNote: string
  rateNote: string
  arrangements: CoachingArrangement[]
  howToBook: string[]
  ctaLabel: string
}

/** Tiers with no fixed price: too situational (international travel, very
 * large groups, a conference booking) to quote without a conversation.
 * These never enter the payment pipeline; picking one shows a request
 * form instead of a checkout, see CoachingQuoteRequestForm. */
export interface CoachingRequestTier {
  category: Exclude<CoachingCategorySlug, 'standard'>
  label: string
  description: string
  /** True when the enquiry form should also collect a preferred location
   * and date up front, so the first follow-up already has logistics to
   * work with instead of starting from zero. */
  collectsLocationAndDate?: boolean
  detail?: CoachingRequestTierDetail
}

const internationalCoachingDetail: CoachingRequestTierDetail = {
  engagementType: 'Personalized Coaching & Mentorship',
  durationNote: 'By mutual agreement',
  rateNote: 'Available upon request',
  arrangements: [
    {
      label: 'Accommodation',
      note: 'Accommodation arrangements will be coordinated as part of the engagement.',
    },
    {
      label: 'Travel & Logistical Arrangements',
      note: 'International travel and related logistical arrangements will be discussed and agreed upon before confirmation.',
    },
    {
      label: 'Booking Deposit',
      note: 'A deposit is required to secure the engagement and confirm the agreed schedule. The applicable deposit amount and payment terms will be communicated during the booking process.',
    },
  ],
  howToBook: [
    'Submit an international coaching request.',
    'Provide your preferred location, dates, and coaching requirements.',
    'Discuss session duration, professional fees, accommodation, travel logistics, and deposit terms.',
    'Receive confirmation once the arrangements and required deposit have been agreed upon.',
  ],
  ctaLabel: 'Request International Coaching',
}

export const coachingRequestTiers: CoachingRequestTier[] = [
  {
    category: 'individual',
    label: 'Your Preferred Location, Outside Kenya',
    description:
      'Receive individualized coaching and mentorship delivered at your preferred international location, tailored to your personal goals, challenges, and development needs.',
    collectsLocationAndDate: true,
    detail: internationalCoachingDetail,
  },
  {
    category: 'couples',
    label: 'Your Preferred Location, Outside Kenya',
    description:
      'Receive individualized coaching and mentorship for both partners delivered at your preferred international location, tailored to your shared goals, challenges, and development needs.',
    collectsLocationAndDate: true,
    detail: internationalCoachingDetail,
  },
  {
    category: 'group',
    label: '200 to 1,000 People',
    description:
      'Larger group engagements. Submit a request to discuss scope and rates.',
  },
  {
    category: 'vip-summit',
    label: 'Speaking Engagement',
    description:
      "Conference keynotes, men's conferences, and summit speaking. Submit a request with your event details.",
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
    description:
      'Focused, single sessions built around one question or decision.',
  },
  {
    slug: 'identity-alignment',
    name: 'Identity & Life Alignment',
    description:
      'A confidential one-on-one session for identity, relationships, values, faith, and personal direction.',
  },
  {
    slug: 'single-motherhood-alignment',
    name: 'Single Motherhood & Life Alignment',
    description:
      'A confidential one-on-one session for healing, boundaries, relationships, motherhood, purpose, and the future.',
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
