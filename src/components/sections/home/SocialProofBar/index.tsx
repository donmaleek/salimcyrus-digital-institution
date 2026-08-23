const pillars = [
  { label: 'SalimCyrus.com', role: 'The Headquarters' },
  { label: 'YouTube', role: 'The Classroom' },
  { label: 'The Podcast', role: 'The Conversation' },
  { label: 'The Halisi Insight', role: 'The Relationship' },
  { label: 'Halisi Hub Connect', role: 'The Fellowship' },
]

export function SocialProofBar() {
  return (
    <section className="bg-navy-900">
      <div className="mx-auto max-w-content px-6 py-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-5">
          {pillars.map((pillar) => (
            <div key={pillar.label} className="text-center sm:text-left">
              <p className="font-heading text-sm font-semibold text-cream">{pillar.label}</p>
              <p className="text-xs uppercase tracking-wide text-cream/50">{pillar.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
