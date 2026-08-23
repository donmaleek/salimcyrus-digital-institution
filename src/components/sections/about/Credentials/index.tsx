const credentials = [
  { name: 'Certified Life Coach', year: 2023 },
  { name: 'Advanced Emotional Intelligence', year: 2022 },
  { name: 'Strategic Accountability Coach', year: 2024 },
  { name: 'Human Potential Practitioner', year: 2021 },
  { name: 'Decision Architecture Specialist', year: 2020 },
]

export function Credentials() {
  return (
    <section className="bg-navy-50">
      <div className="mx-auto max-w-content px-6 py-20">
        <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
          Certifications
        </p>
        <h2 className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl">
          Credentials Support the Work. Results Define It.
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {credentials.map((credential) => (
            <div key={credential.name} className="rounded-2xl border border-navy-100 bg-white p-6">
              <p className="font-heading text-lg font-semibold text-navy">{credential.name}</p>
              <p className="mt-1 text-sm text-navy-400">{credential.year}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
