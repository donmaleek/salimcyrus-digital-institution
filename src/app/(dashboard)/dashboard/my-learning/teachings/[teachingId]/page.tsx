import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Watch Teaching',
}

export default async function WatchTeachingPage({ params }: { params: { teachingId: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin === true
  if (!userId) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/dashboard/my-learning/teachings/${params.teachingId}`)}`)
  }

  const teaching = await db.teaching.findUnique({ where: { id: params.teachingId } })
  if (!teaching) notFound()

  if (!isAdmin) {
    const purchase = await db.teachingPurchase.findFirst({ where: { teachingId: teaching.id, userId } })
    if (!purchase) notFound()
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-500">{teaching.category}</p>
      <h1 className="mt-2 font-heading text-2xl font-bold text-navy">{teaching.title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-navy-500">{teaching.description}</p>

      <div className="mt-6 aspect-video w-full max-w-4xl overflow-hidden rounded-2xl bg-black">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          controls
          preload="metadata"
          className="h-full w-full"
          src={`/api/teachings/stream/${teaching.id}`}
        />
      </div>

      <p className="mt-6 text-sm text-navy-500">
        <Link href="/dashboard/my-learning" className="font-semibold text-navy underline">
          Back to My Learning
        </Link>
      </p>
    </div>
  )
}
