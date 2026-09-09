import { NextRequest, NextResponse } from 'next/server'
import { requireCrmApi } from '@/services/crm/access'
import { db } from '@/lib/db'
import { saveTeachingThumbnail, saveTeachingPreview } from '@/services/teachings/teaching-assets'

/**
 * Lets an admin attach or replace a thumbnail and/or preview clip on a
 * teaching that already exists (and may already be published), separate
 * from the create-teaching route: the original upload flow only ever set
 * these at creation time, so a teaching published before this field
 * existed, or one whose admin skipped the thumbnail/preview at upload
 * time, had no way to ever get one afterward.
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireCrmApi('content:write'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const teaching = await db.teaching.findUnique({ where: { id: params.id } })
  if (!teaching) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const form = await request.formData().catch(() => null)
  if (!form) {
    return NextResponse.json({ error: 'Invalid form submission.' }, { status: 400 })
  }

  const thumbnailFile = form.get('thumbnail')
  const previewFile = form.get('preview')
  const hasThumbnail = thumbnailFile instanceof File && thumbnailFile.size > 0
  const hasPreview = previewFile instanceof File && previewFile.size > 0
  if (!hasThumbnail && !hasPreview) {
    return NextResponse.json({ error: 'Attach a thumbnail and/or a preview clip.' }, { status: 400 })
  }

  const data: { thumbnailPath?: string; previewFileName?: string } = {}

  if (hasThumbnail) {
    const result = await saveTeachingThumbnail(teaching.slug, thumbnailFile as File)
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })
    data.thumbnailPath = result.value
  }

  if (hasPreview) {
    const result = await saveTeachingPreview(teaching.slug, previewFile as File)
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })
    data.previewFileName = result.value
  }

  const updated = await db.teaching.update({ where: { id: teaching.id }, data })
  return NextResponse.json({ teaching: updated })
}
