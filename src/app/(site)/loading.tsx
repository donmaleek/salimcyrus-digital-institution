export default function SiteLoading() {
  return (
    <div className="mx-auto max-w-content px-6 py-20">
      <div className="animate-pulse space-y-6">
        <div className="h-4 w-32 rounded bg-navy-100" />
        <div className="h-10 w-2/3 rounded bg-navy-100" />
        <div className="h-4 w-full max-w-xl rounded bg-navy-100" />
        <div className="h-4 w-full max-w-lg rounded bg-navy-100" />
      </div>
    </div>
  )
}
