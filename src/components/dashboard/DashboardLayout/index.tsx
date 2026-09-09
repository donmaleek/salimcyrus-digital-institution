'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { SignOutButton } from '@/components/dashboard/SignOutButton'
import { CrmGlobalSearch } from '@/components/dashboard/crm/GlobalSearch'

const memberNav = [
  { label: 'Overview', shortLabel: 'Home', href: '/dashboard', icon: 'home' },
  { label: 'My Books', shortLabel: 'Books', href: '/dashboard/my-books', icon: 'book' },
  { label: 'My Learning', shortLabel: 'Learn', href: '/dashboard/my-learning', icon: 'play' },
  { label: 'My Community', shortLabel: 'Circle', href: '/dashboard/my-community', icon: 'people' },
  { label: 'My Bookings', shortLabel: 'Sessions', href: '/dashboard/my-bookings', icon: 'calendar' },
  { label: 'My Account', shortLabel: 'Account', href: '/dashboard/my-account', icon: 'user' },
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

function NavIcon({ name }: { name?: string }) {
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5M9 21v-7h6v7"/></>,
    book: <><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v16H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 4.5v16A1.5 1.5 0 0 0 5.5 22H20"/></>,
    play: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m10 9 5 3-5 3z"/></>,
    people: <><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 5.3a3 3 0 0 1 0 5.4M17 14c2.3.7 4 2.8 4 5.3"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4m8-4v4M3 10h18"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4 3.5-6 8-6s7.2 2 8 6"/></>,
  }
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name ?? 'home']}</svg>
}

function Initials({ name }: { name?: string | null }) {
  return <span>{(name || 'Member').split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span>
}

interface DashboardLayoutProps {
  children: React.ReactNode
  userName?: string | null
  userEmail?: string | null
  hasProfileImage?: boolean
  isAdmin?: boolean
  crmRole?: string
}

export function DashboardLayout({ children, userName, userEmail, hasProfileImage, isAdmin, crmRole }: DashboardLayoutProps) {
  const pathname = usePathname()
  const items = isAdmin
    ? [{ label: 'My Dashboard', href: '/dashboard' }, ...crmNav, { label: 'Journal', href: '/dashboard/admin/journal' }, { label: 'Books', href: '/dashboard/admin/books' }, { label: 'Teaching Library', href: '/dashboard/admin/teachings' }, { label: 'Payment Claims', href: '/dashboard/admin/payment-claims' }, { label: 'Ask Salim', href: '/dashboard/admin/ask-salim' }, { label: 'Availability', href: '/dashboard/admin/availability' }]
    : memberNav
  const active = (href: string) => pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`))

  return (
    <div className="min-h-screen bg-[#f7f5ef] lg:flex">
      <aside className="hidden w-[17.5rem] shrink-0 border-r border-white/10 bg-navy text-white lg:fixed lg:inset-y-0 lg:flex lg:flex-col">
        <div className="border-b border-white/10 px-7 py-7">
          <Link href="/" className="font-heading text-xl font-bold tracking-tight text-white">Salim Cyrus</Link>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-300">Private Client Portal</p>
        </div>
        {isAdmin && <p className="px-7 pt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-300">Business CRM · {crmRole || 'owner'}</p>}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6" aria-label="Dashboard">
          {items.map((item) => (
            <Link key={item.href} href={item.href} aria-current={active(item.href) ? 'page' : undefined} className={`flex min-h-11 items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-colors ${active(item.href) ? 'bg-gold text-navy shadow-[0_8px_24px_rgba(199,158,39,0.18)]' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
              {!isAdmin && <NavIcon name={'icon' in item ? String(item.icon) : undefined} />}{item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <Link href="/dashboard/my-account" className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-white/10">
            <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-gold/50 bg-white/10 text-xs font-bold text-gold-200">
              {hasProfileImage ? <Image src="/api/account/avatar" alt="" width={40} height={40} unoptimized className="h-full w-full object-cover" /> : <Initials name={userName} />}
            </span>
            <span className="min-w-0"><span className="block truncate text-sm font-semibold text-white">{userName || 'Member'}</span><span className="block truncate text-xs text-slate-400">{userEmail}</span></span>
          </Link>
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:ml-[17.5rem]">
        <header className="sticky top-0 z-30 flex h-[4.5rem] items-center justify-between border-b border-navy/10 bg-white/95 px-5 backdrop-blur sm:px-8 lg:px-10">
          <div className="flex items-center gap-3 lg:hidden"><Link href="/" className="font-heading text-lg font-bold text-navy">Salim Cyrus</Link><span className="hidden text-xs text-navy-400 sm:inline">Client Portal</span></div>
          <p className="hidden text-sm text-navy-500 lg:block">Private client workspace</p>
          <div className="ml-auto flex items-center gap-3">
            {isAdmin && <CrmGlobalSearch />}
            {!isAdmin && <Link href="/book-now" className="hidden min-h-11 items-center rounded-full bg-navy px-5 text-sm font-semibold text-white transition-colors hover:bg-navy-700 sm:inline-flex">Book a Session</Link>}
            <SignOutButton />
          </div>
        </header>
        {isAdmin && <nav className="flex gap-2 overflow-x-auto border-b border-navy-100 bg-white px-5 py-3 lg:hidden" aria-label="CRM navigation">{items.filter((item) => item.href !== '/dashboard').map((item) => <Link key={item.href} href={item.href} aria-current={active(item.href) ? 'page' : undefined} className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold ${active(item.href) ? 'bg-navy text-white' : 'bg-navy-50 text-navy'}`}>{item.label}</Link>)}</nav>}
        <main className="mx-auto w-full max-w-[92rem] px-5 py-7 pb-28 sm:px-8 sm:py-10 lg:px-10 lg:pb-12 xl:px-14">{children}</main>
      </div>

      {!isAdmin && <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-navy/10 bg-white/95 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-8px_24px_rgba(15,30,48,0.08)] backdrop-blur lg:hidden" aria-label="Dashboard mobile navigation">
        {memberNav.map((item) => <Link key={item.href} href={item.href} aria-current={active(item.href) ? 'page' : undefined} className={`flex min-h-[3.5rem] flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-semibold transition-colors ${active(item.href) ? 'text-gold-700' : 'text-navy-400'}`}><NavIcon name={item.icon} /><span>{item.shortLabel}</span></Link>)}
      </nav>}
    </div>
  )
}
