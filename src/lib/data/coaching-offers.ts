export interface CoachingOffer {
  name: string
  duration: string
  tagline: string
  points: string[]
  outcome: string
  paystackUrl: string
}

export const coachingOffers: CoachingOffer[] = [
  {
    name: 'Starter Session',
    duration: '30 min',
    tagline: 'Quick clarity on one decision.',
    points: ['Name the blocker.', 'Pick the next move.'],
    outcome: 'Leave with one clear next step.',
    paystackUrl:
      'https://paystack.com/buy/30-mins-personal-clarity-and-direction-session-qsrjip',
  },
  {
    name: 'Clarity Session',
    duration: '60 min',
    tagline: 'Solve one key decision fast.',
    points: ['Map what is blocking you.', 'Set one committed action.'],
    outcome: 'Clear plan for this week.',
    paystackUrl:
      'https://paystack.com/buy/1-hour-personal-coaching-session-mfkrkq',
  },
  {
    name: 'Deep Reset Session',
    duration: '120 min',
    tagline: 'Reset patterns that keep repeating.',
    points: ['Find the root loop.', 'Build a focused reset routine.'],
    outcome: 'A reset plan you can keep.',
    paystackUrl: 'https://paystack.com/buy/2-hours-mindset-reset-qufnqu',
  },
  {
    name: 'Private Coaching',
    duration: '4-8 weeks',
    tagline: 'Weekly support and accountability.',
    points: ['Weekly coaching call.', 'Midweek check-in support.'],
    outcome: 'Steady momentum for 4-8 weeks.',
    paystackUrl: 'https://paystack.com/buy/vip-breakthrough-experience-gaogfu',
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
