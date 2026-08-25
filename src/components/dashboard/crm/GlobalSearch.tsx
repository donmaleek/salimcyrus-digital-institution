'use client'
import { useEffect, useState } from 'react'

interface Result {
  id: string
  displayName: string
  primaryEmail: string | null
  primaryPhone: string | null
  lifecycleStage: string
}
export function CrmGlobalSearch() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([])
      return
    }
    const timer = setTimeout(async () => {
      const response = await fetch(
        `/api/admin/crm/contacts?q=${encodeURIComponent(q)}`
      )
      if (response.ok) {
        const body = await response.json()
        setResults(body.data.slice(0, 8))
        setOpen(true)
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [q])
  return (
    <div className="relative hidden w-full max-w-sm md:block">
      <label className="sr-only" htmlFor="crm-global-search">
        Search relationships
      </label>
      <input
        id="crm-global-search"
        value={q}
        onChange={(event) => setQ(event.target.value)}
        onFocus={() => results.length && setOpen(true)}
        placeholder="Search people, email or phone…"
        className="w-full rounded-full border border-navy-100 bg-navy-50 px-4 py-2 text-sm text-navy outline-none focus:border-gold focus:bg-white"
      />
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-12 z-40 rounded-2xl border border-navy-100 bg-white p-2 shadow-xl">
          {results.map((result) => (
            <a
              key={result.id}
              href="/dashboard/admin/crm/relationships"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 hover:bg-cream"
            >
              <p className="text-sm font-bold text-navy">
                {result.displayName}
              </p>
              <p className="text-xs text-navy-400">
                {result.primaryEmail ||
                  result.primaryPhone ||
                  result.lifecycleStage}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
