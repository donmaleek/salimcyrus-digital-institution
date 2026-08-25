import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireCrmApi } from '@/services/crm/access'

export async function GET() {
  if (!(await requireCrmApi('content:write'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const questions = await db.askSalimQuestion.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json({ questions })
}
