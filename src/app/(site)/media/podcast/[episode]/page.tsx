import type { Metadata } from 'next'
import { NotPublished } from '@/components/sections/shared/NotPublished'

interface PageProps {
  params: { episode: string }
}

export const metadata: Metadata = {
  title: 'Episode',
  robots: { index: false, follow: false },
}

export default function PodcastEpisodePage({ params }: PageProps) {
  return (
    <NotPublished
      label="Episode"
      slug={params.episode}
      backHref="/media/podcast"
      backLabel="Back to Podcast"
    />
  )
}
