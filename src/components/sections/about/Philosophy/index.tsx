const principles = [
  {
    title: 'Truth before comfort',
    description:
      'Growth starts when a person can name what is happening without denial, blame, or performance.',
  },
  {
    title: 'Responsibility before rescue',
    description:
      "Support should strengthen a person's capacity to choose, act, repair, and lead their own life.",
  },
  {
    title: 'Structure before motivation',
    description:
      'A clear rhythm, honest accountability, and repeatable action outlast temporary emotional intensity.',
  },
  {
    title: 'Wisdom before noise',
    description:
      'Good decisions join spiritual conviction, sound thinking, emotional maturity, and practical consequences.',
  },
]

export function Philosophy() {
  return (
    <section
      className="bg-navy text-cream"
      aria-labelledby="philosophy-heading"
    >
      <div className="mx-auto max-w-content px-6 py-20 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
              Philosophy
            </p>
            <h2
              id="philosophy-heading"
              className="mt-3 font-heading text-3xl font-bold sm:text-4xl"
            >
              Formation, not performance
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-cream/75">
              Salim&apos;s teaching is built to produce mature people who can
              carry truth into relationships, leadership, work, money, and
              community.
            </p>
          </div>

          <dl className="border-t border-cream/20">
            {principles.map((principle) => (
              <div
                key={principle.title}
                className="grid gap-2 border-b border-cream/20 py-6 sm:grid-cols-[0.75fr_1.25fr] sm:gap-8"
              >
                <dt className="font-heading text-xl font-semibold text-cream">
                  {principle.title}
                </dt>
                <dd className="leading-7 text-cream/70">
                  {principle.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
