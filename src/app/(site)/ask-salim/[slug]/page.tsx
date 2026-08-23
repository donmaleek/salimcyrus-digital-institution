import type { Metadata } from 'next'
import { NotPublished } from '@/components/sections/shared/NotPublished'

interface PageProps {
  params: { slug: string }
}

export const metadata: Metadata = {
  title: 'Ask Salim',
}

export default function AskSalimAnswerPage({ params }: PageProps) {
  return (
    <NotPublished
      label="Answer"
      slug={params.slug}
      backHref="/ask-salim"
      backLabel="Back to Ask Salim"
    />
  )
}
