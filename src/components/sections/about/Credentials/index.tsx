import { Button } from '@/components/ui/Button'

const credentials = [
  { name: 'Strategic Accountability Coach', year: '2024' },
  { name: 'Certified Life Coach', year: '2023' },
  { name: 'Advanced Emotional Intelligence', year: '2022' },
  { name: 'Human Potential Practitioner', year: '2021' },
  { name: 'Decision Architecture Specialist', year: '2020' },
]

const publishedWorks = [
  {
    title: 'Concealed Redemption',
    description:
      'A practical guide for recognizing repeated narratives and building healthier patterns.',
  },
  {
    title: 'The Great Deception',
    description:
      'A direct examination of the stories that steal focus and weaken personal accountability.',
  },
]

export function Credentials() {
  return (
    <section
      className="bg-white"
      aria-labelledby="credentials-heading"
      data-testid="about-credentials"
    >
      <div className="mx-auto max-w-content px-6 py-20 sm:py-24">
        <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
              Certifications
            </p>
            <h2
              id="credentials-heading"
              className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl"
            >
              Training behind the practice
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-navy-600">
              Credentials support Salim&apos;s work in coaching, emotional
              intelligence, human potential, accountability, and
              decision-making. They sit alongside lived practice, continued
              study, and measurable client action.
            </p>

            <ol className="mt-10 border-t border-navy-200">
              {credentials.map((credential) => (
                <li
                  key={credential.name}
                  className="flex items-baseline justify-between gap-6 border-b border-navy-200 py-5"
                >
                  <span className="font-heading text-lg font-semibold text-navy">
                    {credential.name}
                  </span>
                  <time className="shrink-0 text-sm font-bold text-gold-500">
                    {credential.year}
                  </time>
                </li>
              ))}
            </ol>
          </div>

          <aside
            className="bg-navy-50 p-8 sm:p-10"
            aria-labelledby="published-works-heading"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
              Author
            </p>
            <h3
              id="published-works-heading"
              className="mt-3 font-heading text-3xl font-bold text-navy"
            >
              Published works
            </h3>
            <div className="mt-8 space-y-8">
              {publishedWorks.map((book) => (
                <article key={book.title}>
                  <h4 className="font-heading text-xl font-semibold text-navy">
                    {book.title}
                  </h4>
                  <p className="mt-2 leading-7 text-navy-600">
                    {book.description}
                  </p>
                </article>
              ))}
            </div>
            <Button href="/books" variant="outline" className="mt-9">
              Explore the Books
            </Button>
          </aside>
        </div>
      </div>
    </section>
  )
}
