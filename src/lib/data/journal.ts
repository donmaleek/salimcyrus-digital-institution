// Published journal entries live in the database (JournalEntry model) so
// Salim can write and publish new ones from /dashboard/admin/journal without
// a code change or deploy. See src/app/(site)/journal for the reading pages
// and src/app/api/admin/journal for the authoring API.

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
