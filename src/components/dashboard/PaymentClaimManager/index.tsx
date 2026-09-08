'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/formatting'

interface ClaimSummary {
  id: string
  offerType: string
  offerTitle: string
  email: string
  name: string
  amountKes: number
  mpesaCode: string
  hasEvidence: boolean
  status: string
  createdAt: string
}

export function PaymentClaimManager({ initialClaims }: { initialClaims: ClaimSummary[] }) {
  const [claims, setClaims] = useState(initialClaims)
  const [busyId, setBusyId] = useState<string | null>(null)
  const { showToast } = useToast()

  async function review(claim: ClaimSummary, action: 'approve' | 'reject') {
    if (action === 'reject' && !confirm(`Reject the ${formatCurrency(claim.amountKes)} claim from ${claim.name}?`)) {
      return
    }
    setBusyId(claim.id)

    const res = await fetch(`/api/admin/payment-claims/${claim.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })

    setBusyId(null)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      showToast(typeof body.error === 'string' ? body.error : 'Could not update this claim.', 'error')
      return
    }

    setClaims((prev) => prev.map((c) => (c.id === claim.id ? { ...c, status: action === 'approve' ? 'approved' : 'rejected' } : c)))
    showToast(action === 'approve' ? 'Approved, purchase recorded.' : 'Rejected.')
  }

  const pending = claims.filter((c) => c.status === 'pending')
  const reviewed = claims.filter((c) => c.status !== 'pending')

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ['Pending', pending.length],
          ['Approved', claims.filter((c) => c.status === 'approved').length],
          ['Rejected', claims.filter((c) => c.status === 'rejected').length],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-navy-400">{label}</p>
            <p className="mt-2 font-heading text-3xl font-bold text-navy">{value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-heading text-lg font-bold text-navy">Awaiting review</h2>
        {pending.length === 0 ? (
          <p className="mt-3 text-sm text-navy-400">No pending Paybill claims.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {pending.map((claim) => (
              <div key={claim.id} data-testid={`payment-claim-${claim.id}`} className="rounded-2xl border border-gold/40 bg-gold-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-navy">
                      {claim.offerTitle}{' '}
                      <span className="text-xs font-bold uppercase tracking-wide text-navy-400">
                        ({claim.offerType})
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-navy-600">
                      {claim.name} &middot; {claim.email}
                    </p>
                    <p className="mt-1 text-sm text-navy-600">
                      Claims to have paid <span className="font-semibold">{formatCurrency(claim.amountKes)}</span>{' '}
                      via code <span className="font-mono font-semibold">{claim.mpesaCode}</span>
                    </p>
                    <p className="mt-1 text-xs text-navy-400">Submitted {formatDate(new Date(claim.createdAt))}</p>
                    {claim.hasEvidence && (
                      <a
                        href={`/api/admin/payment-claims/${claim.id}/evidence`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-sm font-semibold text-navy underline"
                      >
                        View screenshot
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" disabled={busyId === claim.id} onClick={() => review(claim, 'approve')}>
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === claim.id}
                      onClick={() => review(claim, 'reject')}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {reviewed.length > 0 && (
        <div>
          <h2 className="font-heading text-lg font-bold text-navy">Reviewed</h2>
          <div className="mt-4 space-y-2">
            {reviewed.map((claim) => (
              <div
                key={claim.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy-100 bg-white p-4 text-sm"
              >
                <p className="text-navy">
                  {claim.offerTitle} &middot; {claim.name} &middot; {formatCurrency(claim.amountKes)} &middot;{' '}
                  <span className="font-mono">{claim.mpesaCode}</span>
                </p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${
                    claim.status === 'approved' ? 'bg-gold/20 text-gold-500' : 'bg-red-50 text-red-700'
                  }`}
                >
                  {claim.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
