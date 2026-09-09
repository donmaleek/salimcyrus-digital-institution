import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { TeachingAssetsForm } from '@/components/dashboard/TeachingAssetsForm'
import { requireCrmPage } from '@/services/crm/access'

export const metadata: Metadata = {
  title: 'Edit Teaching Media',
}

export default async function EditTeachingAssetsPage({ params }: { params: { id: string } }) {
  await requireCrmPage('content:write')

  const teaching = await db.teaching.findUnique({ where: { id: params.id } })
  if (!teaching) notFound()

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-500">Teaching Library</p>
      <h1 className="mt-2 font-heading text-3xl font-bold text-navy">Edit thumbnail and preview clip</h1>
      <p className="mt-2 max-w-2xl text-sm text-navy-500">
        Add or replace this teaching&apos;s thumbnail and hover-preview clip. Everything else about the teaching
        stays as it is.
      </p>
      <div className="mt-8">
        <TeachingAssetsForm
          teachingId={teaching.id}
          title={teaching.title}
          currentThumbnail={teaching.thumbnailPath}
          hasPreview={Boolean(teaching.previewFileName)}
        />
      </div>
    </div>
  )
}
