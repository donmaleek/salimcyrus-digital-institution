const focusAreas = [
  'Relationships and marriage',
  'Identity and purpose',
  'Manhood and responsibility',
  'Leadership and execution',
  'Kingdom principles',
]

export function Story() {
  return (
    <section
      className="border-t border-navy-100 bg-cream"
      data-testid="about-story"
    >
      <div className="mx-auto max-w-content px-6 py-20 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-20">
          <div>
            <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
              My Story
            </p>
            <h2 className="mt-3 max-w-lg font-heading text-4xl font-bold leading-tight text-navy sm:text-5xl">
              Truth should change how you live.
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-navy-600">
              Salim Cyrus is a relationship coach, speaker, author, and Kingdom
              strategist who helps people replace confusion with clarity,
              responsibility, and disciplined action.
            </p>
          </div>

          <div className="space-y-6 text-base leading-8 text-navy-600 sm:text-lg">
            <p>
              His work began with a simple conviction: lasting change requires
              more than inspiration. It requires the courage to confront
              repeating patterns, renew the mind, and make decisions that can
              survive everyday pressure.
            </p>
            <p>
              Salim studied psychology and later explored embodiment practices
              to connect inner awareness with practical structure. Through
              coaching, workshops, writing, and teaching, he developed an
              approach that combines deep listening, direct truth, and
              accountable next steps.
            </p>
            <p>
              Today, his work serves people navigating relationship decisions,
              identity shifts, burnout, leadership pressure, and questions of
              purpose. The aim is not dependency on a coach. It is the ability
              to think clearly, act responsibly, and build a life rooted in
              wisdom.
            </p>
          </div>
        </div>

        <div className="mt-14 border-y border-navy-200 py-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-navy-400">
            Core areas of work
          </p>
          <ul className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-5">
            {focusAreas.map((area, index) => (
              <li
                key={area}
                className="flex items-start gap-3 text-sm font-semibold text-navy-700"
              >
                <span className="font-heading text-gold-500" aria-hidden>
                  {String(index + 1).padStart(2, '0')}
                </span>
                {area}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
