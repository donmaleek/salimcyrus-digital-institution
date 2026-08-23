import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Booking Confirmation',
}

export default function BookingConfirmationPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">Booking Confirmation</h1>
      <div className="mt-8 rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center">
        <p className="text-navy-400">
          Booking details will appear here once bookings are connected to your account.
        </p>
        <Button href="/work-with-salim/coaching" className="mt-6">
          Book a Session
        </Button>
      </div>
    </div>
  )
}
