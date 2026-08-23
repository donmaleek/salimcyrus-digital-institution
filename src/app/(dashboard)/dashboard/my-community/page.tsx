import { Button } from '@/components/ui/Button'

export default function MyCommunityPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">My Community</h1>
      <div className="mt-8 rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center">
        <p className="text-navy-400">Join the Hekima Inner Circle to unlock community access.</p>
        <Button href="/academy/masterclasses" className="mt-6">
          View Membership
        </Button>
      </div>
    </div>
  )
}
