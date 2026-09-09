import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { validateProfileImage } from '@/services/account/profile-image'

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { profileImageData: true, profileImageMime: true },
  })
  if (!user?.profileImageData || !user.profileImageMime) {
    return NextResponse.json({ error: 'No profile image' }, { status: 404 })
  }
  return new NextResponse(user.profileImageData, {
    headers: { 'Content-Type': user.profileImageMime, 'Cache-Control': 'private, no-store' },
  })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const form = await request.formData()
  const image = form.get('image')
  if (!(image instanceof File)) {
    return NextResponse.json({ error: 'Choose an image to upload.' }, { status: 400 })
  }
  const bytes = new Uint8Array(await image.arrayBuffer())
  const validationError = validateProfileImage(image.type, bytes)
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })
  await db.user.update({
    where: { id: userId },
    data: { profileImageData: Buffer.from(bytes), profileImageMime: image.type },
  })
  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  await db.user.update({
    where: { id: userId },
    data: { profileImageData: null, profileImageMime: null },
  })
  return NextResponse.json({ ok: true })
}
