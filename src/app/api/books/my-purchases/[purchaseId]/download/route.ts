import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { createDownloadGrant, downloadUrlFor } from '@/services/payments/book-purchases'

/**
 * Mints a fresh download grant for a purchase the caller actually owns.
 * A purchase belongs to the account forever (this is what you bought, not a
 * one-time email link) — the 5-download/30-day cap on each grant exists to
 * limit any single leaked link, not to cap how many times the owner can
 * come back to My Books and get a working link again.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: { purchaseId: string } }
) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) {
    return NextResponse.json({ error: 'Sign in to download your books.' }, { status: 401 })
  }

  const purchase = await db.bookPurchase.findUnique({ where: { id: params.purchaseId } })
  if (!purchase || purchase.userId !== userId) {
    return NextResponse.json({ error: 'Purchase not found.' }, { status: 404 })
  }

  const { rawToken } = await createDownloadGrant(purchase.id)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? _request.nextUrl.origin
  const downloadUrl = downloadUrlFor(rawToken, siteUrl)

  return NextResponse.json({ downloadUrl })
}
