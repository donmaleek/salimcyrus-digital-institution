import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Videos',
  description: 'Video teachings and masterclass clips from Salim Cyrus.',
}

export default function VideosPage() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-content px-6 py-20">
        <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
          Videos
        </p>
        <h1 className="mt-4 font-heading text-4xl font-bold text-navy sm:text-5xl">
          Video Teachings
        </h1>
        <div className="mt-14 rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center">
          <p className="text-navy-400">Video library is in production and will be embedded here.</p>
          <Button href="/contact" variant="outline" className="mt-6">
            Get Notified
          </Button>
        </div>
      </div>
    </section>
  )
}
