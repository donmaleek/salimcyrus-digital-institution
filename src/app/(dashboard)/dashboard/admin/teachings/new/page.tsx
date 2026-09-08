import type { Metadata } from 'next'
import { TeachingUploadForm } from '@/components/dashboard/TeachingUploadForm'
import { requireCrmPage } from '@/services/crm/access'

export const metadata: Metadata = {
  title: 'Upload a Teaching',
}

export default async function NewTeachingPage() {
  await requireCrmPage('content:write')

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-500">The Teaching Library</p>
      <h1 className="mt-2 font-heading text-3xl font-bold text-navy">Upload a new teaching</h1>
      <p className="mt-2 max-w-2xl text-sm text-navy-500">
        Save as a draft to come back to it later, or publish straight to the Teaching Library.
      </p>
      <div className="mt-8">
        <TeachingUploadForm />
      </div>
    </div>
  )
}
