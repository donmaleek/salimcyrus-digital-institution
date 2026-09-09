import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AccountForm } from '@/components/forms/AccountForm'
import { db } from '@/lib/db'

export const metadata: Metadata = {
  title: 'My Account',
}

export default async function MyAccountPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  const profile = userId ? await db.user.findUnique({ where: { id: userId }, select: { profileImageData: true } }) : null

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-700">Identity & security</p>
      <h1 className="mt-2 font-heading text-3xl font-bold text-navy sm:text-4xl">My Account</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-navy-500">Keep your client profile current and protect access to your private resources.</p>
      <div className="mt-8">
        <AccountForm
          initialName={session?.user?.name ?? ''}
          email={session?.user?.email ?? ''}
          hasProfileImage={Boolean(profile?.profileImageData)}
        />
      </div>
    </div>
  )
}
