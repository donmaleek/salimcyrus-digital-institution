import type { Metadata } from 'next'
import { AskSalimForm } from '@/components/forms/AskSalimForm'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'

export const metadata: Metadata = {
  title: 'Ask Salim | Submit a Thoughtful Question',
  description:
    'Ask Salim Cyrus a focused question about relationships, identity, manhood, purpose, Kingdom life, leadership, business, or society.',
}

const process = [
  [
    'Ask',
    'Send one focused question with only the context needed to understand it.',
  ],
  [
    'Review',
    'Questions are reviewed for clarity, relevance, privacy, and usefulness to other readers.',
  ],
  [
    'Respond',
    'Selected questions may receive a written, recorded, or newsletter response.',
  ],
  [
    'Publish',
    'Public answers follow the name and privacy preference chosen in the submission.',
  ],
]

const questionPrompts = [
  [
    'Relationships',
    'How do I distinguish patience from avoiding a necessary boundary?',
  ],
  [
    'Identity',
    'Why do I keep returning to a role that no longer reflects who I am becoming?',
  ],
  [
    'Manhood',
    'What responsibility should a man learn before pursuing greater influence?',
  ],
  [
    'Purpose',
    'How do I make a wise decision when two meaningful paths compete?',
  ],
  [
    'Kingdom Life',
    'How should grace change the way I face responsibility and correction?',
  ],
  [
    'Leadership',
    'What should I examine when my results are strong but my relationships are strained?',
  ],
]

const selectionStandards = [
  'The question is specific enough to answer clearly',
  'The issue can help more than one person think better',
  'The answer fits Salim’s fields of teaching and experience',
  'The submission protects the privacy of everyone involved',
  'The question does not require urgent or licensed professional support',
]

