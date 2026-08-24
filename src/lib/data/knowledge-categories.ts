export interface KnowledgeCategory {
  slug: string
  name: string
  description: string
  guidingQuestion: string
  topics: string[]
}

export const knowledgeCategories: KnowledgeCategory[] = [
  {
    slug: 'relationships',
    name: 'Relationships',
    description:
      'Build relational judgment for dating, marriage, trust, communication, conflict, and healthy commitment.',
    guidingQuestion: 'How do we love with both wisdom and maturity?',
    topics: [
      'Dating discernment',
      'Marriage preparation',
      'Communication',
      'Infidelity and repair',
      'Trust',
      'Conflict resolution',
      'Boundaries',
      'Sexual integrity',
    ],
  },
  {
    slug: 'manhood',
    name: 'Manhood',
    description:
      'Examine masculinity through responsibility, character, discipline, fatherhood, and service.',
    guidingQuestion: 'What does mature strength require from a man?',
    topics: [
      'Masculine identity',
      'Responsibility',
      'Fatherhood',
      'Self-mastery',
      'Courage',
      'Character formation',
    ],
  },
  {
    slug: 'purpose',
    name: 'Purpose',
    description:
      'Connect identity and calling to concrete assignments, meaningful work, and a life that leaves evidence.',
    guidingQuestion: 'What is this season asking me to become and build?',
    topics: [
      'Calling',
      'Vision',
      'Assignment',
      'Career direction',
      'Meaning',
      'Legacy',
    ],
  },
  {
    slug: 'kingdom',
    name: 'Kingdom',
    description:
      'Explore biblical truth as a framework for identity, authority, maturity, and everyday decisions.',
    guidingQuestion: 'How should revelation change the way I live?',
    topics: [
      'Grace',
      'Sonship',
      'Christ',
      'Kingdom mentality',
      'Spiritual maturity',
      'Biblical interpretation',
    ],
  },
  {
    slug: 'leadership',
    name: 'Leadership',
    description:
      'Develop the judgment to influence people, carry responsibility, shape culture, and make difficult decisions.',
    guidingQuestion: 'Can my character carry the influence I want?',
    topics: [
      'Influence',
      'Decision-making',
      'Delegation',
      'Accountability',
      'Team culture',
      'Stewardship',
    ],
  },
  {
    slug: 'business',
    name: 'Business',
    description:
      'Study value creation, money, strategy, customers, markets, and systems through responsible enterprise.',
    guidingQuestion: 'What real problem am I equipped to solve well?',
    topics: [
      'Entrepreneurship',
      'Money',
      'Strategy',
      'Marketing',
      'Sales',
      'Real estate',
      'Investing',
      'Marketplace wisdom',
    ],
  },
  {
    slug: 'society',
    name: 'Society',
    description:
      'Understand how culture, households, inherited patterns, justice, and communities shape collective life.',
    guidingQuestion: 'What must change for people and communities to flourish?',
    topics: [
      'Culture',
      'Household systems',
      'Generational patterns',
      'Poverty mentality',
      'Social reform',
      'Justice',
      'Community development',
    ],
  },
]
