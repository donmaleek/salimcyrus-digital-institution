import { frameworks } from '@/lib/data/frameworks'

export function FrameworksDisplay() {
  return (
    <section className="bg-cream" aria-labelledby="frameworks-heading">
      <div className="mx-auto max-w-content px-6 py-20 sm:py-24">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
            Method
          </p>
          <h2
            id="frameworks-heading"
            className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl"
          >
            Frameworks that move ideas into action
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-navy-600">
            These frameworks give coaching and teaching a repeatable path. Each
            one helps people locate the real issue, make a clear decision, and
            build a practice around it.
          </p>
        </div>

        <div className="mt-12 grid border-t border-navy-200 md:grid-cols-2">
          {frameworks.map((framework, frameworkIndex) => (
            <article
              key={framework.name}
              className="border-b border-navy-200 py-8 md:odd:border-r md:odd:pr-10 md:even:pl-10"
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-500">
                Framework {String(frameworkIndex + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-3 font-heading text-2xl font-semibold text-navy">
                {framework.name}
              </h3>
              <ol className="mt-6 space-y-3">
                {framework.steps.map((step, index) => (
                  <li key={step} className="flex gap-4 text-navy-600">
                    <span className="font-heading font-bold text-navy-300">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
