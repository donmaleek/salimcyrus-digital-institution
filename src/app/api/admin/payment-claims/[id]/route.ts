import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireCrmApi } from '@/services/crm/access'
import { approvePaymentClaim, rejectPaymentClaim } from '@/services/payments/payment-claims'

const reviewSchema = z.object({
  action: z.enum(['approve', 'reject']),
  notes: z.string().trim().max(2000).optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const principal = await requireCrmApi('finance:write')
  if (!principal || !principal.email) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const parsed = reviewSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const result =
    parsed.data.action === 'approve'
      ? await approvePaymentClaim(params.id, principal.email)
      : await rejectPaymentClaim(params.id, principal.email, parsed.data.notes)

  if (result.status === 'not_found') {
    return NextResponse.json({ error: 'Claim not found.' }, { status: 404 })
  }
  if (result.status === 'already_reviewed') {
    return NextResponse.json({ error: 'This claim has already been reviewed.' }, { status: 409 })
  }
  if (result.status === 'offer_missing') {
    return NextResponse.json({ error: 'The book or teaching this claim refers to no longer exists.' }, { status: 404 })
  }

  return NextResponse.json({ status: result.status })
}
