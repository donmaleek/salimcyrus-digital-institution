'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignOutButton } from '@/components/dashboard/SignOutButton'
import { CrmGlobalSearch } from '@/components/dashboard/crm/GlobalSearch'

const navItems = [
  { label: 'Overview', href: '/dashboard' },
  { label: 'My Books', href: '/dashboard/my-books' },
  { label: 'My Learning', href: '/dashboard/my-learning' },
  { label: 'My Community', href: '/dashboard/my-community' },
  { label: 'My Bookings', href: '/dashboard/my-bookings' },
  { label: 'My Account', href: '/dashboard/my-account' },
]

const crmNav = [
  { label: 'Command Center', href: '/dashboard/admin/crm' },
  { label: 'Relationships', href: '/dashboard/admin/crm/relationships' },
  { label: 'Pipeline', href: '/dashboard/admin/crm/pipeline' },
  { label: 'Tasks & Service', href: '/dashboard/admin/crm/tasks' },
  { label: 'Revenue', href: '/dashboard/admin/crm/revenue' },
  { label: 'Delivery', href: '/dashboard/admin/crm/delivery' },
  { label: 'Books & Orders', href: '/dashboard/admin/crm/books' },
  { label: 'Marketing', href: '/dashboard/admin/crm/marketing' },
  { label: 'Community & Impact', href: '/dashboard/admin/crm/community' },
  { label: 'Reports', href: '/dashboard/admin/crm/reports' },
]

interface DashboardLayoutProps {
  children: React.ReactNode
  userName?: string | null
  isAdmin?: boolean
  crmRole?: string
}

export function DashboardLayout({ children, userName, isAdmin, crmRole }: DashboardLayoutProps) {
  const pathname = usePathname()
  const items = isAdmin
    ? [
        { label: 'My Dashboard', href: '/dashboard' },
        ...crmNav,
        { label: 'Journal', href: '/dashboard/admin/journal' },
        { label: 'Ask Salim', href: '/dashboard/admin/ask-salim' },
        { label: 'Availability', href: '/dashboard/admin/availability' },
      ]
    : navItems

  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="hidden w-72 shrink-0 border-r border-navy-100 bg-navy p-6 text-white lg:block">
        <Link href="/" className="font-heading text-lg font-bold text-navy">
          <span className="text-white">Salim Cyrus</span>
        </Link>
        {isAdmin && <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-300">Business CRM · {crmRole || 'owner'}</p>}
        <nav className="mt-8 flex flex-col gap-1" aria-label="Dashboard">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`)) ? 'page' : undefined}
              className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`)) ? 'bg-gold text-navy shadow-sm' : 'text-navy-100 hover:bg-white/10 hover:text-white'}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-navy-100 bg-white px-5 py-4 sm:px-10">
          <p className="text-sm text-navy-500">
            {userName ? `Signed in as ${userName}` : ''}
          </p>
          {isAdmin && <CrmGlobalSearch />}
          <SignOutButton />
        </header>
        {isAdmin && (
          <nav className="flex gap-2 overflow-x-auto border-b border-navy-100 bg-white px-5 py-3 lg:hidden" aria-label="CRM navigation">
            {items.filter((item) => item.href !== '/dashboard').map((item) => <Link key={item.href} href={item.href} aria-current={pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'page' : undefined} className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'bg-navy text-white' : 'bg-navy-50 text-navy'}`}>{item.label}</Link>)}
          </nav>
        )}
        <main className="px-5 py-8 sm:px-8 xl:px-10">{children}</main>
      </div>
    </div>
  )
}
