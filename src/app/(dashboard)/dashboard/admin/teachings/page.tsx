import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { TeachingManager } from '@/components/dashboard/TeachingManager'
import { requireCrmPage } from '@/services/crm/access'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Manage Teachings',
}

export default async function AdminTeachingsPage() {
  await requireCrmPage('content:write')

  const teachings = await db.teaching.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  })

  return (
    <div>
      <div className="rounded-3xl bg-navy px-6 py-8 text-white sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Content studio</p>
        <h1 className="mt-3 font-heading text-3xl font-bold">The Teaching Library</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
          Upload video teachings, price them, and control what buyers can see.
        </p>
      </div>
      <div className="mt-8">
        <TeachingManager
          initialTeachings={teachings.map((teaching) => ({
            id: teaching.id,
            slug: teaching.slug,
            title: teaching.title,
            category: teaching.category,
            status: teaching.status,
            priceKes: teaching.priceKes,
            thumbnailPath: teaching.thumbnailPath,
            updatedAt: teaching.updatedAt.toISOString(),
          }))}
        />
      </div>
    </div>
  )
}
