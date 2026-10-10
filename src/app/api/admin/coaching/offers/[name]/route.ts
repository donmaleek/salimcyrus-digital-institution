import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireCrmApi } from '@/services/crm/access'
import { db } from '@/lib/db'
import { coachingOffers } from '@/lib/data/coaching-offers'

const updateSchema = z.object({
  priceKes: z.coerce.number().int().min(1).max(10_000_000).nullable(),
  priceUsd: z.coerce.number().int().min(1).max(100_000).nullable(),
  duration: z.string().trim().min(1).max(100).nullable(),
  tagline: z.string().trim().min(1).max(500).nullable(),
  location: z.string().trim().min(1).max(200).nullable(),
})

/**
 * Upserts (or, with every field null, clears) the admin override for one
 * coaching offer, keyed by its exact static name. Each field is
 * independent and nullable: sending only a changed price with every other
 * field null leaves duration/tagline/location at their static defaults,
 * it never blanks them out. See coaching-catalog.ts for how this merges
 * back with the static offer at read time.
 */
export async function PUT(request: NextRequest, props: { params: Promise<{ name: string }> }) {
  if (!(await requireCrmApi('content:write'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const params = await props.params
  const offerName = decodeURIComponent(params.name)

  if (!coachingOffers.some((offer) => offer.name === offerName)) {
    return NextResponse.json({ error: 'Unknown coaching offer.' }, { status: 404 })
  }

  const parsed = updateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input.' }, { status: 400 })
  }

  const override = await db.coachingOfferOverride.upsert({
    where: { offerName },
    create: { offerName, ...parsed.data },
    update: { ...parsed.data },
  })

  return NextResponse.json({ override })
}

/** Removes the override entirely, reverting the offer to its static defaults. */
export async function DELETE(_request: NextRequest, props: { params: Promise<{ name: string }> }) {
  if (!(await requireCrmApi('content:write'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const params = await props.params
  const offerName = decodeURIComponent(params.name)

  await db.coachingOfferOverride.deleteMany({ where: { offerName } })
  return NextResponse.json({ status: 'ok' })
}
