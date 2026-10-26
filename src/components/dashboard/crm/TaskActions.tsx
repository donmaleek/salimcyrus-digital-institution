'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
export function CompleteTask({ id }: { id: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        disabled={busy}
        onClick={async () => {
          setBusy(true)
          setError('')
          const response = await fetch('/api/admin/crm/tasks', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id,
              status: 'completed',
              completionNote: 'Completed from task workspace',
            }),
          }).catch(() => null)
          setBusy(false)
          if (!response || !response.ok) {
            setError('Could not complete this task. Try again.')
            return
          }
          router.refresh()
        }}
        className="rounded-full border border-navy-200 px-3 py-1 text-xs font-bold text-navy hover:border-gold disabled:opacity-60"
      >
        {busy ? 'Saving…' : 'Complete'}
      </button>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  )
}
