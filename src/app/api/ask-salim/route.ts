import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const submitSchema = z.object({
  category: z.string().min(1),
  question: z.string().min(20).max(1000),
  context: z.string().max(600).optional(),
  askerName: z.string().max(80).optional(),
  askerEmail: z.string().email().optional().or(z.literal('')),
  publicationPreference: z.enum(['first_name', 'anonymous', 'private']).default('anonymous'),
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = submitSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { askerEmail, ...rest } = parsed.data

  const submission = await db.askSalimQuestion.create({
    data: { ...rest, askerEmail: askerEmail || undefined },
  })

  return NextResponse.json({ id: submission.id }, { status: 201 })
}
