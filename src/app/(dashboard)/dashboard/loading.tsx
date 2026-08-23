export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 rounded bg-navy-100" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-navy-100" />
        ))}
      </div>
    </div>
  )
}
