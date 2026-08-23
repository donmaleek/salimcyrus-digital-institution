import type { Metadata } from 'next'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'My Account',
}

export default function MyAccountPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">My Account</h1>
      <p className="mt-2 max-w-lg text-sm text-navy-400">
        Account management is not yet connected to a real user session — this form is
        UI-complete, pending backend wiring.
      </p>
      <div className="mt-8 max-w-md rounded-2xl border border-navy-100 bg-white p-8">
        <form className="grid gap-4">
          <Input label="Name" disabled placeholder="—" />
          <Input label="Email" type="email" disabled placeholder="—" />
          <Button type="button" disabled variant="outline" className="justify-self-start">
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  )
}
