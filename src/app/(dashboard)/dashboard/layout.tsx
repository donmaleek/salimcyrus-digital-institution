import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

export default async function DashboardRouteLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const isAdmin = (session.user as { isAdmin?: boolean } | undefined)?.isAdmin === true
  const rawCrmRole = (session.user as { crmRole?: string } | undefined)?.crmRole
  const crmRole = isAdmin && (!rawCrmRole || rawCrmRole === 'customer') ? 'owner' : rawCrmRole

  return (
    <DashboardLayout userName={session.user?.name} isAdmin={isAdmin} crmRole={crmRole}>
      {children}
    </DashboardLayout>
  )
}
