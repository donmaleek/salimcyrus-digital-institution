import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin
  return isAdmin === true
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const questions = await db.askSalimQuestion.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json({ questions })
}
