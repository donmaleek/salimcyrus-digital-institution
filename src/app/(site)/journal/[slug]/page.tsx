import type { Metadata } from 'next'
import { NotPublished } from '@/components/sections/shared/NotPublished'

interface PageProps {
  params: { slug: string }
}

export const metadata: Metadata = {
  title: 'Journal',
}

export default function JournalEntryPage({ params }: PageProps) {
  return (
    <NotPublished
      label="Entry"
      slug={params.slug}
      backHref="/journal"
      backLabel="Back to Journal"
    />
  )
}
