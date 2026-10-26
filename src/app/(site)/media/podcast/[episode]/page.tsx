import type { Metadata } from 'next'
import { NotPublished } from '@/components/sections/shared/NotPublished'

interface PageProps {
  params: Promise<{ episode: string }>
}

export const metadata: Metadata = {
  title: 'Episode',
  robots: { index: false, follow: false },
}

export default async function PodcastEpisodePage(props: PageProps) {
  const params = await props.params;
  return (
    <NotPublished
      label="Episode"
      slug={params.episode}
      backHref="/media/podcast"
      backLabel="Back to Podcast"
    />
  )
}
