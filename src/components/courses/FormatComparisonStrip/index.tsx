import Link from 'next/link'

const rows = [
  { label: 'What it is', course: 'A structured, multi-lesson curriculum', masterclass: 'A single focused session (or short arc) from one event' },
  { label: 'Pace', course: 'Self-paced, work through it over time', masterclass: 'Watch it in one sitting, like attending the real thing' },
  { label: 'Access', course: 'Lifetime, always in your library', masterclass: 'Usually a time-limited replay window, see each page for the exact length' },
  { label: 'Best for', course: 'Building a skill or working through a framework step by step', masterclass: 'One concentrated breakthrough on a specific topic' },
]

/** Shown on both catalogue pages so a visitor on either one sees the same
 * honest comparison, not two pages quietly making the same claims about
 * two differently-named products. */
export function FormatComparisonStrip({ current }: { current: 'course' | 'masterclass' }) {
  return (
    <div className="mt-10 overflow-hidden rounded-2xl border border-navy-100 bg-white">
      <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-navy-100 bg-navy-50 text-xs font-bold uppercase tracking-wide text-navy-500">
        <div className="px-4 py-3" />
        <div className={`px-4 py-3 ${current === 'course' ? 'text-gold-700' : ''}`}>Course</div>
        <div className={`px-4 py-3 ${current === 'masterclass' ? 'text-gold-700' : ''}`}>Masterclass</div>
      </div>
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[1fr_1fr_1fr] border-b border-navy-50 text-sm last:border-0">
          <div className="px-4 py-3 font-semibold text-navy">{row.label}</div>
          <div className={`px-4 py-3 text-navy-600 ${current === 'course' ? 'bg-gold-50/40' : ''}`}>{row.course}</div>
          <div className={`px-4 py-3 text-navy-600 ${current === 'masterclass' ? 'bg-gold-50/40' : ''}`}>{row.masterclass}</div>
        </div>
      ))}
      <p className="border-t border-navy-100 px-4 py-3 text-xs text-navy-400">
        Looking for the other format?{' '}
        <Link href={current === 'course' ? '/academy/masterclasses' : '/academy/courses'} className="font-semibold text-gold-700 underline">
          {current === 'course' ? 'Browse masterclasses' : 'Browse courses'}
        </Link>
      </p>
    </div>
  )
}
