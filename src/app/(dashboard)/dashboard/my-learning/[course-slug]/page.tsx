import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Course Progress',
}

export default function CourseProgressPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">Course Progress</h1>
      <div className="mt-8 rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center">
        <p className="text-navy-400">
          Course progress will appear here once your enrollment is connected to your account.
        </p>
        <Button href="/academy/masterclasses" className="mt-6">
          Browse Programs
        </Button>
      </div>
    </div>
  )
}
