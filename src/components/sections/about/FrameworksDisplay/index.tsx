import { frameworks } from '@/lib/data/frameworks'

export function FrameworksDisplay() {
  return (
    <section className="bg-navy-50">
      <div className="mx-auto max-w-content px-6 py-20">
        <h2 className="font-heading text-3xl font-bold text-navy sm:text-4xl">My Frameworks</h2>
        <p className="mt-3 max-w-2xl text-navy-600">
          Proprietary frameworks instead of hundreds of disconnected ideas — this is how a
          personal brand becomes an intellectual property brand.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {frameworks.map((framework) => (
            <div key={framework.name} className="rounded-2xl border border-navy-100 bg-white p-6">
              <h3 className="font-heading text-lg font-semibold text-navy">{framework.name}</h3>
              <ol className="mt-4 flex flex-wrap items-center gap-2 text-sm text-navy-600">
                {framework.steps.map((step, index) => (
                  <li key={step} className="flex items-center gap-2">
                    <span className="rounded-full bg-gold-50 px-3 py-1 font-medium text-navy-700">
                      {step}
                    </span>
                    {index < framework.steps.length - 1 && (
                      <span className="text-navy-300" aria-hidden>
                        &rarr;
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