export default function AskSalimPage() {
  return (
    <>
      <PageHero
        eyebrow="Ask Salim"
        title="Bring One Honest Question Into Clearer Focus"
        description="Ask about a decision, pattern, relationship, responsibility, or belief. Selected questions become thoughtful public answers that can help more than one person."
        actions={
          <>
            <Button href="#submit-question" size="lg">
              Ask Your Question
            </Button>
            <Button href="#how-it-works" variant="outline-inverse" size="lg">
              How Answers Are Chosen
            </Button>
          </>
        }
      />

      <main data-testid="ask-salim-content">
        <section className="bg-cream" aria-labelledby="invitation-heading">
          <div className="mx-auto grid max-w-content gap-12 px-6 py-16 sm:py-24 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                The Invitation
              </p>
              <h2
                id="invitation-heading"
                className="mt-3 font-heading text-4xl font-bold leading-tight text-navy sm:text-5xl"
              >
                Good answers begin with well-formed questions.
              </h2>
            </div>
            <div className="space-y-6 text-lg leading-8 text-navy-600">
              <p>
                Ask Salim is a public learning desk for real questions about
                human formation, relationships, faith, responsibility,
                leadership, work, and society. It is designed for reflection and
                practical wisdom, not quick reactions.
              </p>
              <p>
                You do not need to tell your entire story. Name the tension,
                explain what makes it difficult, and ask what you genuinely want
                to understand. Remove personal details that belong to someone
                else.
              </p>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="scroll-mt-24 bg-white"
          aria-labelledby="process-heading"
        >
          <div className="mx-auto max-w-content px-6 py-16 sm:py-24">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                How It Works
              </p>
              <h2
                id="process-heading"
                className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl"
              >
                A transparent path from submission to answer
              </h2>
            </div>
            <ol
              className="mt-12 border-t border-navy-200"
              data-testid="answer-process"
            >
              {process.map(([title, description], index) => (
                <li
                  key={title}
                  className="grid gap-4 border-b border-navy-200 py-7 sm:grid-cols-[56px_0.6fr_1.4fr] sm:gap-8"
                >
                  <span className="font-heading font-bold text-gold-500">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-heading text-2xl font-semibold text-navy">
                    {title}
                  </h3>
                  <p className="leading-7 text-navy-600">{description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          className="bg-navy text-cream"
          aria-labelledby="prompts-heading"
        >
          <div className="mx-auto max-w-content px-6 py-16 sm:py-24">
            <div className="grid gap-12 lg:grid-cols-[0.62fr_1.38fr] lg:gap-20">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
                  Question Studio
                </p>
                <h2
                  id="prompts-heading"
                  className="mt-3 font-heading text-3xl font-bold sm:text-4xl"
                >
                  Use these examples to sharpen your own question.
                </h2>
                <p className="mt-5 text-lg leading-8 text-cream/70">
                  The strongest questions describe a real tension without asking
                  Salim to decide another person&apos;s motives.
                </p>
              </div>
              <ol
                className="border-t border-cream/20"
                data-testid="question-prompts"
              >
                {questionPrompts.map(([category, question], index) => (
                  <li
                    key={category}
                    className="grid gap-3 border-b border-cream/20 py-5 sm:grid-cols-[48px_0.48fr_1.52fr] sm:gap-6"
                  >
                    <span className="font-heading font-bold text-gold">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-semibold text-cream">{category}</h3>
                    <p className="font-heading text-lg italic leading-7 text-cream/80">
                      {question}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section
          id="submit-question"
          className="scroll-mt-24 bg-cream"
          aria-labelledby="form-heading"
        >
          <div className="mx-auto grid max-w-content gap-12 px-6 py-16 sm:py-24 lg:grid-cols-[0.58fr_1.42fr] lg:gap-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                Your Submission
              </p>
              <h2
                id="form-heading"
                className="mt-3 font-heading text-4xl font-bold text-navy sm:text-5xl"
              >
                Ask one question that matters.
              </h2>
              <p className="mt-5 text-lg leading-8 text-navy-600">
                Your question remains editable until you send it from your email
                application.
              </p>
              <div className="mt-8 border-y border-navy-200 py-6 text-sm leading-6 text-navy-500">
                <p className="font-semibold text-navy">Before you write</p>
                <p className="mt-2">
                  Do not include passwords, financial information, private
                  documents, diagnoses, or identifying details about another
                  person.
                </p>
              </div>
            </div>
            <div className="border-t-4 border-gold-500 bg-white p-7 shadow-[0_24px_60px_rgba(15,27,45,0.08)] sm:p-10">
              <AskSalimForm />
            </div>
          </div>
        </section>

        <section className="bg-white" aria-labelledby="selection-heading">
          <div className="mx-auto grid max-w-content gap-12 px-6 py-16 sm:py-24 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                Selection Standard
              </p>
              <h2
                id="selection-heading"
                className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl"
              >
                What makes a question suitable for a public answer?
              </h2>
              <p className="mt-5 text-lg leading-8 text-navy-600">
                Submission does not guarantee a response. Selection depends on
                clarity, relevance, safety, and whether the answer can serve the
                wider audience responsibly.
              </p>
            </div>
            <ol className="border-t border-navy-200">
              {selectionStandards.map((standard, index) => (
                <li
                  key={standard}
                  className="grid grid-cols-[48px_1fr] border-b border-navy-200 py-5"
                >
                  <span className="font-heading font-bold text-gold-500">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="font-semibold leading-7 text-navy-700">
                    {standard}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          className="bg-navy text-cream"
          aria-labelledby="boundaries-heading"
        >
          <div className="mx-auto grid max-w-content gap-12 px-6 py-16 sm:py-24 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
                Important Boundaries
              </p>
              <h2
                id="boundaries-heading"
                className="mt-3 font-heading text-3xl font-bold sm:text-4xl"
              >
                Wisdom has limits, and responsible guidance names them.
              </h2>
            </div>
            <div className="space-y-5 text-lg leading-8 text-cream/75">
              <p>
                Ask Salim is educational and reflective. It is not emergency
                support, therapy, medical care, legal advice, financial advice,
                or a substitute for qualified local help.
              </p>
              <p>
                If you or someone else may be in immediate danger, contact local
                emergency services or an appropriate crisis service in your
                location. For private personal work that fits Salim&apos;s
                scope, use the coaching pathway instead of a public question.
              </p>
              <Button
                href="/work-with-salim/coaching"
                variant="outline-inverse"
              >
                Explore Private Coaching
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
