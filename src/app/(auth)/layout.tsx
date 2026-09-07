import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy px-6 py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 top-1/3 h-[560px] w-[560px] -translate-y-1/2 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute -left-24 bottom-1/4 h-[360px] w-[360px] rounded-full bg-gold/10 blur-3xl" />
      </div>
      <div className="relative w-full max-w-4xl">
        <Link href="/" className="font-signature text-4xl leading-none text-gold">
          Salim Cyrus
        </Link>
        {children}
      </div>
    </div>
  )
}
