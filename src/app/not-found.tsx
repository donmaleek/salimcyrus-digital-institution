import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <Link href="/" className="font-heading text-xl font-bold text-navy">
        Salim Cyrus
      </Link>
      <p className="mt-8 font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
        404
      </p>
      <h1 className="mt-4 font-heading text-3xl font-bold text-navy sm:text-4xl">
        We Couldn&apos;t Find That Page
      </h1>
      <p className="mx-auto mt-4 max-w-md text-navy-500">
        It may have moved, or the link may be out of date.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-full bg-gold px-6 py-3 font-semibold text-navy-900 hover:bg-gold-300"
      >
        Back to Home
      </Link>
    </main>
  )
}
