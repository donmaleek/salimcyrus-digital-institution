export default function DashboardOverviewPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">Welcome Back</h1>
      <p className="mt-2 text-navy-500">
        Your learning, bookings, and community activity will appear here once you&apos;re signed
        in.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {['Active Programs', 'Upcoming Sessions', 'Community Activity'].map((label) => (
          <div key={label} className="rounded-2xl border border-navy-100 bg-white p-6">
            <p className="text-3xl font-bold text-navy-300">—</p>
            <p className="mt-2 text-sm text-navy-500">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
