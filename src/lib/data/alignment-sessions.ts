export interface AlignmentSession {
  slug: 'identity-life-alignment' | 'single-motherhood-life-alignment'
  eyebrow: string
  title: string
  shortTitle: string
  description: string
  audienceIntroduction: string
  audience: string[]
  themes: Array<{ title: string; description: string }>
  principle: string
  closing: string
}

export const alignmentProcess = [
  {
    step: 'Listen',
    description: 'Create a private setting for an honest conversation without judgment.',
  },
  {
    step: 'Understand',
    description: 'Explore the experiences, emotions, relationships, and circumstances involved.',
  },
  {
    step: 'Examine',
    description: 'Look carefully at patterns, values, boundaries, beliefs, and decisions.',
  },
  {
    step: 'Align',
    description: 'Identify choices consistent with your stated values and desired direction.',
  },
  {
    step: 'Move forward',
    description: 'Leave with practical next steps for a healthier and more purposeful life.',
  },
] as const

export const alignmentSessions: AlignmentSession[] = [
  {
    slug: 'identity-life-alignment',
    eyebrow: 'Identity & Life Alignment',
    title: 'A Private Space for Clarity, Conviction, and Direction',
    shortTitle: 'Identity & Life Alignment',
    description:
      'Confidential one-on-one conversations for people navigating questions around identity, relationships, sexuality, values, faith, emotional wellbeing, and personal direction.',
    audienceIntroduction:
      'This engagement is for people who need room to think honestly before making personal decisions.',
    audience: [
      'You are questioning or exploring aspects of your identity.',
      'Relationships or sexuality are creating confusion or emotional distress.',
      'Personal experiences feel in tension with your values, faith, family, or culture.',
      'You want to understand your emotions, relationship patterns, and boundaries.',
      'You are carrying shame, fear, isolation, or internal conflict and need someone to talk to.',
      'You want to make intentional decisions about the life and relationships you are building.',
    ],
    themes: [
      {
        title: 'Identity & self-understanding',
        description: 'Your story, experiences, beliefs, emotions, and the questions you are facing now.',
      },
      {
        title: 'Values & convictions',
        description: 'The principles and beliefs that should guide the decisions you make about your life.',
      },
      {
        title: 'Relationships & boundaries',
        description: 'Attachment, communication, recurring patterns, and healthy interpersonal choices.',
      },
      {
        title: 'Emotional wellbeing',
        description: 'Space to process fear, shame, rejection, loneliness, disappointment, or conflict.',
      },
      {
        title: 'Faith & conscience',
        description: 'When you want it included, the relationship between faith, Scripture, conscience, and daily decisions.',
      },
      {
        title: 'Purpose & direction',
        description: 'The person you want to become and the kind of life you want to build.',
      },
    ],
    principle:
      'You will not be pressured, shamed, humiliated, or treated as less worthy because of what you are experiencing.',
    closing: 'The objective is clarity, not condemnation.',
  },
  {
    slug: 'single-motherhood-life-alignment',
    eyebrow: 'Single Motherhood & Life Alignment',
    title: 'Rebuild with Clarity Without Losing the Woman Behind the Mother',
    shortTitle: 'Single Motherhood & Life Alignment',
    description:
      'A confidential space for mothers navigating healing, relationships, boundaries, parenting responsibilities, purpose, and a thoughtful future.',
    audienceIntroduction:
      'This engagement is for mothers carrying the realities of parenting while rebuilding their own emotional and personal direction.',
    audience: [
      'You are raising children after separation, divorce, bereavement, or an absent partner.',
      'Loneliness, rejection, disappointment, or emotional exhaustion has become difficult to carry alone.',
      'You are considering dating or entering a new relationship after a difficult experience.',
      'You want to protect your children while deciding if and how a new partner enters their lives.',
      'You need healthier boundaries with an ex-partner or the father of your children.',
      'You want to rebuild confidence, identity, purpose, and hope for your future.',
    ],
    themes: [
      {
        title: 'Identity beyond motherhood',
        description: 'Rediscover the woman behind the responsibilities, including her values and aspirations.',
      },
      {
        title: 'Healing & resilience',
        description: 'Process grief, betrayal, rejection, loneliness, and experiences from past relationships.',
      },
      {
        title: 'Dating & relationships',
        description: 'Approach future relationships with discernment, realistic expectations, and healthy boundaries.',
      },
      {
        title: 'Children & new relationships',
        description: 'Consider how romantic decisions affect children and protect their emotional wellbeing.',
      },
      {
        title: 'Boundaries & co-parenting',
        description: 'Set practical boundaries around communication, responsibility, conflict, and former partners.',
      },
      {
        title: 'Purpose & personal growth',
        description: 'Move beyond survival so motherhood, relationships, growth, and purpose can coexist.',
      },
    ],
    principle:
      'Being a single mother does not diminish your dignity, value, or right to be treated with respect.',
    closing: 'You are a woman with a story, responsibilities, dreams, boundaries, and a future.',
  },
]

export function getAlignmentSession(slug: string) {
  return alignmentSessions.find((session) => session.slug === slug)
}
