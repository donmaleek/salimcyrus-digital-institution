const stages = [
  {
    number: '01',
    title: 'Study the person',
    description:
      'Psychology and embodiment practices shaped an approach that considers thought, emotion, behavior, and the realities of daily life.',
  },
  {
    number: '02',
    title: 'Turn insight into structure',
    description:
      'Coaching and workshops revealed that insight matters only when it becomes a decision, a practice, and a standard people can sustain.',
  },
  {
    number: '03',
    title: 'Write what confronts',
    description:
      'Concealed Redemption and The Great Deception were created as practical mirrors for the stories, patterns, and avoidance that hold people back.',
  },
  {
    number: '04',
    title: 'Build systems for transformation',
    description:
      'Private coaching grew into structured programs for identity, relationships, manhood, discipline, emotional healing, and leadership.',
  },
  {
    number: '05',
    title: 'Multiply the work',
    description:
      'Halisi Hub Connect brings the teaching into a wider institution built around formation, community, media, and purposeful living.',
  },
]

export function OriginTimeline() {
  return (
    <section className="bg-white" aria-labelledby="journey-heading">
      <div className="mx-auto max-w-content px-6 py-20 sm:py-24">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
            The Journey
          </p>
          <h2
            id="journey-heading"
            className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl"
          >
            From private insight to public service
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-navy-600">
            The work has expanded, but the sequence remains the same: understand
            the pattern, confront it honestly, build a better structure, and
            practice it until it becomes a way of life.
          </p>
        </div>

        <ol className="mt-12 border-t border-navy-200">
          {stages.map((stage) => (
            <li
              key={stage.number}
              className="grid gap-3 border-b border-navy-200 py-7 sm:grid-cols-[72px_0.65fr_1fr] sm:items-start sm:gap-8"
            >
              <span className="font-heading text-xl font-bold text-gold-500">
                {stage.number}
              </span>
              <h3 className="font-heading text-xl font-semibold text-navy">
                {stage.title}
              </h3>
              <p className="leading-7 text-navy-600">{stage.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
