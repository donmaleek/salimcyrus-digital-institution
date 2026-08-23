interface CoachingPackageCardProps {
  title: string
  topics: string[]
}

export function CoachingPackageCard({ title, topics }: CoachingPackageCardProps) {
  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-6">
      <h3 className="font-heading text-lg font-semibold text-navy">{title}</h3>
      <ul className="mt-4 space-y-2">
        {topics.map((topic) => (
          <li key={topic} className="flex items-start gap-2 text-sm text-navy-600">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
            {topic}
          </li>
        ))}
      </ul>
    </div>
  )
}
