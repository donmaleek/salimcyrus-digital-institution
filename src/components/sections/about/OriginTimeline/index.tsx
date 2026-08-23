const stages = [
  'Origins', 'Challenges', 'Education', 'Transformation',
  'Leadership', 'Coaching', 'Author', 'Halisi Hub Connect', 'Future Vision',
]

export function OriginTimeline() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-content px-6 py-20">
        <h2 className="font-heading text-3xl font-bold text-navy sm:text-4xl">
          The Journey of Salim Cyrus
        </h2>
        <p className="mt-3 max-w-2xl text-navy-600">
          Not simply &ldquo;I am a coach.&rdquo; The full story — context for why Salim has
          something to say — is being written.
        </p>
        <ol className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-4">
          {stages.map((stage, index) => (
            <li key={stage} className="flex items-center gap-3">
              <span className="rounded-full border border-navy-200 bg-white px-4 py-2 text-sm font-medium text-navy-700">
                {stage}
              </span>
              {index < stages.length - 1 && (
                <span className="text-navy-300" aria-hidden>
                  &rarr;
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
