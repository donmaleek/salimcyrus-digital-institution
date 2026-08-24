import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { generateResetToken, hashResetToken } from '@/lib/auth/reset-token'

const requestSchema = z.object({ email: z.string().email() })

const TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hour

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = requestSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } })

  // Always respond the same way whether or not the account exists, so this
  // endpoint can't be used to check which emails are registered.
  if (user) {
    const rawToken = generateResetToken()
    const tokenHash = hashResetToken(rawToken)

    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      },
    })

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`

    // No transactional email service is connected yet (see README). Until
    // one is, the reset link is logged here so the site owner can relay it
    // to the requester manually. The raw token is never returned in the
    // API response — only ever available server-side.
    console.log(`[password reset] ${user.email} -> ${resetUrl} (expires in 1 hour)`)
  }

  return NextResponse.json({ status: 'ok' })
}
