export interface KnowledgeCategory {
  slug: string
  name: string
  topics: string[]
}

export const knowledgeCategories: KnowledgeCategory[] = [
  {
    slug: 'relationships',
    name: 'Relationships',
    topics: ['Dating', 'Marriage', 'Communication', 'Infidelity', 'Trust', 'Emotional Intelligence', 'Conflict', 'Boundaries', 'Sexual Integrity', 'Family'],
  },
  {
    slug: 'manhood',
    name: 'Manhood',
    topics: ['Identity', 'Responsibility', 'Masculinity', 'Fatherhood', 'Leadership', 'Discipline', 'Character'],
  },
  {
    slug: 'purpose',
    name: 'Purpose',
    topics: ['Identity', 'Calling', 'Vision', 'Assignment', 'Career', 'Meaning', 'Legacy'],
  },
  {
    slug: 'kingdom',
    name: 'Kingdom',
    topics: ['Grace', 'Sonship', 'Christ', 'Kingdom Mentality', 'Spiritual Maturity', 'Biblical Interpretation'],
  },
  {
    slug: 'leadership',
    name: 'Leadership',
    topics: ['Leadership', 'Influence', 'Character', 'Decision-Making', 'Entrepreneurship'],
  },
  {
    slug: 'business',
    name: 'Business',
    topics: ['Entrepreneurship', 'Leadership', 'Money', 'Strategy', 'Marketing', 'Sales', 'Real Estate', 'Investing', 'Marketplace Wisdom'],
  },
  {
    slug: 'society',
    name: 'Society',
    topics: ['Culture', 'Family', 'Generational Patterns', 'Poverty Mentality', 'Social Reform', 'Justice', 'Community Development'],
  },
]
