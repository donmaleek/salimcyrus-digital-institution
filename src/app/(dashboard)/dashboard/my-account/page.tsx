import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AccountForm } from '@/components/forms/AccountForm'

export const metadata: Metadata = {
  title: 'My Account',
}

export default async function MyAccountPage() {
  const session = await getServerSession(authOptions)

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">My Account</h1>
      <div className="mt-8 max-w-md rounded-2xl border border-navy-100 bg-white p-8">
        <AccountForm
          initialName={session?.user?.name ?? ''}
          email={session?.user?.email ?? ''}
        />
      </div>
    </div>
  )
}
