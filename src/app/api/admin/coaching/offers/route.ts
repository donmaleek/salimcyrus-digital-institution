import { NextResponse } from 'next/server'
import { requireCrmApi } from '@/services/crm/access'
import { getCoachingOffers } from '@/lib/data/coaching-catalog'

export async function GET() {
  if (!(await requireCrmApi('content:write'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const offers = await getCoachingOffers()
  return NextResponse.json({ offers })
}
