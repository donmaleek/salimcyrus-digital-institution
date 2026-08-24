export const publishedJournalEntries = [
  {
    slug: 'people-vent-on-social-media-because-they-arent-heard-in-person',
    title: "People Vent on Social Media Because They Aren't Heard in Person",
    subtitle:
      'A reflection on silence, attention, and the digital cry for help',
    category: 'Relationships and Society',
    publishedAt: 'September 4, 2025',
    readingTime: '8 minute overview',
    summary:
      'What looks like online oversharing can begin with a quieter failure: people do not feel heard in their homes, friendships, workplaces, or faith communities. This essay asks what attentive listening could repair before pain moves into public view.',
    thesis:
      'Digital expression is often a symptom of offline disconnection. Healthier communities are built when people learn to listen before they judge the way pain is expressed.',
    originalUrl:
      'https://salimcyrus.com/people-vent-on-social-media-because-they-arent-heard-in-person/',
  },
] as const

export const journalThemes = [
  {
    name: 'Relationships',
    question: 'What makes connection mature, safe, and responsible?',
    description:
      'Essays on listening, courtship, marriage, boundaries, conflict, and the habits that shape trust.',
  },
  {
    name: 'Identity',
    question: 'Who are you before performance, approval, and partnership?',
    description:
      'Writing on self-understanding, emotional patterns, personal history, and the work of becoming whole.',
  },
  {
    name: 'Manhood',
    question: 'How does a man turn strength into responsibility?',
    description:
      'Clear thinking on discipline, leadership, fatherhood, accountability, and service without performance.',
  },
  {
    name: 'Purpose and Work',
    question: 'What deserves your energy, discipline, and contribution?',
    description:
      'Ideas for aligning conviction with decisions, craft, leadership, enterprise, and useful action.',
  },
  {
    name: 'Kingdom Life',
    question: 'What does spiritual maturity look like in ordinary life?',
    description:
      'Reflections on grace, responsibility, wisdom, obedience, character, and faith expressed through practice.',
  },
  {
    name: 'Society',
    question: 'What do our public habits reveal about our private formation?',
    description:
      'Cultural analysis connecting technology, family, community, leadership, and the moral life of society.',
  },
] as const

export const editorialDesk = [
  {
    title: 'Why Marriage Cannot Fix an Identity Crisis',
    theme: 'Relationships and Identity',
    premise:
      'Partnership can reveal and support personal formation, but it cannot replace the work of knowing and governing oneself.',
  },
  {
    title: 'The Difference Between Being Male and Becoming a Man',
    theme: 'Manhood',
    premise:
      'A study of why biological adulthood and responsible manhood are different achievements.',
  },
  {
    title: 'Why Purpose Must Precede Partnership',
    theme: 'Purpose and Relationships',
    premise:
      'How direction, values, and responsibility change the way a person chooses and builds partnership.',
  },
  {
    title: 'The Psychology of Entitlement',
    theme: 'Identity and Society',
    premise:
      'An examination of expectation without responsibility and the habits required to replace it.',
  },
  {
    title: 'Grace Does Not Cancel Responsibility',
    theme: 'Kingdom Life',
    premise:
      'Why mercy and accountability belong together in mature spiritual formation.',
  },
] as const

export function findJournalEntry(slug: string) {
  return publishedJournalEntries.find((entry) => entry.slug === slug)
}
