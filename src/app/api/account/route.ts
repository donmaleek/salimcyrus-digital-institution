import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

const updateSchema = z.object({ name: z.string().trim().min(2).max(80) })

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id

  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const user = await db.user.update({
    where: { id: userId },
    data: { name: parsed.data.name },
    select: { id: true, name: true, email: true },
  })

  return NextResponse.json({ user })
}
