import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { normalizeEmail } from '@/services/crm/normalization'

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

  const submission = await db.$transaction(async (tx) => {
    const created = await tx.askSalimQuestion.create({ data: { ...rest, askerEmail: askerEmail || undefined } })
    if (askerEmail) {
      const email = normalizeEmail(askerEmail)!
      let contact = await tx.crmContact.findFirst({ where: { normalizedEmail: email, deletedAt: null } })
      if (!contact) {
        const parts = (rest.askerName || email.split('@')[0]).trim().split(/\s+/)
        contact = await tx.crmContact.create({ data: { firstName: parts[0], lastName: parts.slice(1).join(' ') || null, displayName: parts.join(' '), primaryEmail: askerEmail, normalizedEmail: email, lifecycleStage: 'audience', relationshipTypes: ['audience'], source: 'ask-salim' } })
      }
      await tx.crmActivity.create({ data: { contactId: contact.id, type: 'question', direction: 'inbound', subject: `Ask Salim: ${rest.category}`, body: rest.question, channel: 'website', metadata: { questionId: created.id, publicationPreference: rest.publicationPreference } } })
      await tx.crmTask.create({ data: { title: `Review Ask Salim question from ${contact.displayName}`, dueAt: new Date(Date.now() + 48 * 60 * 60 * 1000), contactId: contact.id, priority: rest.publicationPreference === 'private' ? 'high' : 'normal' } })
    }
    return created
  })

  return NextResponse.json({ id: submission.id }, { status: 201 })
}
