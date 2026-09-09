import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { validateNewPassword } from '@/services/account/password'

const bodySchema = z.object({ currentPassword: z.string(), newPassword: z.string() })

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const parsed = bodySchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  const validationError = validateNewPassword(parsed.data.currentPassword, parsed.data.newPassword)
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })

  const user = await db.user.findUnique({ where: { id: userId }, select: { passwordHash: true } })
  if (!user || !(await bcrypt.compare(parsed.data.currentPassword, user.passwordHash))) {
    return NextResponse.json({ error: 'Your current password is incorrect.' }, { status: 400 })
  }
  await db.user.update({
    where: { id: userId },
    data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 12) },
  })
  return NextResponse.json({ ok: true })
}
