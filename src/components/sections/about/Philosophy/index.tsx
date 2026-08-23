const topics = [
  'Relationships', 'Marriage', 'Manhood', 'Purpose', 'Leadership',
  'Business', 'Money', 'Kingdom', 'Society', 'Personal Responsibility',
]

export function Philosophy() {
  return (
    <section className="border-t border-navy-100 bg-cream">
      <div className="mx-auto max-w-content px-6 py-20">
        <h2 className="font-heading text-3xl font-bold text-navy sm:text-4xl">
          The Salim Cyrus Philosophy
        </h2>
        <p className="mt-3 max-w-2xl text-navy-600">
          A position on each of these becomes the intellectual fingerprint of everything Salim
          teaches. Content for each topic is being developed.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {topics.map((topic) => (
            <div
              key={topic}
              className="rounded-xl border border-dashed border-navy-200 bg-white p-5 text-center"
            >
              <p className="font-heading text-sm font-semibold text-navy">{topic}</p>
              <p className="mt-1 text-xs text-navy-400">Coming soon</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
