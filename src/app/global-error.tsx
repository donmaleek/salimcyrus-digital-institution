'use client'

import { useEffect } from 'react'

export default function GlobalError({
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
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-cream px-6 text-center">
        <div>
          <h1 className="font-heading text-3xl font-bold text-navy">Something went wrong</h1>
          <p className="mt-4 text-navy-500">Please refresh the page or try again shortly.</p>
          <button
            onClick={reset}
            className="mt-8 rounded-full bg-gold px-6 py-3 font-semibold text-navy-900"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  )
}
