const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

const bookTitles = [
  ['understanding-the-marketplace', 'Understanding the Marketplace'],
  [
    'the-unhealed-traumas-of-our-parents',
    'The Unhealed Traumas of Our Parents',
  ],
  ['the-greatest-tragedy', 'The Greatest Tragedy Is Not Death'],
  ['the-great-deception-of-pornography', 'The Great Deception of Pornography'],
  ['emotional-blackmail', 'Emotional Blackmail'],
  [
    'time-money-pornography-and-the-glory-of-god',
    'Time, Money, Pornography and the Glory of God',
  ],
  ['the-great-deception', 'The Great Deception'],
  ['the-cost-of-infidelity', 'The Cost of Infidelity'],
  ['ritual-scorecard', 'Ritual Scorecard'],
  [
    'pornography-and-the-death-of-purpose',
    'Pornography and the Death of Purpose',
  ],
  ['god-do-you-need-my-money', 'God, Do You Need My Money?'],
  ['digital-economic-systems-decoded', 'Digital Economic Systems Decoded'],
  ['unless-they-kill-god', 'Unless They Kill God'],
  ['concealed-redemption', 'Concealed Redemption'],
]

const programTitles = [
  ['The Identity Reformation Program', 25000],
  ['Kingdom Mentality Masterclass', 2500],
  ['Defining Manhood Bootcamp', 25000],
  ['Relationship Intelligence Program', 20000],
  ['The Discipline and Execution System', 20000],
  ['Hekima Inner Circle', 20000],
  ['Healing and Restoration Intensive', 15000],
]

const pipelineDefinitions = [
  ['Coaching & Consulting', 'coaching'],
  ['Speaking Engagements', 'speaking'],
  ['Academy & Programs', 'academy'],
  ['Books & Resources', 'books'],
  ['Community & Mission', 'community'],
  ['Partnerships & Sponsorships', 'partnerships'],
]
const stages = [
  ['New', 10],
  ['Qualified', 30],
  ['Proposal', 55],
  ['Decision', 80],
  ['Won', 100],
  ['Lost', 0],
]
const normalizeEmail = (value) => value && value.trim().toLowerCase()

async function upsertContact({
  name,
  email,
  source,
  lifecycleStage = 'lead',
  types = [lifecycleStage],
  ownerId,
}) {
  if (!email) return null
  const normalizedEmail = normalizeEmail(email)
  const existing = await db.crmContact.findFirst({
    where: { normalizedEmail, deletedAt: null },
  })
  if (existing) return existing
  const parts = (name || email.split('@')[0]).trim().split(/\s+/)
  return db.crmContact.create({
    data: {
      firstName: parts[0],
      lastName: parts.slice(1).join(' ') || null,
      displayName: parts.join(' '),
      primaryEmail: email,
      normalizedEmail,
      lifecycleStage,
      relationshipTypes: types,
      source,
      ownerId,
      nextActionAt:
        lifecycleStage === 'lead' ? new Date(Date.now() + 86400000) : null,
    },
  })
}

async function main() {
  const owner = await db.user.findFirst({
    where: { isAdmin: true },
    orderBy: { createdAt: 'asc' },
  })
  if (owner)
    await db.user.update({
      where: { id: owner.id },
      data: { crmRole: 'owner' },
    })

  for (const [name, businessLine] of pipelineDefinitions) {
    let pipeline = await db.crmPipeline.findFirst({ where: { name } })
    if (!pipeline)
      pipeline = await db.crmPipeline.create({ data: { name, businessLine } })
    for (let position = 0; position < stages.length; position++) {
      const [stageName, probability] = stages[position]
      await db.crmPipelineStage.upsert({
        where: { pipelineId_position: { pipelineId: pipeline.id, position } },
        update: {
          name: stageName,
          probability,
          isWon: stageName === 'Won',
          isLost: stageName === 'Lost',
        },
        create: {
          pipelineId: pipeline.id,
          position,
          name: stageName,
          probability,
          isWon: stageName === 'Won',
          isLost: stageName === 'Lost',
        },
      })
    }
  }

  for (const [slug, title] of bookTitles)
    await db.crmProduct.upsert({
      where: { sku: `BOOK-${slug.toUpperCase()}` },
      update: { name: title, priceMinor: 149900, isActive: true },
      create: {
        sku: `BOOK-${slug.toUpperCase()}`,
        name: title,
        type: 'book',
        businessLine: 'books',
        priceMinor: 149900,
        stockOnHand: 0,
        reorderLevel: 10,
      },
    })
  for (const [name, price] of programTitles) {
    const existing = await db.crmProgram.findFirst({ where: { name } })
    if (!existing)
      await db.crmProgram.create({
        data: {
          name,
          type: 'program',
          status: 'enrolling',
          priceMinor: price * 100,
        },
      })
  }
  for (const provider of ['paystack', 'paypal', 'mpesa', 'email', 'whatsapp'])
    await db.crmIntegration.upsert({
      where: { provider },
      update: {},
      create: {
        provider,
        status: ['paystack'].includes(provider) ? 'configured' : 'disconnected',
      },
    })

  const users = await db.user.findMany()
  for (const user of users)
    await upsertContact({
      name: user.name,
      email: user.email,
      source: 'website-account',
      lifecycleStage: 'client',
      types: ['client'],
      ownerId: owner?.id,
    })
  const subscribers = await db.newsletterSubscriber.findMany()
  for (const subscriber of subscribers)
    await upsertContact({
      email: subscriber.email,
      source: 'newsletter',
      lifecycleStage: 'subscriber',
      types: ['subscriber'],
      ownerId: owner?.id,
    })
  const questions = await db.askSalimQuestion.findMany({
    where: { askerEmail: { not: null } },
  })
  for (const question of questions)
    await upsertContact({
      name: question.askerName,
      email: question.askerEmail,
      source: 'ask-salim',
      lifecycleStage: 'lead',
      types: ['lead', 'audience'],
      ownerId: owner?.id,
    })
  const bookings = await db.booking.findMany()
  for (const booking of bookings) {
    const contact = await upsertContact({
      name: booking.name,
      email: booking.email,
      source: booking.source,
      lifecycleStage: 'client',
      types: ['client'],
      ownerId: owner?.id,
    })
    if (booking.paystackReference && booking.amountKobo)
      await db.crmTransaction.upsert({
        where: { externalReference: booking.paystackReference },
        update: { contactId: contact?.id },
        create: {
          externalReference: booking.paystackReference,
          contactId: contact?.id,
          provider: 'paystack',
          method: 'card_or_mobile_money',
          status: 'successful',
          reconciliationStatus: 'reconciled',
          businessLine: 'coaching',
          grossMinor: booking.amountKobo,
          netMinor: booking.amountKobo,
          paidAt: booking.createdAt,
          metadata: { bookingId: booking.id, offerName: booking.offerName },
        },
      })
  }
  await db.crmAuditEvent.create({
    data: {
      actorId: owner?.id,
      action: 'seed',
      entityType: 'CrmSystem',
      summary:
        'Synchronized Salim site catalog and existing relationship sources into CRM',
    },
  })
  console.log(
    `CRM ready: ${bookTitles.length} books, ${programTitles.length} programs, ${pipelineDefinitions.length} pipelines.`
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
