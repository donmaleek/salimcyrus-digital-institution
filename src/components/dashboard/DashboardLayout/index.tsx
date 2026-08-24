import Link from 'next/link'
import { SignOutButton } from '@/components/dashboard/SignOutButton'

const navItems = [
  { label: 'Overview', href: '/dashboard' },
  { label: 'My Learning', href: '/dashboard/my-learning' },
  { label: 'My Community', href: '/dashboard/my-community' },
  { label: 'My Bookings', href: '/dashboard/my-bookings' },
  { label: 'My Account', href: '/dashboard/my-account' },
]

interface DashboardLayoutProps {
  children: React.ReactNode
  userName?: string | null
  isAdmin?: boolean
}

export function DashboardLayout({ children, userName, isAdmin }: DashboardLayoutProps) {
  const items = isAdmin
    ? [
        ...navItems,
        { label: 'Journal (Admin)', href: '/dashboard/admin/journal' },
        { label: 'Availability (Admin)', href: '/dashboard/admin/availability' },
      ]
    : navItems

  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="hidden w-64 shrink-0 border-r border-navy-100 bg-white p-6 lg:block">
        <Link href="/" className="font-heading text-lg font-bold text-navy">
          Salim Cyrus
        </Link>
        <nav className="mt-10 flex flex-col gap-1" aria-label="Dashboard">
          {items.map((item) => (
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
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-navy-100 bg-white px-6 py-4 sm:px-10">
          <p className="text-sm text-navy-500">
            {userName ? `Signed in as ${userName}` : ''}
          </p>
          <SignOutButton />
        </header>
        <main className="px-6 py-10 sm:px-10">{children}</main>
      </div>
    </div>
  )
}
