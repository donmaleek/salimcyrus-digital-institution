const benefits = [
  {
    title: 'Member Dashboard',
    description: 'Current subscription, upcoming sessions, and recommended resources.',
  },
  {
    title: 'Masterclass Library',
    description: 'Organized by Relationships, Purpose, Manhood, Kingdom, Leadership, and Marketplace.',
  },
  {
    title: 'Live Sessions',
    description: 'Calendar, registration, and replay access.',
  },
  {
    title: 'Private Community',
    description: 'Discussions, questions, accountability, and networking.',
  },
  {
    title: 'Member Resources',
    description: 'Worksheets, guides, assessments, frameworks, and downloads.',
  },
  {
    title: 'Coaching Room',
    description: 'Booking or group-coaching access according to membership tier.',
  },
  {
    title: 'Progress Area',
    description: 'Challenges, goals, reflections, and completion history.',
  },
  {
    title: 'Upgrade Path',
    description: 'Clear options to move from basic membership into coaching or premium mentorship.',
  },
]

/**
 * Shown alongside register/login when the buyer is headed toward a book
 * purchase, not because these features exist today (see docs/ — only book
 * purchases and one-off coaching bookings are real right now) but because
 * an account is the foundation the fuller membership experience will build
 * on. Every item is explicitly "coming soon" so a new member never expects
 * a live masterclass library or community that isn't there yet.
 */
export function MemberBenefitsPanel() {
  return (
    <div className="rounded-2xl border border-gold/30 bg-navy-700 p-6">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
        Coming to your member dashboard
      </p>
      <p className="mt-2 text-sm text-cream/70">
        Your account is the foundation for what&apos;s next. These are rolling out over
        the coming months.
      </p>
      <ul className="mt-6 space-y-4">
        {benefits.map((benefit) => (
          <li key={benefit.title} className="flex gap-3">
            <span aria-hidden="true" className="mt-1 text-gold">
              &#10003;
            </span>
            <div>
              <p className="font-heading text-sm font-bold text-cream">{benefit.title}</p>
              <p className="mt-0.5 text-sm text-cream/60">{benefit.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
