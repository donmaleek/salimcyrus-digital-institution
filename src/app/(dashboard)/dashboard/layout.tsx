import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { db } from '@/lib/db'

export default async function DashboardRouteLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const isAdmin = (session.user as { isAdmin?: boolean } | undefined)?.isAdmin === true
  const rawCrmRole = (session.user as { crmRole?: string } | undefined)?.crmRole
  const crmRole = isAdmin && (!rawCrmRole || rawCrmRole === 'customer') ? 'owner' : rawCrmRole
  const userId = (session.user as { id?: string } | undefined)?.id
  const profile = userId ? await db.user.findUnique({ where: { id: userId }, select: { profileImageData: true } }) : null

  return (
    <DashboardLayout userName={session.user?.name} userEmail={session.user?.email} hasProfileImage={Boolean(profile?.profileImageData)} isAdmin={isAdmin} crmRole={crmRole}>
      {children}
    </DashboardLayout>
  )
}
