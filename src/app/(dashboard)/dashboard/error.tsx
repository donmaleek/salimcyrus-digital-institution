'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center">
      <p className="text-navy-500">Something went wrong loading this page.</p>
      <Button onClick={reset} variant="outline" className="mt-6">
        Try Again
      </Button>
    </div>
  )
}
