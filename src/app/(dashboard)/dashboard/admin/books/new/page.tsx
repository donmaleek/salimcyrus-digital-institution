import type { Metadata } from 'next'
import { BookUploadForm } from '@/components/dashboard/BookUploadForm'
import { requireCrmPage } from '@/services/crm/access'

export const metadata: Metadata = {
  title: 'Upload a Book',
}

export default async function NewBookPage() {
  await requireCrmPage('content:write')

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-500">Books</p>
      <h1 className="mt-2 font-heading text-3xl font-bold text-navy">Upload a new book</h1>
      <p className="mt-2 max-w-2xl text-sm text-navy-500">
        Save as a draft to come back to it later, or publish straight to the Books catalog. The PDF you attach
        here is exactly what buyers download after payment.
      </p>
      <div className="mt-8">
        <BookUploadForm />
      </div>
    </div>
  )
}
