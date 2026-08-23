import Link from 'next/link'

const navItems = [
  { label: 'Overview', href: '/dashboard' },
  { label: 'My Learning', href: '/dashboard/my-learning' },
  { label: 'My Community', href: '/dashboard/my-community' },
  { label: 'My Bookings', href: '/dashboard/my-bookings' },
  { label: 'My Account', href: '/dashboard/my-account' },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="hidden w-64 shrink-0 border-r border-navy-100 bg-white p-6 lg:block">
        <Link href="/" className="font-heading text-lg font-bold text-navy">
          Salim Cyrus
        </Link>
        <nav className="mt-10 flex flex-col gap-1" aria-label="Dashboard">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-navy-600 hover:bg-navy-50 hover:text-navy"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 px-6 py-10 sm:px-10">{children}</main>
    </div>
  )
}
