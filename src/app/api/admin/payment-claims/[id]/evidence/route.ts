import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { requireCrmApi } from '@/services/crm/access'
import { db } from '@/lib/db'
import { evidenceFilePath, evidenceFileExists } from '@/lib/api/payment-evidence-storage'

function contentTypeFor(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (ext === 'png') return 'image/png'
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
  return 'image/webp'
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  if (!(await requireCrmApi('finance:read'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const claim = await db.paymentClaim.findUnique({ where: { id: params.id } })
  if (!claim || !claim.evidenceFileName) {
    return NextResponse.json({ error: 'No evidence attached to this claim.' }, { status: 404 })
  }
  if (!evidenceFileExists(claim.evidenceFileName)) {
    return NextResponse.json({ error: 'Evidence file is missing on disk.' }, { status: 503 })
  }

  const buffer = readFileSync(evidenceFilePath(claim.evidenceFileName))
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentTypeFor(claim.evidenceFileName),
      'Content-Length': String(buffer.length),
      'Cache-Control': 'private, no-store',
    },
  })
}
