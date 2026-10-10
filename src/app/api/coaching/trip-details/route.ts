import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { contactDisplayName, normalizeEmail, normalizePhone } from '@/services/crm/normalization'
import { getCoachingOfferByName } from '@/lib/data/coaching-catalog'

/**
 * Logistics intake for a coaching offer that requires travel (currently
 * Individual/Couples Coaching, Your Location (Kenya, Outside Mombasa), see
 * CoachingOffer.requiresTripDetails): county/town, preferred date and
 * time, and who's attending, captured before the buyer moves on to
 * payment so Salim's team can arrange transport and, where needed,
 * accommodation ahead of the session. This never grants or blocks access
 * to anything: payment still goes through the normal checkout/Paybill
 * flow independently; this is a CRM lead/task so the trip gets planned,
 * mirroring /api/coaching/request-quote's capture shape.
 */
const tripDetailsSchema = z.object({
  offerName: z.string().trim().min(1).max(200),
  name: z.string().trim().min(2).max(200),
  phone: z.string().trim().min(7).max(40),
  email: z.string().email(),
  location: z.string().trim().min(2).max(200),
  preferredDate: z.string().trim().min(1).max(40),
  preferredTime: z.string().trim().min(1).max(40),
  participants: z.coerce.number().int().min(2).max(50).optional(),
  notes: z.string().trim().max(1500).optional(),
})

export async function POST(request: Request) {
  const parsed = tripDetailsSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Fill in every required field.' },
      { status: 400 }
    )
  }
  const data = parsed.data

  const offer = await getCoachingOfferByName(data.offerName)
  if (!offer || !offer.requiresTripDetails) {
    return NextResponse.json({ error: 'This session does not need trip details.' }, { status: 404 })
  }
  if (offer.category === 'couples' && !data.participants) {
    return NextResponse.json({ error: 'Enter the number of participants.' }, { status: 400 })
  }

  const normalizedEmail = normalizeEmail(data.email)!
  const subject = `Trip details: ${offer.name}`
  const detailLines = [
    `Location: ${data.location}`,
    `Preferred date: ${data.preferredDate}`,
    `Preferred time: ${data.preferredTime}`,
    data.participants ? `Participants: ${data.participants}` : null,
    data.notes ? `Additional information: ${data.notes}` : null,
  ].filter(Boolean)
  const body = detailLines.join('\n')

  await db.$transaction(async (tx) => {
    let contact = await tx.crmContact.findFirst({ where: { normalizedEmail, deletedAt: null } })
    if (!contact) {
      const parts = data.name.split(/\s+/)
      contact = await tx.crmContact.create({
        data: {
          firstName: parts[0],
          lastName: parts.slice(1).join(' ') || null,
          displayName: contactDisplayName(parts[0], parts.slice(1).join(' ')),
          primaryEmail: data.email,
          normalizedEmail,
          primaryPhone: data.phone,
          normalizedPhone: normalizePhone(data.phone),
          lifecycleStage: 'lead',
          relationshipTypes: ['lead'],
          source: 'coaching-trip-details',
          nextActionAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
        },
      })
    }

    await tx.crmActivity.create({
      data: {
        contactId: contact.id,
        type: 'enquiry',
        direction: 'inbound',
        subject,
        body,
        channel: 'website',
        metadata: { ...data },
      },
    })
    await tx.crmTask.create({
      data: {
        title: `Arrange travel: ${offer.name} for ${data.name}`,
        description: `${subject}\n\n${body}`,
        dueAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
        priority: 'high',
        contactId: contact.id,
      },
    })
    await tx.crmContact.update({
      where: { id: contact.id },
      data: { lastActivityAt: new Date(), nextActionAt: new Date(Date.now() + 4 * 60 * 60 * 1000) },
    })
  })

  return NextResponse.json({ status: 'ok' }, { status: 201 })
}
