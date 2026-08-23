import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'

export const metadata: Metadata = {
  title: 'Videos',
  description: 'Video teachings and masterclass clips from Salim Cyrus.',
}

export default function VideosPage() {
  return (
    <>
      <PageHero
        eyebrow="Videos"
        title="Video Teachings"
        description="Keynotes, interviews, and focused teachings for people ready to think and live differently."
      />
      <section className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-20">
          <div className="mt-14 rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center">
            <p className="text-navy-400">
              Video library is in production and will be embedded here.
            </p>
            <Button href="/contact" variant="outline" className="mt-6">
              Get Notified
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
