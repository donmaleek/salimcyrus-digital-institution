'use client'
import { useRouter } from 'next/navigation'
export function CompleteTask({ id }: { id: string }) {
  const router = useRouter()
  return (
    <button
      onClick={async () => {
        await fetch('/api/admin/crm/tasks', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            status: 'completed',
            completionNote: 'Completed from task workspace',
          }),
        })
        router.refresh()
      }}
      className="rounded-full border border-navy-200 px-3 py-1 text-xs font-bold text-navy hover:border-gold"
    >
      Complete
    </button>
  )
}
