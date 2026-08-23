'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

export default function SiteError({
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
    <div className="mx-auto max-w-content px-6 py-24 text-center">
      <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
        Something Went Wrong
      </p>
      <h1 className="mt-4 font-heading text-3xl font-bold text-navy sm:text-4xl">
        We hit an unexpected error
      </h1>
      <p className="mx-auto mt-4 max-w-md text-navy-500">
        Please try again, or head back to the homepage.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button onClick={reset}>Try Again</Button>
        <Button href="/" variant="outline">
          Back to Home
        </Button>
      </div>
    </div>
  )
}
