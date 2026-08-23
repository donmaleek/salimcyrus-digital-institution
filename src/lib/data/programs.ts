export interface Program {
  slug: string
  name: string
  tag: string
  duration: string
  focus: string
  description: string
  highlights: string[]
  scripture?: string
  priceKes: number
  priceUsd: number
  recurring?: boolean
  closingLine: string
  paystackUrl: string
}

export const programs: Program[] = [
  {
    slug: 'identity-reformation-program',
    name: 'The Identity Reformation Program',
    tag: 'Flagship',
    duration: '8-12 Weeks',
    focus: 'Identity, purpose, inner healing',
    description: 'Flagship transformation track that replaces false identities with purpose and disciplined execution.',
    highlights: [
      'Weeks 1-3: Breaking false identities (culture, trauma, religion)',
      'Weeks 4-6: Renewing the mind (Romans 12:2 AMP)',
    ],
    scripture: 'Romans 12:2 (AMP) — be transformed by the renewing of your mind.',
    priceKes: 25000,
    priceUsd: 193,
    closingLine: 'This is where people stop performing and start becoming.',
    paystackUrl: 'https://paystack.shop/pay/jgbl6hhq7v',
  },
  {
    slug: 'kingdom-mentality-masterclass',
    name: 'Kingdom Mentality Masterclass',
    tag: 'Membership',
    duration: 'Monthly Subscription',
    focus: 'Spiritual intelligence plus practical life systems',
    description: 'Build a community of thinkers who can apply revelation to real life decisions.',
    highlights: ['Religion versus revelation', 'Laws of the Kingdom: identity, authority, dominion'],
    scripture: 'Luke 17:21 (AMP) — the kingdom of God is within you.',
    priceKes: 2500,
    priceUsd: 20,
    recurring: true,
    closingLine: 'This builds a community of thinkers, not just followers.',
    paystackUrl: 'https://paystack.shop/pay/p2j14f4bbo',
  },
  {
    slug: 'defining-manhood-bootcamp',
    name: 'Defining Manhood Bootcamp',
    tag: 'Men Only',
    duration: 'Bootcamp',
    focus: 'Masculinity, discipline, responsibility',
    description: 'A direct challenge to rebuild strength, accountability, and leadership in men.',
    highlights: ['Sexual discipline and self-mastery', 'Leadership in relationships'],
    scripture: '1 Corinthians 16:13 (AMP) — act like men, be courageous, be strong.',
    priceKes: 25000,
    priceUsd: 193,
    closingLine: 'This will challenge men where society has made them comfortable.',
    paystackUrl: 'https://paystack.shop/pay/997xi94hc4',
  },
  {
    slug: 'relationship-intelligence-program',
    name: 'Relationship Intelligence Program',
    tag: 'Relationships',
    duration: 'Cohort or Private',
    focus: 'Modern relationships, truth over fantasy',
    description: 'Build relational clarity with tools that replace confusion with maturity.',
    highlights: ['Compatibility versus chemistry', 'Trauma bonding versus genuine connection'],
    scripture: '1 Peter 4:8 (AMP) — love one another deeply.',
    priceKes: 20000,
    priceUsd: 155,
    closingLine: 'This is where illusions die and truth begins.',
    paystackUrl: 'https://paystack.shop/pay/6v8heotsk5',
  },
  {
    slug: 'discipline-and-execution-system',
    name: 'The Discipline and Execution System',
    tag: 'Execution',
    duration: '30-60 Days',
    focus: 'Action, consistency, results',
    description: 'Turn revelation into consistent action with daily structure and accountability.',
    highlights: ['Daily structure for mind, body, and spirit', 'Habit-building frameworks'],
    scripture: '2 Timothy 1:7 (AMP) — power, love, and self-discipline.',
    priceKes: 20000,
    priceUsd: 155,
    closingLine: 'Because revelation without execution is self-deception.',
    paystackUrl: 'https://paystack.shop/pay/e2i5qf7s4v',
  },
  {
    slug: 'hekima-inner-circle',
    name: 'Hekima Inner Circle',
    tag: 'Inner Circle',
    duration: 'Premium Membership',
    focus: 'Proximity, mentorship, exclusivity',
    description: 'A private container for leaders who want direct access and live case analysis.',
    highlights: ['Weekly private sessions', 'Direct Q and A access'],
    priceKes: 20000,
    priceUsd: 155,
    recurring: true,
    closingLine: 'This is where you stop speaking to crowds and start raising leaders.',
    paystackUrl: 'https://paystack.shop/pay/501d4mbx4c',
  },
  {
    slug: 'healing-and-restoration-intensive',
    name: 'Healing and Restoration Intensive',
    tag: 'Healing',
    duration: 'Intensive',
    focus: 'Emotional wounds, betrayal, past trauma',
    description: 'Walk through healing with a clear process that restores trust and self-worth.',
    highlights: ['Forgiveness as a decision, not a feeling', 'Breaking soul ties'],
    scripture: 'Psalm 147:3 (AMP) — He heals the brokenhearted and binds their wounds.',
    priceKes: 15000,
    priceUsd: 116,
    closingLine: 'Many people are not broken by life, but by unprocessed pain.',
    paystackUrl: 'https://paystack.shop/pay/ergo2eagg-',
  },
]
