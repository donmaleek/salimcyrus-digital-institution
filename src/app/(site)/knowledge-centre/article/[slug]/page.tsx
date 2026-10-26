import type { Metadata } from 'next'
import { NotPublished } from '@/components/sections/shared/NotPublished'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  title: 'Article',
  robots: { index: false, follow: false },
}

export default async function ArticlePage(props: PageProps) {
  const params = await props.params;
  return (
    <NotPublished
      label="Article"
      slug={params.slug}
      backHref="/knowledge-centre"
      backLabel="Back to Knowledge Centre"
    />
  )
}
