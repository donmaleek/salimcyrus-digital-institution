import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'My Bookings',
}

export default function MyBookingsPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">My Bookings</h1>
      <div className="mt-8 rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center">
        <p className="text-navy-400">You have no upcoming coaching sessions.</p>
        <Button href="/work-with-salim/coaching" className="mt-6">
          Book a Session
        </Button>
      </div>
    </div>
  )
}
