import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'My Learning',
}

export default function MyLearningPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">My Learning</h1>
      <div className="mt-8 rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center">
        <p className="text-navy-400">You haven&apos;t enrolled in any programs yet.</p>
        <Button href="/academy/masterclasses" className="mt-6">
          Browse Programs
        </Button>
      </div>
    </div>
  )
}
