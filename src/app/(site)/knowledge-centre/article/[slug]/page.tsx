import type { Metadata } from 'next'
import { NotPublished } from '@/components/sections/shared/NotPublished'

interface PageProps {
  params: { slug: string }
}

export const metadata: Metadata = {
  title: 'Article',
}

export default function ArticlePage({ params }: PageProps) {
  return (
    <NotPublished
      label="Article"
      slug={params.slug}
      backHref="/knowledge-centre"
      backLabel="Back to Knowledge Centre"
    />
  )
}
